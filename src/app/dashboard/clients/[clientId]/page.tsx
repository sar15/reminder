import { getClient, getTasksForClient, getAuditLogsForClient } from "@/lib/data";
import { formatComplianceType, daysUntilDue, getRiskLevel, getPenaltyPerDay } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import AddTaskForm from "./AddTaskForm";

export default async function ClientDetailPage({
  params,
}: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const [client, tasks, logs] = await Promise.all([
    getClient(clientId),
    getTasksForClient(clientId),
    getAuditLogsForClient(clientId),
  ]);
  if (!client) notFound();

  const activeTasks = tasks.filter((t) => t.status !== "filed");
  const filedTasks  = tasks.filter((t) => t.status === "filed");
  const riskLevel   = getRiskLevel(activeTasks);

  const penaltyExposure = activeTasks
    .filter((t) => daysUntilDue(t.due_date) < 0)
    .reduce((sum, t) => sum + getPenaltyPerDay(t.compliance_type) * Math.abs(daysUntilDue(t.due_date)), 0);

  const riskCfg = {
    red:    { label: "Critical",     bg: "#fef2f2", border: "#fecaca", text: "#991b1b", dot: "#dc2626" },
    yellow: { label: "Awaiting Docs",bg: "#fffbeb", border: "#fde68a", text: "#92400e", dot: "#d97706" },
    green:  { label: "On Track",     bg: "#f0fdf4", border: "#bbf7d0", text: "#166534", dot: "#059669" },
  }[riskLevel];

  const auditIcon: Record<string, string> = {
    reminder_sent: "📤", delivered: "✅", opened: "👁️",
    doc_uploaded: "📎", filed: "🏛️", escalated: "🚨",
  };
  const auditLabel: Record<string, string> = {
    reminder_sent: "Reminder Sent", delivered: "Delivered",
    opened: "Opened by Client", doc_uploaded: "Document Uploaded",
    filed: "Return Filed", escalated: "Escalated to Partner",
  };
  const auditColor: Record<string, string> = {
    reminder_sent: "#4f46e5", delivered: "#059669", opened: "#2563eb",
    doc_uploaded: "#059669", filed: "#065f46", escalated: "#dc2626",
  };

  const statusCfg: Record<string, { bg: string; text: string; label: string }> = {
    pending:      { bg: "#f3f4f6", text: "#374151", label: "Pending" },
    waiting_docs: { bg: "#fef3c7", text: "#92400e", label: "Waiting Docs" },
    docs_received:{ bg: "#dbeafe", text: "#1e40af", label: "Docs Received" },
    in_progress:  { bg: "#dbeafe", text: "#1e40af", label: "In Progress" },
    review_ready: { bg: "#ede9fe", text: "#5b21b6", label: "Review Ready" },
    filed:        { bg: "#d1fae5", text: "#065f46", label: "Filed ✓" },
    overdue:      { bg: "#fee2e2", text: "#991b1b", label: "Overdue" },
  };

  return (
    <div style={{ padding: 28, maxWidth: 1100 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href="/dashboard/clients" style={{
            width: 32, height: 32, borderRadius: 8,
            background: "#fff", border: "1px solid #e5e7eb",
            display: "flex", alignItems: "center", justifyContent: "center",
            textDecoration: "none", fontSize: 16, color: "#374151",
          }}>
            ←
          </Link>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: "#ede9fe",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 700, color: "#4f46e5",
          }}>
            {client.name.charAt(0)}
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>{client.name}</h1>
            <div style={{ display: "flex", gap: 12, marginTop: 3 }}>
              {client.pan   && <span style={{ fontSize: 11, fontFamily: "monospace", color: "#6b7280" }}>PAN: {client.pan}</span>}
              {client.gstin && <span style={{ fontSize: 11, fontFamily: "monospace", color: "#6b7280" }}>GSTIN: {client.gstin}</span>}
              {client.email && <span style={{ fontSize: 11, color: "#6b7280" }}>{client.email}</span>}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: riskCfg.bg, border: `1px solid ${riskCfg.border}`,
            borderRadius: 8, padding: "6px 12px",
            fontSize: 12, fontWeight: 600, color: riskCfg.text,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: riskCfg.dot }} />
            {riskCfg.label}
          </div>
          <Link href={`/dashboard/clients/${clientId}/remind`} style={{
            background: "#4f46e5", color: "#fff",
            padding: "8px 16px", borderRadius: 8,
            fontSize: 13, fontWeight: 600, textDecoration: "none",
          }}>
            Send Reminder
          </Link>
          <Link href={`/dashboard/reports/${clientId}`} style={{
            background: "#fff", color: "#374151",
            border: "1px solid #e5e7eb",
            padding: "8px 16px", borderRadius: 8,
            fontSize: 13, fontWeight: 600, textDecoration: "none",
          }}>
            Liability Report
          </Link>
        </div>
      </div>

      {/* ── Penalty exposure ── */}
      {penaltyExposure > 0 && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca",
          borderRadius: 10, padding: "12px 18px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#991b1b" }}>
              Penalty Exposure: ₹{penaltyExposure.toLocaleString("en-IN")}
            </span>
            <span style={{ fontSize: 12, color: "#dc2626", marginLeft: 8 }}>
              accruing daily — send reminder immediately
            </span>
          </div>
        </div>
      )}

      {/* ── 2-col layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>

        {/* Left — tasks */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Active tasks */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            <div style={{
              padding: "14px 18px", borderBottom: "1px solid #f3f4f6",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Active Tasks</span>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>{activeTasks.length} pending</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                  {["Compliance", "Period", "Due Date", "Status"].map((h) => (
                    <th key={h} style={{
                      textAlign: "left", padding: "9px 18px",
                      fontSize: 11, fontWeight: 600, color: "#6b7280",
                      textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeTasks.map((task, i) => {
                  const days = daysUntilDue(task.due_date);
                  const penalty = getPenaltyPerDay(task.compliance_type);
                  const s = statusCfg[task.status] ?? statusCfg.pending;
                  return (
                    <tr key={task.id} style={{
                      borderBottom: i < activeTasks.length - 1 ? "1px solid #f3f4f6" : "none",
                      background: days < 0 ? "#fff9f9" : "transparent",
                    }}>
                      <td style={{ padding: "12px 18px" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                          {formatComplianceType(task.compliance_type)}
                        </div>
                        {penalty > 0 && (
                          <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>₹{penalty}/day penalty</div>
                        )}
                      </td>
                      <td style={{ padding: "12px 18px", fontSize: 12, color: "#6b7280" }}>{task.period}</td>
                      <td style={{ padding: "12px 18px" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: days < 0 ? "#dc2626" : days <= 5 ? "#d97706" : "#111827" }}>
                          {task.due_date}
                        </div>
                        <div style={{ fontSize: 11, color: days < 0 ? "#dc2626" : "#9ca3af", marginTop: 2 }}>
                          {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d remaining`}
                        </div>
                      </td>
                      <td style={{ padding: "12px 18px" }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600,
                          background: s.bg, color: s.text,
                          padding: "3px 8px", borderRadius: 20,
                        }}>
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {activeTasks.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: "32px 18px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                      ✅ All tasks filed. Client is fully compliant.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add task */}
          <AddTaskForm clientId={clientId} complianceTypes={client.compliance_types as string[]} />

          {/* Filed */}
          {filedTasks.length > 0 && (
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Filed Returns</span>
                <span style={{ fontSize: 12, color: "#059669", fontWeight: 600 }}>{filedTasks.length} completed</span>
              </div>
              {filedTasks.map((task, i) => (
                <div key={task.id} style={{
                  padding: "12px 18px",
                  borderBottom: i < filedTasks.length - 1 ? "1px solid #f3f4f6" : "none",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{formatComplianceType(task.compliance_type)}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{task.period}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>{task.due_date}</span>
                    <span style={{ background: "#d1fae5", color: "#065f46", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>
                      Filed ✓
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — audit trail + compliance types */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Audit trail */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #f3f4f6" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Audit Trail</div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Immutable · Court-admissible</div>
            </div>
            <div style={{ padding: 16, maxHeight: 400, overflowY: "auto" }}>
              {logs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "#9ca3af", fontSize: 12 }}>
                  No activity yet
                </div>
              ) : (
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 11, top: 8, bottom: 8, width: 1, background: "#f3f4f6" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {logs.map((log) => (
                      <div key={log.id} style={{ display: "flex", gap: 10 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: "50%",
                          background: "#fff", border: "1px solid #e5e7eb",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, flexShrink: 0, zIndex: 1,
                        }}>
                          {auditIcon[log.action] ?? "•"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: auditColor[log.action] ?? "#374151" }}>
                            {auditLabel[log.action] ?? log.action}
                          </div>
                          {log.channel && <div style={{ fontSize: 10, color: "#9ca3af" }}>via {log.channel}</div>}
                          {log.message_id && (
                            <div style={{ fontSize: 10, color: "#d1d5db", fontFamily: "monospace", marginTop: 1 }}>
                              {log.message_id}
                            </div>
                          )}
                          <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>
                            {new Date(log.timestamp).toLocaleString("en-IN", {
                              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Compliance types */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
              Applicable Compliances
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {client.compliance_types.map((t) => (
                <span key={t} style={{
                  background: "#f5f3ff", color: "#4f46e5",
                  fontSize: 11, fontWeight: 500,
                  padding: "3px 8px", borderRadius: 6,
                  border: "1px solid #ede9fe",
                }}>
                  {formatComplianceType(t)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
