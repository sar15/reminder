/**
 * POST /api/portal/upload
 * Client uploads documents via their magic-link portal.
 * - Validates token + task_id
 * - Uploads file to Supabase Storage
 * - Inserts record into documents table
 * - Updates task status to docs_received
 * - Emails CA firm partner (with retry)
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { formatComplianceType } from "@/lib/utils";
import { buildCANotificationEmail } from "@/lib/reminder-dispatch";
import { withRetry, isTransientError } from "@/lib/retry";
import { getBaseUrl } from "@/lib/url";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const token   = formData.get("token") as string | null;
    const taskId  = formData.get("task_id") as string | null;
    const files   = formData.getAll("files") as File[];

    // ── Input validation ────────────────────────────────────
    if (!token?.trim()) {
      return apiError("Token is required", ErrorCode.VALIDATION_ERROR, 400);
    }
    if (!taskId?.trim()) {
      return apiError("task_id is required", ErrorCode.VALIDATION_ERROR, 400);
    }
    // Basic UUID format check
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_REGEX.test(taskId)) {
      return apiError("Invalid task_id format", ErrorCode.VALIDATION_ERROR, 400);
    }
    if (files.length === 0) {
      return apiError("At least one file is required", ErrorCode.VALIDATION_ERROR, 400);
    }

    // ── File size & type validation ─────────────────────────
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_EXTENSIONS = new Set([
      ".pdf", ".xlsx", ".xls", ".csv", ".doc", ".docx",
      ".jpg", ".jpeg", ".png", ".gif", ".webp",
      ".zip", ".rar", ".7z",
      ".tiff", ".tif", ".bmp",
    ]);

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return apiError(
          `File "${file.name}" exceeds 10MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`,
          ErrorCode.VALIDATION_ERROR,
          400
        );
      }
      const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        return apiError(
          `File type "${ext}" is not allowed. Accepted: PDF, Excel, Word, images, archives.`,
          ErrorCode.VALIDATION_ERROR,
          400
        );
      }
    }

    const supabase = createAdminClient();

    // 1. Validate magic link token
    const { data: link, error: linkErr } = await supabase
      .from("client_magic_links")
      .select("*, clients(*)")
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (linkErr || !link) {
      return apiError("Invalid or expired link", ErrorCode.EXPIRED_TOKEN, 401);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = link.clients as any;

    // 2. Validate task belongs to this client
    const { data: task, error: taskErr } = await supabase
      .from("compliance_tasks")
      .select("*")
      .eq("id", taskId)
      .eq("client_id", client.id)
      .single();

    if (taskErr || !task) {
      return apiError("Task not found or does not belong to this client", ErrorCode.NOT_FOUND, 404);
    }

    // 3. Upload each file to Supabase Storage
    const uploadedFiles: { name: string; path: string; size: number }[] = [];

    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path     = `${client.id}/${taskId}/${Date.now()}_${safeName}`;
      const buffer   = Buffer.from(await file.arrayBuffer());

      const { error: uploadErr } = await supabase.storage
        .from("client-documents")
        .upload(path, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (uploadErr) {
        console.error("[Upload Error]", uploadErr.message);
        continue; // skip this file, try others
      }

      // 4. Insert document record
      await supabase.from("documents").insert({
        task_id:           taskId,
        client_id:         client.id,
        firm_id:           task.firm_id,
        file_name:         safeName,
        file_path:         path,
        file_size:         file.size,
        uploaded_by_client: true,
      });

      uploadedFiles.push({ name: safeName, path, size: file.size });
    }

    if (uploadedFiles.length === 0) {
      return apiError("All file uploads failed", ErrorCode.UPLOAD_FAILED, 500);
    }

    // 5. Update task status → docs_received
    await supabase
      .from("compliance_tasks")
      .update({ status: "docs_received", updated_at: new Date().toISOString() })
      .eq("id", taskId);

    // 6. Log to audit trail
    await supabase.from("audit_log").insert({
      task_id:      taskId,
      firm_id:      task.firm_id,
      client_id:    client.id,
      action:       "doc_uploaded",
      channel:      null,
      message_id:   null,
      metadata: {
        files:       uploadedFiles.map((f) => f.name),
        file_count:  uploadedFiles.length,
        uploaded_by: "client_portal",
      },
    });

    // 7. Email CA firm partner (with retry — non-blocking failure)
    if (resend) {
      try {
        const complianceName = formatComplianceType(task.compliance_type);
        const clientDetailUrl = `${getBaseUrl()}/dashboard/clients/${client.id}`;

        const { data: firm } = await supabase
          .from("firms")
          .select("email, partner_name")
          .eq("id", task.firm_id)
          .single();

        if (firm?.email) {
          const { subject, html } = buildCANotificationEmail({
            clientName:      client.name,
            complianceName,
            fileNames:       uploadedFiles.map((f) => f.name),
            caEmail:         firm.email,
            clientDetailUrl,
          });

          await withRetry(
            () => resend.emails.send({
              from: "DeadlineShield <onboarding@resend.dev>",
              to:   [firm.email!],
              subject,
              html,
            }),
            {
              maxAttempts: 3,
              baseDelayMs: 1000,
              shouldRetry: (err) => isTransientError(err),
            }
          );
        }
      } catch (emailErr) {
        // CA notification is non-critical — log but don't fail the upload
        console.error("[CA Notification Failed]", emailErr);
      }
    }

    return apiSuccess({
      files_uploaded: uploadedFiles.length,
      files:          uploadedFiles.map((f) => f.name),
    });

  } catch (err: unknown) {
    console.error("[Upload Route Error]", err);
    return apiError(
      "An unexpected error occurred during upload",
      ErrorCode.INTERNAL_ERROR,
      500
    );
  }
}
