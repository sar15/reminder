import { getClient, getTasksForClient, getAuditLogsForClient } from "@/lib/data";
import { formatComplianceType, daysUntilDue, getRiskLevel, getPenaltyPerDay } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { T, S } from "@/lib/tokens";
import AddTaskForm from "./AddTaskForm";

export default async function ClientDetailPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const [client, tasks, logs] = await Promise.all([getClient(clientId), getTasksForClient(clientId), getAuditLogsForClient(clientId)]);
  if (!client) notFound();

  const active = tasks.filter(t => t.status !== "filed");
  const filed  = tasks.filter(t => t.status === "filed");
  const risk   = getRiskLevel(active);
  const penalty = active.filter(t => daysUntilDue(t.due_date) < 0).reduce((s, t) => s + getPenaltyPerDay(t.compliance_type) * Math.abs(daysUntilDue(t.due_date)), 0);

  const RISK = {
    red:    { label: "Critical",      bg: T.redLight,   border: T.redBorder,   text: T.redText,   dot: T.red   },
    yellow: { label: "Awaiting Docs", bg: T.amberLight, border: T.amberBorder, text: T.amberText, dot: T.amber },
    green:  { label: "On Track",      bg: T.greenLight, border: T.greenBorder, text: T.greenText, dot: T.green },
  }[risk];

  const STATUS: Record<string, { bg: string; text: string; label: string }> = {
    pending:       { bg: T.bgSubtle,   text: T.text2,      label: "Pending"       },
    waiting_docs:  { bg: T.amberLight, text: T.amberText,  label: "Waiting Docs"  },
    docs_received: { bg: T.blueLight,  text: T.blueText,   label: "Docs Received" },
    in_progress:   { bg: T.blueLight,  text: T.blueText,   label: "In Progress"   },
    review_ready:  { bg: T.brandLight, text: T.brandText,  label: "Review Ready"  },
    filed:         { bg: T.greenLight, text: T.greenText,  label: "Filed ✓"       },
    overdue:       { bg: T.redLight,   text: T.redText,    label: "Overdue"       },
  };

  const AUDIT: Record<string, { icon: string; label: string; color: string }> = {
    reminder_sent: { icon: "📤", label: "Reminder Sent",     color: T.brand },
    delivered:     { icon: "✅", label: "Delivered",          color: T.green },
    opened:        { icon: "👁️", label: "Opened by Client",  color: T.blue  },
    doc_uploaded:  { icon: "📎", label: "Document Uploaded", color: T.green },
    filed:         { icon: "🏛️", label: "Return Filed",      color: T.greenText },
    escalated:     { icon: "🚨", label: "Escalated",         color: T.red   },
  };

  return (
    <div style={{ padding: 28, maxWidth: 1060 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/clients" style={{ ...S.btnSecondary, padding: "7px 10px", fontSize: 16 }}>←</Link>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: T.brandLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: T.brand }}>
            {client.name.charAt(0)}
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text1, letterSpacing: "-0.02em" }}>{client.name}</h1>
            <div style={{ display: "flex", gap: 12, marginTop: 3 }}>
              {client.pan   && <span style={{ fontSize: 11, fontFamily: "monospace", color: T.text3 }}>PAN: {client.pan}</span>}
              {client.gstin && <span style={{ fontSize: 11, fontFamily: "monospace", color: T.text3 }}>GSTIN: {client.gstin}</span>}
              {client.email && <span style={{ fontSize: 11, color: T.text3 }}>{client.email}</span>}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: `1px solid ${RISK.border}`, background: RISK.bg, color: RISK.text, fontSize: 12, fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: RISK.dot }} />{RISK.label}
          </span>
          <Link href={`/dashboard/clients/${clientId}/remind`} style={S.btnPrimary}>Send Reminder</Link>
          <Link href={`/dashboard/reports/${clientId}`} style={S.btnSecondary}>Liability Report</Link>
        </div>
      </div>

      {/* Penalty */}
      {penalty > 0 && (
        <div style={{ background: T.redLight, border: `1px solid ${T.redBorder}`, borderRadius: 10, padding: "10px 16px", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>⚠️</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.redText }}>Penalty Exposure: ₹{penalty.toLocaleString("en-IN")}</span>
          <span style={{ fontSize: 12, color: T.red }}>accruing daily — send reminder immediately</span>
        </div>
      )}

      {/* 2-col */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18 }}>

        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Active tasks */}
          <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "13px 18px", borderBottom: `1px solid ${T.bgMuted}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>Active Tasks</span>
              <span style={{ fontSize: 11, color: T.text3 }}>{active.length} pending</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: T.bgSubtle, borderBottom: `1px solid ${T.bgMuted}` }}>
                  {["Compliance", "Period", "Due Date", "Status"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "9px 18px", ...S.label }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {active.map((t, i) => {
                  const d = daysUntilDue(t.due_date);
                  const p = getPenaltyPerDay(t.compliance_type);
                  const s = STATUS[t.status] ?? STATUS.pending;
                  return (
                    <tr key={t.id} style={{ borderBottom: i < active.length - 1 ? `1px solid ${T.bgSubtle}` : "none", background: d < 0 ? "#FFFAFA" : "transparent" }}>
                      <td style={{ padding: "12px 18px" }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: T.text1 }}>{formatComplianceType(t.compliance_type)}</div>
                        {p > 0 && <div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>₹{p}/day penalty</div>}
                      </td>
                      <td style={{ padding: "12px 18px", fontSize: 12, color: T.text2 }}>{t.period}</td>
                      <td style={{ padding: "12px 18px" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: d < 0 ? T.red : d <= 5 ? T.amber : T.text1 }}>{t.due_date}</div>
                        <div style={{ fontSize: 10, color: d < 0 ? T.red : T.text3, marginTop: 2 }}>{d < 0 ? `${Math.abs(d)}d overdue` : `${d}d remaining`}</div>
                      </td>
                      <td style={{ padding: "12px 18px" }}>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: s.bg, color: s.text }}>{s.label}</span>
                      </td>
                    </tr>
                  );
                })}
                {active.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: "28px 18px", textAlign: "center", fontSize: 13, color: T.text3 }}>✅ All tasks filed. Client is fully compliant.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <AddTaskForm clientId={clientId} complianceTypes={client.compliance_types as string[]} />

          {/* Filed */}
          {filed.length > 0 && (
            <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "13px 18px", borderBottom: `1px solid ${T.bgMuted}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>Filed Returns</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: T.green }}>{filed.length} completed</span>
              </div>
              {filed.map((t, i) => (
                <div key={t.id} style={{ padding: "11px 18px", borderBottom: i < filed.length - 1 ? `1px solid ${T.bgSubtle}` : "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: T.text2 }}>{formatComplianceType(t.compliance_type)}</div>
                    <div style={{ fontSize: 11, color: T.text3 }}>{t.period}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, color: T.text3 }}>{t.due_date}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: T.greenLight, color: T.greenText }}>Filed ✓</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — audit trail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "13px 16px", borderBottom: `1px solid ${T.bgMuted}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>Audit Trail</div>
              <div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>Immutable · Court-admissible</div>
            </div>
            <div style={{ padding: 14, maxHeight: 400, overflowY: "auto" }}>
              {logs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0", fontSize: 12, color: T.text3 }}>No activity yet</div>
              ) : (
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 10, top: 6, bottom: 6, width: 1, background: T.bgMuted }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {logs.map(log => {
                      const cfg = AUDIT[log.action] ?? { icon: "•", label: log.action, color: T.text2 };
                      return (
                        <div key={log.id} style={{ display: "flex", gap: 10 }}>
                          <div style={{ width: 20, height: 20, borderRadius: "50%", background: T.bgSurface, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, flexShrink: 0, zIndex: 1 }}>
                            {cfg.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: cfg.color }}>{cfg.label}</div>
                            {log.channel && <div style={{ fontSize: 10, color: T.text3 }}>via {log.channel}</div>}
                            {log.message_id && <div style={{ fontSize: 10, color: T.text4, fontFamily: "monospace", marginTop: 1 }}>{log.message_id}</div>}
                            <div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>
                              {new Date(log.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
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

          <div style={{ ...S.card, padding: 14 }}>
            <div style={{ ...S.label, marginBottom: 10 }}>Applicable Compliances</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {client.compliance_types.map(t => (
                <span key={t} style={{ background: T.brandLight, color: T.brandText, fontSize: 10, fontWeight: 500, padding: "3px 8px", borderRadius: 6, border: `1px solid ${T.brandBorder}` }}>
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
