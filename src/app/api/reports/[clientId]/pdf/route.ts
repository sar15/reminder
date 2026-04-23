import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatComplianceType } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const supabase = createAdminClient();

  const [{ data: client }, { data: tasks }, { data: logs }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", clientId).single(),
    supabase.from("compliance_tasks").select("*").eq("client_id", clientId).order("due_date"),
    supabase.from("audit_log").select("*").eq("client_id", clientId).order("timestamp", { ascending: true }),
  ]);

  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const taskList = tasks ?? [];
  const logList  = logs  ?? [];
  const sent     = logList.filter(l => l.action === "reminder_sent").length;
  const uploaded = logList.filter(l => l.action === "doc_uploaded").length;
  const generatedAt = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const actionLabel: Record<string, string> = {
    reminder_sent: "Reminder Sent",
    delivered:     "Delivered",
    opened:        "Opened by Client",
    doc_uploaded:  "Document Uploaded",
    filed:         "Return Filed",
    escalated:     "Escalated to Partner",
  };

  const statusColor: Record<string, string> = {
    filed:        "#065F46",
    overdue:      "#991B1B",
    waiting_docs: "#92400E",
    pending:      "#57534E",
  };

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Liability Report — ${client.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; color: #1C1917; padding: 40px; background: #fff; }
    h1 { font-size: 22px; font-weight: 800; color: #1C1917; letter-spacing: -0.03em; margin-bottom: 4px; }
    h2 { font-size: 13px; font-weight: 700; color: #1C1917; margin: 24px 0 10px; padding-bottom: 6px; border-bottom: 1px solid #E8E6E3; }
    .meta { font-size: 12px; color: #A8A29E; margin-bottom: 4px; }
    .legal-notice { background: #EDE9FE; border: 1px solid #DDD6FE; border-radius: 8px; padding: 12px 16px; margin: 16px 0; }
    .legal-notice p { font-size: 12px; color: #5B21B6; line-height: 1.6; }
    .stats { display: flex; gap: 12px; margin: 16px 0; }
    .stat { background: #F5F5F4; border-radius: 8px; padding: 12px 16px; flex: 1; }
    .stat-n { font-size: 24px; font-weight: 800; color: #6D28D9; }
    .stat-l { font-size: 10px; color: #A8A29E; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.05em; }
    .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 8px; }
    .info-item label { font-size: 10px; color: #A8A29E; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 2px; }
    .info-item span { font-size: 12px; color: #1C1917; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 8px 12px; font-size: 10px; font-weight: 600; color: #A8A29E; text-transform: uppercase; letter-spacing: 0.05em; background: #F5F5F4; border-bottom: 1px solid #E8E6E3; }
    td { padding: 10px 12px; font-size: 12px; color: #374151; border-bottom: 1px solid #F5F5F4; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; }
    .timeline { position: relative; padding-left: 28px; }
    .timeline-item { position: relative; margin-bottom: 12px; }
    .timeline-dot { position: absolute; left: -22px; top: 3px; width: 14px; height: 14px; border-radius: 50%; background: #EDE9FE; border: 1px solid #DDD6FE; display: flex; align-items: center; justify-content: center; font-size: 8px; }
    .timeline-line { position: absolute; left: -16px; top: 0; bottom: -12px; width: 1px; background: #F0EFED; }
    .event-card { background: #FAFAF9; border: 1px solid #E8E6E3; border-radius: 6px; padding: 8px 12px; }
    .event-label { font-size: 12px; font-weight: 600; color: #6D28D9; }
    .event-meta { font-size: 10px; color: #A8A29E; margin-top: 2px; }
    .conclusion { background: #1C1917; border-radius: 8px; padding: 16px 20px; margin-top: 20px; }
    .conclusion p { font-size: 12px; color: #A8A29E; line-height: 1.7; }
    .conclusion strong { color: #F5F5F4; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>Liability Report</h1>
  <p class="meta">${client.name} · Generated ${generatedAt} IST</p>
  <p class="meta">This document is generated from an immutable audit log and is court-admissible.</p>

  <div class="legal-notice">
    <p>🛡️ <strong>Court-Admissible Audit Document</strong> — All timestamps are in IST. This report can be presented in client disputes, ICAI disciplinary proceedings, and penalty defense cases.</p>
  </div>

  <div class="stats">
    <div class="stat"><div class="stat-n">${sent}</div><div class="stat-l">Reminders Sent</div></div>
    <div class="stat"><div class="stat-n">${logList.filter(l => l.action === "opened").length}</div><div class="stat-l">Times Opened</div></div>
    <div class="stat"><div class="stat-n">${uploaded}</div><div class="stat-l">Docs Uploaded</div></div>
    <div class="stat"><div class="stat-n">${logList.filter(l => l.action === "filed").length}</div><div class="stat-l">Returns Filed</div></div>
  </div>

  <h2>Client Information</h2>
  <div class="info-grid">
    <div class="info-item"><label>Business Name</label><span>${client.name}</span></div>
    <div class="info-item"><label>PAN</label><span style="font-family:monospace">${client.pan ?? "—"}</span></div>
    <div class="info-item"><label>GSTIN</label><span style="font-family:monospace">${client.gstin ?? "—"}</span></div>
    <div class="info-item"><label>Contact</label><span>${client.contact_name ?? "—"}</span></div>
    <div class="info-item"><label>Email</label><span>${client.email ?? "—"}</span></div>
    <div class="info-item"><label>Phone</label><span>${client.phone ?? "—"}</span></div>
  </div>

  <h2>Compliance Tasks</h2>
  <table>
    <thead><tr><th>Compliance</th><th>Period</th><th>Due Date</th><th>Status</th></tr></thead>
    <tbody>
      ${taskList.map(t => `
        <tr>
          <td>${formatComplianceType(t.compliance_type)}</td>
          <td>${t.period}</td>
          <td>${t.due_date}</td>
          <td><span class="badge" style="background:${t.status === "filed" ? "#ECFDF5" : t.status === "overdue" ? "#FEF2F2" : "#FFFBEB"};color:${statusColor[t.status] ?? "#92400E"}">${t.status.replace(/_/g, " ")}</span></td>
        </tr>
      `).join("")}
      ${taskList.length === 0 ? '<tr><td colspan="4" style="text-align:center;color:#A8A29E">No tasks</td></tr>' : ""}
    </tbody>
  </table>

  <h2>Communication Audit Trail</h2>
  <div class="timeline">
    ${logList.map((l, i) => `
      <div class="timeline-item">
        ${i < logList.length - 1 ? '<div class="timeline-line"></div>' : ""}
        <div class="event-card">
          <div class="event-label">${actionLabel[l.action] ?? l.action}</div>
          <div class="event-meta">
            ${new Date(l.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} IST
            ${l.channel ? ` · via ${l.channel}` : ""}
            ${l.message_id ? ` · ID: ${l.message_id}` : ""}
          </div>
        </div>
      </div>
    `).join("")}
    ${logList.length === 0 ? '<p style="color:#A8A29E;font-size:12px">No communication logged yet.</p>' : ""}
  </div>

  ${logList.length > 0 ? `
  <div class="conclusion">
    <p>
      🛡️ Based on the audit trail above, <strong>${sent} reminder${sent !== 1 ? "s were" : " was"}</strong> sent to 
      <strong>${client.name}</strong> between 
      <strong>${new Date(logList[0].timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}</strong> and 
      <strong>${new Date(logList[logList.length - 1].timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong>.
      ${uploaded > 0 ? `Client uploaded ${uploaded} document${uploaded !== 1 ? "s" : ""}.` : "Client has not uploaded any documents as of this report."}
      <strong>Any penalties incurred are attributable to client delay, not CA negligence.</strong>
    </p>
  </div>` : ""}

  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="liability-report-${client.name.replace(/\s+/g, "-")}.html"`,
    },
  });
}
