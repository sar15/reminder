"use server";

import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { formatComplianceType } from "@/lib/utils";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReminder(taskId: string, cadence: string = "T-3") {
  const supabase = await createClient();

  // Fetch task with client details
  const { data: task, error: taskError } = await supabase
    .from("compliance_tasks")
    .select("*, clients(*)")
    .eq("id", taskId)
    .single();

  if (taskError || !task) {
    return { success: false, error: "Task not found" };
  }

  const client = task.clients;
  if (!client?.email) {
    return { success: false, error: "Client has no email address" };
  }

  const complianceName = formatComplianceType(task.compliance_type);
  const dueDate = new Date(task.due_date).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  // Build personalized email (1-to-1, never CC'd)
  const subject = `Action Required: ${complianceName} due on ${dueDate}`;
  const body = buildEmailBody({
    clientName: client.contact_name ?? client.name,
    complianceName,
    dueDate,
    pan: client.pan,
    cadence,
  });

  // Send via Resend
  const { data: emailData, error: emailError } = await resend.emails.send({
    from: "CA Compliance Shield <noreply@yourdomain.com>",
    to: [client.email],
    subject,
    html: body,
  });

  if (emailError) {
    return { success: false, error: emailError.message };
  }

  // Log to immutable audit trail
  const { data: { user } } = await supabase.auth.getUser();

  await supabase.from("audit_log").insert({
    task_id: taskId,
    firm_id: task.firm_id,
    client_id: task.client_id,
    action: "reminder_sent",
    channel: "email",
    message_id: emailData?.id ?? null,
    metadata: { cadence, subject, to: client.email },
    performed_by: user?.id ?? null,
  });

  // Update task status to waiting_docs if still pending
  if (task.status === "pending") {
    await supabase
      .from("compliance_tasks")
      .update({ status: "waiting_docs", updated_at: new Date().toISOString() })
      .eq("id", taskId);
  }

  return { success: true, messageId: emailData?.id };
}

function buildEmailBody({
  clientName,
  complianceName,
  dueDate,
  pan,
  cadence,
}: {
  clientName: string;
  complianceName: string;
  dueDate: string;
  pan: string | null;
  cadence: string;
}) {
  const urgencyText =
    cadence === "T-1"
      ? "⚠️ FINAL REMINDER — Filing is due TOMORROW."
      : cadence === "T-3"
      ? "This is an important reminder — your filing is due in 3 days."
      : "Please take action to avoid late fees and penalties.";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1e1b4b;">Action Required: ${complianceName}</h2>
      <p>Dear ${clientName},</p>
      <p>${urgencyText}</p>
      <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">Compliance</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${complianceName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">Due Date</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb; color: #dc2626; font-weight: bold;">${dueDate}</td>
        </tr>
        ${pan ? `<tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">PAN</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${pan}</td>
        </tr>` : ""}
      </table>
      <p>To avoid penalties, please share the required documents at the earliest.</p>
      <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
        This is a personalized reminder sent only to you. Please do not share this email.
      </p>
    </div>
  `;
}
