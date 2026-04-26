/**
 * Reminder dispatch — sends email reminders with magic link portal URL.
 * Logs every send to audit_log. Updates task status after send.
 * Failed attempts are also logged for legal defensibility.
 */
import { differenceInDays, parseISO } from "date-fns";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatComplianceType } from "@/lib/utils";
import { generateMagicLink } from "@/lib/magic-link";
import { withRetry, isTransientError } from "@/lib/retry";
import type { ReminderCadence, ReminderChannel } from "@/lib/reminder-rules";
import type { Database } from "@/types/database";

type AdminClient = ReturnType<typeof createAdminClient>;
type TaskRow = Database["public"]["Tables"]["compliance_tasks"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type AuditLogRow = Database["public"]["Tables"]["audit_log"]["Row"];

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// ── Copy per cadence ──────────────────────────────────────────
const CADENCE_COPY: Record<ReminderCadence, { headline: string; body: string }> = {
  "T-7": {
    headline: "7 days to deadline",
    body: "Your compliance filing is due in 7 days. Please upload the required documents as soon as possible so we can file on time.",
  },
  "T-3": {
    headline: "3 days left — urgent",
    body: "URGENT: Your filing deadline is in 3 days. We have not received your documents yet. Please upload them immediately to avoid late fees and penalties.",
  },
  "T-1": {
    headline: "Final notice — due tomorrow",
    body: "FINAL NOTICE: Your filing is due tomorrow. If documents are not received today, we cannot guarantee timely filing. Penalties will apply from the due date.",
  },
};

// ── Required documents per compliance type ────────────────────
const REQUIRED_DOCS: Record<string, string[]> = {
  GSTR1:          ["Sales Register", "Invoice Summary", "E-way Bills (if any)"],
  GSTR3B:         ["Bank Statement", "Sales Register", "Purchase Register", "Expense Invoices"],
  TDS_PAYMENT:    ["Salary Sheet", "Vendor Payment Details"],
  TDS_RETURN_24Q: ["Salary Details", "TDS Certificates (Form 16)"],
  TDS_RETURN_26Q: ["Vendor PAN Details", "Payment Summary", "TDS Certificates"],
  ITR_NON_AUDIT:  ["Bank Statements (all)", "Investment Proofs", "Form 16"],
  ITR_AUDIT:      ["Audited Balance Sheet", "P&L Statement", "Bank Statements"],
  ADVANCE_TAX:    ["Estimated Income Statement", "Previous Year ITR"],
  AOC4:           ["Audited Financial Statements", "Board Resolution"],
  MGT7:           ["Shareholder Register", "Director Details"],
  PF:             ["Salary Sheet", "Employee PF Details", "ECR File"],
  ESI:            ["Salary Sheet", "Employee ESI Details"],
  DEFAULT:        ["Relevant Documents", "Bank Statement"],
};

// ── Email builder ─────────────────────────────────────────────
function buildReminderEmail({
  client,
  task,
  cadence,
  portalUrl,
}: {
  client: ClientRow;
  task: TaskRow;
  cadence: ReminderCadence;
  portalUrl: string;
}) {
  const copy = CADENCE_COPY[cadence];
  const complianceName = formatComplianceType(task.compliance_type);
  const dueDate = new Date(task.due_date).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
  const docs = REQUIRED_DOCS[task.compliance_type] ?? REQUIRED_DOCS.DEFAULT;
  const isUrgent = cadence === "T-1";
  const isFinal  = cadence === "T-3" || cadence === "T-1";

  const subject = isUrgent
    ? `🚨 Final Notice: ${complianceName} due tomorrow`
    : isFinal
    ? `⚠️ Urgent: ${complianceName} due in 3 days`
    : `Action Required: ${complianceName} due in 7 days`;

  const accentColor = isUrgent ? "#dc2626" : isFinal ? "#d97706" : "#2563eb";

  const docRows = docs
    .map(
      (doc) =>
        `<tr><td style="padding:5px 0;font-size:13px;color:#374151;">☐ ${doc}</td></tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">

  <!-- Header -->
  <div style="background:${accentColor};padding:20px 28px;">
    <div style="font-size:13px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;">DeadlineShield</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.75);margin-top:2px;">Compliance Reminder · ${copy.headline}</div>
  </div>

  <!-- Body -->
  <div style="padding:28px;">
    <p style="margin:0 0 6px;font-size:16px;font-weight:600;color:#111827;">
      Dear ${client.contact_name ?? client.name},
    </p>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#6b7280;">
      ${copy.body}
    </p>

    <!-- Compliance details -->
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:5px 0;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;width:110px;">Compliance</td>
          <td style="padding:5px 0;font-size:13px;font-weight:600;color:#111827;">${complianceName}</td>
        </tr>
        <tr>
          <td style="padding:5px 0;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;">Due Date</td>
          <td style="padding:5px 0;font-size:13px;font-weight:700;color:${accentColor};">${dueDate}</td>
        </tr>
        <tr>
          <td style="padding:5px 0;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;">Period</td>
          <td style="padding:5px 0;font-size:13px;color:#111827;">${task.period}</td>
        </tr>
        ${client.pan ? `<tr><td style="padding:5px 0;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;">PAN</td><td style="padding:5px 0;font-size:13px;color:#111827;font-family:monospace;">${client.pan}</td></tr>` : ""}
      </table>
    </div>

    <!-- Documents required -->
    <div style="margin-bottom:24px;">
      <div style="font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px;">
        Documents Required
      </div>
      <table style="width:100%;border-collapse:collapse;">
        ${docRows}
      </table>
    </div>

    <!-- CTA button -->
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${portalUrl}"
         style="display:inline-block;background:${accentColor};color:#ffffff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;letter-spacing:-0.01em;">
        Upload Documents Now →
      </a>
      <div style="margin-top:10px;font-size:11px;color:#9ca3af;">
        No login required · Link valid for 7 days
      </div>
    </div>

    <p style="margin:0;font-size:11px;line-height:1.6;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:16px;">
      This is a confidential, personalised message sent only to you. Do not forward this email.
      Every reminder is logged with a timestamp in your CA firm's immutable audit trail.
    </p>
  </div>
</div>
</body>
</html>`;

  return { subject, html };
}

// ── CA notification email ─────────────────────────────────────
export function buildCANotificationEmail({
  clientName,
  complianceName,
  fileNames,
  caEmail,
  clientDetailUrl,
}: {
  clientName: string;
  complianceName: string;
  fileNames: string[];
  caEmail: string;
  clientDetailUrl: string;
}) {
  const subject = `📎 ${clientName} uploaded ${fileNames.length} document${fileNames.length > 1 ? "s" : ""} — ${complianceName}`;

  const fileList = fileNames
    .map((f) => `<li style="padding:3px 0;font-size:13px;color:#374151;">${f}</li>`)
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:520px;margin:32px auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
  <div style="background:#059669;padding:18px 24px;">
    <div style="font-size:13px;font-weight:700;color:#fff;">DeadlineShield</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.75);margin-top:2px;">Client Document Upload</div>
  </div>
  <div style="padding:24px;">
    <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#111827;">
      📎 ${clientName} uploaded documents
    </p>
    <p style="margin:0 0 16px;font-size:13px;color:#6b7280;line-height:1.6;">
      <strong>${clientName}</strong> has uploaded ${fileNames.length} file${fileNames.length > 1 ? "s" : ""} for <strong>${complianceName}</strong>.
      The task status has been updated to <strong>Docs Received</strong>.
    </p>
    <div style="background:#f0fdf4;border:1px solid #a7f3d0;border-radius:8px;padding:14px;margin-bottom:20px;">
      <div style="font-size:11px;font-weight:700;color:#065f46;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;">Files Uploaded</div>
      <ul style="margin:0;padding-left:16px;">${fileList}</ul>
    </div>
    <a href="${clientDetailUrl}"
       style="display:inline-block;background:#2563eb;color:#fff;font-size:13px;font-weight:600;padding:11px 24px;border-radius:7px;text-decoration:none;">
      Open Client Dashboard →
    </a>
  </div>
</div>
</body>
</html>`;

  return { subject, html };
}

// ── Dedup check ───────────────────────────────────────────────
function cadenceAlreadySent(
  logs: Pick<AuditLogRow, "task_id" | "channel" | "metadata">[],
  taskId: string,
  cadence: ReminderCadence,
  channel: ReminderChannel
) {
  return logs.some((log) => {
    const meta =
      log.metadata &&
      typeof log.metadata === "object" &&
      !Array.isArray(log.metadata)
        ? (log.metadata as Record<string, unknown>)
        : null;
    return (
      log.task_id === taskId &&
      log.channel === channel &&
      meta?.cadence === cadence
    );
  });
}

export function shouldSendCadence(
  task: Pick<TaskRow, "due_date">,
  offsetDays: number,
  today = new Date()
) {
  // Normalize to IST date (UTC+5:30) to prevent off-by-one when cron runs at 21:30 UTC
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(today.getTime() + istOffset);
  const istDate = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate());
  return differenceInDays(parseISO(task.due_date), istDate) === offsetDays;
}

// ── Main send function ────────────────────────────────────────
export async function sendTaskReminder({
  supabase,
  task,
  client,
  cadence,
  channels,
  automated = false,
}: {
  supabase: AdminClient;
  task: TaskRow;
  client: ClientRow;
  cadence: ReminderCadence;
  channels: ReminderChannel[];
  automated?: boolean;
}) {
  const results: Record<
    string,
    { success: boolean; skipped?: boolean; error?: string; message_id?: string | null }
  > = {};

  if (channels.includes("email")) {
    if (!client.email) {
      results.email = { success: false, skipped: true, error: "No email address" };
    } else if (!resend) {
      results.email = { success: false, skipped: true, error: "RESEND_API_KEY not set" };
    } else {
      // Generate a fresh magic link for this reminder. If this fails, do not send
      // a reminder with a broken or demo portal URL.
      let portalUrl: string;
      try {
        const link = await generateMagicLink(client.id, task.firm_id, task.id);
        portalUrl = link.url;
      } catch (linkError: unknown) {
        const errMsg = linkError instanceof Error
          ? linkError.message
          : "Failed to generate secure portal link";

        results.email = { success: false, error: errMsg };
        await supabase.from("audit_log").insert({
          task_id: task.id,
          firm_id: task.firm_id,
          client_id: task.client_id,
          action: "reminder_failed",
          channel: "email",
          message_id: null,
          metadata: {
            cadence,
            automated,
            to: client.email,
            error: errMsg,
            stage: "magic_link_generation",
          },
        });
        return { success: false, results };
      }

      const { subject, html } = buildReminderEmail({ client, task, cadence, portalUrl });

      try {
        const { data, error } = await withRetry(
          () => resend.emails.send({
            from: "DeadlineShield <onboarding@resend.dev>",
            to: [client.email!],
            subject,
            html,
          }),
          {
            maxAttempts: 3,
            baseDelayMs: 1000,
            shouldRetry: (err) => isTransientError(err),
            onRetry: (err, attempt) => {
              console.warn(`[Email Retry] Attempt ${attempt} failed for task ${task.id}:`, err);
            },
          }
        );

        if (error) {
          results.email = { success: false, error: error.message };

          // Log the failed attempt — CA still has proof the system tried
          await supabase.from("audit_log").insert({
            task_id: task.id,
            firm_id: task.firm_id,
            client_id: task.client_id,
            action: "reminder_failed",
            channel: "email",
            message_id: null,
            metadata: { cadence, automated, subject, to: client.email, error: error.message },
          });
        } else {
          results.email = { success: true, message_id: data?.id ?? null };

          await supabase.from("audit_log").insert({
            task_id: task.id,
            firm_id: task.firm_id,
            client_id: task.client_id,
            action: "reminder_sent",
            channel: "email",
            message_id: data?.id ?? null,
            metadata: { cadence, automated, subject, to: client.email },
          });
        }
      } catch (retryExhaustedError: unknown) {
        // All 3 retries failed — log it so CA has evidence
        const errMsg = retryExhaustedError instanceof Error
          ? retryExhaustedError.message
          : "Unknown error after 3 retries";

        results.email = { success: false, error: errMsg };

        await supabase.from("audit_log").insert({
          task_id: task.id,
          firm_id: task.firm_id,
          client_id: task.client_id,
          action: "reminder_failed",
          channel: "email",
          message_id: null,
          metadata: {
            cadence,
            automated,
            subject,
            to: client.email,
            error: errMsg,
            retries_exhausted: true,
          },
        });
      }
    }
  }

  // Update task to waiting_docs after first successful send
  if (
    task.status === "pending" &&
    Object.values(results).some((r) => r.success)
  ) {
    await supabase
      .from("compliance_tasks")
      .update({ status: "waiting_docs", updated_at: new Date().toISOString() })
      .eq("id", task.id);
  }

  return {
    success: Object.values(results).some((r) => r.success),
    results,
  };
}

export function getEligibleChannels({
  channels,
  client,
  existingLogs,
  taskId,
  cadence,
}: {
  channels: ReminderChannel[];
  client: ClientRow;
  existingLogs: Pick<AuditLogRow, "task_id" | "channel" | "metadata">[];
  taskId: string;
  cadence: ReminderCadence;
}) {
  return channels.filter((ch) => {
    if (ch === "email" && !client.email) return false;
    return !cadenceAlreadySent(existingLogs, taskId, cadence, ch);
  });
}
