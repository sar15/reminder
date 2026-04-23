import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { formatComplianceType } from "@/lib/utils";

const resend = new Resend(process.env.RESEND_API_KEY);

const PREVIEW_BODY: Record<string, string> = {
  "T-15": "This is a friendly reminder that your compliance filing is due in 15 days. Please start gathering the required documents at your earliest convenience.",
  "T-10": "Your compliance filing is due in 10 days. Please upload the required documents: Bank Statement, Sales Register, Purchase Register, and Expense Invoices.",
  "T-7":  "Your filing deadline is in 7 days. We have not yet received your documents. Please upload them immediately to avoid any delays.",
  "T-3":  "URGENT: Your filing deadline is in 3 days. Documents have not been received. Failure to upload by tomorrow may result in late fees and penalties.",
  "T-1":  "FINAL NOTICE: Your filing is due TOMORROW. If documents are not received today, we cannot guarantee timely filing. Penalties will apply.",
  "T+1":  "Your filing deadline has passed. Penalties are now accruing daily. Please upload documents immediately and contact us to discuss next steps.",
  "T+3":  "Your filing is now 3 days overdue. Penalties are accruing. Please contact us immediately to discuss next steps and minimize further penalties.",
};

export async function POST(req: NextRequest) {
  try {
    const { task_id, cadence = "T-3", channels = ["email"] } = await req.json();

    if (!task_id) {
      return NextResponse.json({ error: "task_id required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch task + client
    const { data: task, error: taskErr } = await supabase
      .from("compliance_tasks")
      .select("*, clients(*)")
      .eq("id", task_id)
      .single();

    if (taskErr || !task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const client = task.clients as any;
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const results: Record<string, any> = {};

    // ── Email ──────────────────────────────────────────────────
    if (channels.includes("email") && client.email) {
      const complianceName = formatComplianceType(task.compliance_type);
      const dueDate = new Date(task.due_date).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      });
      const subject = cadence === "T+1" || cadence === "T+3"
        ? `⚠️ Overdue: ${complianceName} — Action Required`
        : cadence === "T-1"
        ? `🚨 Final Notice: ${complianceName} due tomorrow`
        : `Action Required: ${complianceName} due ${dueDate}`;

      const bodyText = PREVIEW_BODY[cadence] ?? PREVIEW_BODY["T-3"];

      const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #FAFAF9; margin: 0; padding: 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; border: 1px solid #E8E6E3; overflow: hidden;">
    
    <div style="background: #6D28D9; padding: 20px 24px;">
      <div style="font-size: 13px; font-weight: 700; color: #fff; letter-spacing: -0.01em;">DeadlineShield</div>
      <div style="font-size: 11px; color: #C4B5FD; margin-top: 2px;">Compliance Reminder</div>
    </div>

    <div style="padding: 24px;">
      <p style="font-size: 15px; font-weight: 600; color: #1C1917; margin: 0 0 8px;">Dear ${client.contact_name ?? client.name},</p>
      <p style="font-size: 14px; color: #57534E; line-height: 1.6; margin: 0 0 20px;">${bodyText}</p>

      <div style="background: #F5F5F4; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-size: 12px; color: #A8A29E; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; width: 120px;">Compliance</td>
            <td style="padding: 6px 0; font-size: 13px; color: #1C1917; font-weight: 600;">${complianceName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 12px; color: #A8A29E; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Due Date</td>
            <td style="padding: 6px 0; font-size: 13px; color: ${cadence.startsWith("T+") ? "#DC2626" : "#1C1917"}; font-weight: 700;">${dueDate}</td>
          </tr>
          ${client.pan ? `<tr>
            <td style="padding: 6px 0; font-size: 12px; color: #A8A29E; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">PAN</td>
            <td style="padding: 6px 0; font-size: 13px; color: #1C1917; font-family: monospace;">${client.pan}</td>
          </tr>` : ""}
          <tr>
            <td style="padding: 6px 0; font-size: 12px; color: #A8A29E; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Period</td>
            <td style="padding: 6px 0; font-size: 13px; color: #1C1917;">${task.period}</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 12px; color: #A8A29E; margin: 0; line-height: 1.5;">
        This is a confidential, personalized message sent only to you. Please do not forward this email.
        <br>Your CA firm uses DeadlineShield to ensure timely compliance filing.
      </p>
    </div>

    <div style="background: #F5F5F4; padding: 14px 24px; border-top: 1px solid #E8E6E3;">
      <p style="font-size: 11px; color: #A8A29E; margin: 0;">
        Sent by DeadlineShield · This message is logged with timestamp for compliance records.
      </p>
    </div>
  </div>
</body>
</html>`;

      const { data: emailData, error: emailErr } = await resend.emails.send({
        from: "DeadlineShield <onboarding@resend.dev>",
        to: [client.email],
        subject,
        html,
      });

      if (emailErr) {
        results.email = { success: false, error: emailErr.message };
      } else {
        results.email = { success: true, message_id: emailData?.id };

        // Log to audit trail
        await supabase.from("audit_log").insert({
          task_id,
          firm_id: task.firm_id,
          client_id: task.client_id,
          action: "reminder_sent",
          channel: "email",
          message_id: emailData?.id ?? null,
          metadata: { cadence, subject, to: client.email },
        });
      }
    }

    // Update task status to waiting_docs if still pending
    if (task.status === "pending") {
      await supabase
        .from("compliance_tasks")
        .update({ status: "waiting_docs" })
        .eq("id", task_id);
    }

    return NextResponse.json({ success: true, results });

  } catch (err: any) {
    console.error("Send reminder error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
