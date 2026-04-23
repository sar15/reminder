import { getClient, getTasksForClient, getAllAuditLogsForClient } from "@/lib/data";
import { formatComplianceType } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ClientReportPage({
  params,
}: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const [client, tasks, logs] = await Promise.all([
    getClient(clientId),
    getTasksForClient(clientId),
    getAllAuditLogsForClient(clientId),
  ]);
  if (!client) notFound();

  const remindersSent = logs.filter((l) => l.action === "reminder_sent").length;
  const docsUploaded  = logs.filter((l) => l.action === "doc_uploaded").length;
  const filedCount    = logs.filter((l) => l.action === "filed").length;
  const openedCount   = logs.filter((l) => l.action === "opened").length;

  const eventCfg: Record<string, { icon: string; label: string; bg: string; border: string; text: string }> = {
    reminder_sent: { icon: "📤", label: "Reminder Sent",       bg: "#f5f3ff", border: "#e0e7ff", text: "#4338ca" },
    delivered:     { icon: "✅", label: "Delivered",            bg: "#f0fdf4", border: "#bbf7d0", text: "#166534" },
    opened:        { icon: "👁️", label: "Opened by Client",    bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af" },
    doc_uploaded:  { icon: "📎", label: "Document Uploaded",   bg: "#f0fdf4", border: "#bbf7d0", text: "#166534" },
    filed:         { icon: "🏛️", label: "Return Filed",        bg: "#ecfdf5", border: "#6ee7b7", text: "#065f46" },
    escalated:     { icon: "🚨", label: "Escalated to Partner",bg: "#fef2f2", border: "#fecaca", text: "#991b1b" },
  };

  const statusCfg: Record<string, { bg: string; text: string }> = {
    pending:       { bg: "#f3f4f6", text: "#374151" },
    waiting_docs:  { bg: "#fef3c7", text: "#92400e" },
    docs_received: { bg: "#dbeafe", text: "#1e40af" },
    in_progress:   { bg: "#dbeafe", text: "#1e40af" },
    review_ready:  { bg: "#ede9fe", text: "#5b21b6" },
    filed:         { bg: "#d1fae5", text: "#065f46" },
    overdue:       { bg: "#fee2e2", text: "#991b1b" },
  };

  return (
    <div style={{ padding: 28, maxWidth: 860 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/reports" style={{
            width: 32, height: 32, borderRadius: 8,
            background: "#fff", border: "1px solid #e5e7eb",
            display: "flex", alignItems: "center", justifyContent: "center",
            textDecoration: "none", fontSize: 16, color: "#374151",
          }}>←</Link>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Liability Report</h1>
            <p style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
              {client.name} · Generated {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
        <Link href={`/api/reports/${clientId}/pdf`} style={{
          background: "#4f46e5", color: "#fff",
          padding: "9px 18px", borderRadius: 8,
          fontSize: 13, fontWeight: 600, textDecoration: "none",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          ↓ Download PDF
        </Link>
      </div>

      {/* Legal notice */}
      <div style={{
        background: "#f5f3ff", border: "1px solid #e0e7ff",
        borderRadius: 10, padding: "14px 18px", marginBottom: 24,
        display: "flex", gap: 12,
      }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>🛡️</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#4338ca", marginBottom: 4 }}>
            Court-Admissible Audit Document
          </div>
          <div style={{ fontSize: 12, color: "#4f46e5", lineHeight: 1.6 }}>
            Generated from an immutable, append-only audit log. All timestamps are in IST.
            This document can be presented in client disputes, ICAI disciplinary proceedings, and penalty defense cases.
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { icon: "📤", label: "Reminders Sent", value: remindersSent, bg: "#f5f3ff", text: "#4338ca" },
          { icon: "👁️", label: "Times Opened",   value: openedCount,   bg: "#eff6ff", text: "#1e40af" },
          { icon: "📎", label: "Docs Uploaded",  value: docsUploaded,  bg: "#f0fdf4", text: "#166534" },
          { icon: "🏛️", label: "Returns Filed",  value: filedCount,    bg: "#ecfdf5", text: "#065f46" },
        ].map((s) => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 18, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.text, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Client info */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 14 }}>Client Information</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { label: "Business Name", value: client.name },
            { label: "PAN",           value: client.pan ?? "—",           mono: true },
            { label: "GSTIN",         value: client.gstin ?? "—",         mono: true },
            { label: "Contact",       value: client.contact_name ?? "—" },
            { label: "Email",         value: client.email ?? "—" },
            { label: "Phone",         value: client.phone ?? "—" },
          ].map(({ label, value, mono }) => (
            <div key={label}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>
                {label}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#111827", fontFamily: mono ? "monospace" : "inherit" }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Compliance Tasks</div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
              {["Compliance", "Period", "Due Date", "Status"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "9px 18px", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, i) => {
              const s = statusCfg[task.status] ?? statusCfg.pending;
              return (
                <tr key={task.id} style={{ borderBottom: i < tasks.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "12px 18px", fontSize: 13, fontWeight: 500, color: "#111827" }}>{formatComplianceType(task.compliance_type)}</td>
                  <td style={{ padding: "12px 18px", fontSize: 12, color: "#6b7280" }}>{task.period}</td>
                  <td style={{ padding: "12px 18px", fontSize: 12, color: "#374151" }}>{task.due_date}</td>
                  <td style={{ padding: "12px 18px" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, background: s.bg, color: s.text, padding: "3px 8px", borderRadius: 20 }}>
                      {task.status.replace(/_/g, " ")}
                    </span>
                  </td>
                </tr>
              );
            })}
            {tasks.length === 0 && (
              <tr><td colSpan={4} style={{ padding: "24px 18px", textAlign: "center", fontSize: 13, color: "#9ca3af" }}>No tasks.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Audit timeline */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Communication Audit Trail</div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>{logs.length} events · Immutable</div>
        </div>
        <div style={{ padding: 20 }}>
          {logs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#9ca3af", fontSize: 13 }}>
              No communication logged yet.
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 19, top: 8, bottom: 8, width: 1, background: "#f3f4f6" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {logs.map((log) => {
                  const cfg = eventCfg[log.action] ?? { icon: "•", label: log.action, bg: "#f9fafb", border: "#e5e7eb", text: "#374151" };
                  return (
                    <div key={log.id} style={{ display: "flex", gap: 14 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: "50%",
                        background: cfg.bg, border: `1px solid ${cfg.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, flexShrink: 0, zIndex: 1,
                      }}>
                        {cfg.icon}
                      </div>
                      <div style={{
                        flex: 1, background: cfg.bg, border: `1px solid ${cfg.border}`,
                        borderRadius: 8, padding: "10px 14px",
                      }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: cfg.text }}>{cfg.label}</div>
                            {log.channel && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>via {log.channel}</div>}
                            {log.message_id && (
                              <div style={{ fontSize: 10, color: "#9ca3af", fontFamily: "monospace", marginTop: 2 }}>
                                Message ID: {log.message_id}
                              </div>
                            )}
                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                              <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>
                                {Object.entries(log.metadata).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                              </div>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: "#9ca3af", flexShrink: 0, textAlign: "right" }}>
                            {new Date(log.timestamp).toLocaleString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })} IST
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legal conclusion */}
      {logs.length > 0 && (
        <div style={{ background: "#1e293b", borderRadius: 10, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 10 }}>
            🛡️ Legal Conclusion
          </div>
          <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7 }}>
            Based on the audit trail above,{" "}
            <strong style={{ color: "#e2e8f0" }}>{remindersSent} reminder{remindersSent !== 1 ? "s were" : " was"}</strong>{" "}
            sent to <strong style={{ color: "#e2e8f0" }}>{client.name}</strong> between{" "}
            <strong style={{ color: "#e2e8f0" }}>
              {new Date(logs[0].timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
            </strong>{" "}
            and{" "}
            <strong style={{ color: "#e2e8f0" }}>
              {new Date(logs[logs.length - 1].timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </strong>.{" "}
            {docsUploaded > 0
              ? `Client uploaded ${docsUploaded} document${docsUploaded !== 1 ? "s" : ""}.`
              : "Client has not uploaded any documents as of this report."}{" "}
            <strong style={{ color: "#f1f5f9" }}>
              Any penalties incurred are attributable to client delay, not CA negligence.
            </strong>
          </p>
        </div>
      )}
    </div>
  );
}
