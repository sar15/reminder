import { getClient, getTasksForClient, getAllAuditLogsForClient } from "@/lib/data";
import { formatComplianceType } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { T, S } from "@/lib/tokens";

export default async function ClientReportPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const [client, tasks, logs] = await Promise.all([getClient(clientId), getTasksForClient(clientId), getAllAuditLogsForClient(clientId)]);
  if (!client) notFound();

  const sent     = logs.filter(l => l.action === "reminder_sent").length;
  const opened   = logs.filter(l => l.action === "opened").length;
  const uploaded = logs.filter(l => l.action === "doc_uploaded").length;
  const filed    = logs.filter(l => l.action === "filed").length;

  const EVT: Record<string, { icon: string; label: string; bg: string; border: string; text: string }> = {
    reminder_sent: { icon: "📤", label: "Reminder Sent",     bg: T.brandLight, border: T.brandBorder, text: T.brandText },
    delivered:     { icon: "✅", label: "Delivered",          bg: T.greenLight, border: T.greenBorder, text: T.greenText },
    opened:        { icon: "👁️", label: "Opened by Client",  bg: T.blueLight,  border: T.blueBorder,  text: T.blueText  },
    doc_uploaded:  { icon: "📎", label: "Document Uploaded", bg: T.greenLight, border: T.greenBorder, text: T.greenText },
    filed:         { icon: "🏛️", label: "Return Filed",      bg: T.greenLight, border: T.greenBorder, text: T.greenText },
    escalated:     { icon: "🚨", label: "Escalated",         bg: T.redLight,   border: T.redBorder,   text: T.redText   },
  };

  const STATUS: Record<string, { bg: string; text: string }> = {
    pending:       { bg: T.bgSubtle,   text: T.text2      },
    waiting_docs:  { bg: T.amberLight, text: T.amberText  },
    docs_received: { bg: T.blueLight,  text: T.blueText   },
    in_progress:   { bg: T.blueLight,  text: T.blueText   },
    review_ready:  { bg: T.brandLight, text: T.brandText  },
    filed:         { bg: T.greenLight, text: T.greenText  },
    overdue:       { bg: T.redLight,   text: T.redText    },
  };

  return (
    <div style={{ padding: 28, maxWidth: 840 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/reports" style={{ ...S.btnSecondary, padding: "7px 10px", fontSize: 16 }}>←</Link>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text1, letterSpacing: "-0.02em" }}>Liability Report</h1>
            <p style={{ fontSize: 12, color: T.text3, marginTop: 3 }}>{client.name} · Generated {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
        </div>
        <Link href={`/api/reports/${clientId}/pdf`} style={S.btnPrimary}>↓ Download PDF</Link>
      </div>

      {/* Legal notice */}
      <div style={{ background: T.brandLight, border: `1px solid ${T.brandBorder}`, borderRadius: 12, padding: "14px 18px", marginBottom: 22, display: "flex", gap: 12 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>🛡️</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.brandText, marginBottom: 4 }}>Court-Admissible Audit Document</div>
          <div style={{ fontSize: 12, color: T.brand, lineHeight: 1.6 }}>Generated from an immutable, append-only audit log. All timestamps are in IST. This document can be presented in client disputes, ICAI disciplinary proceedings, and penalty defense cases.</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 22 }}>
        {[
          { icon: "📤", label: "Reminders Sent", value: sent,     bg: T.brandLight, text: T.brandText },
          { icon: "👁️", label: "Times Opened",   value: opened,   bg: T.blueLight,  text: T.blueText  },
          { icon: "📎", label: "Docs Uploaded",  value: uploaded, bg: T.greenLight, text: T.greenText },
          { icon: "🏛️", label: "Returns Filed",  value: filed,    bg: T.greenLight, text: T.greenText },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 18, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.text, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Client info */}
      <div style={{ ...S.card, padding: 20, marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text1, marginBottom: 14 }}>Client Information</div>
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
              <div style={{ ...S.label, marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: T.text1, fontFamily: mono ? "monospace" : "inherit" }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div style={{ ...S.card, padding: 0, overflow: "hidden", marginBottom: 18 }}>
        <div style={{ padding: "13px 18px", borderBottom: `1px solid ${T.bgMuted}` }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>Compliance Tasks</span>
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
            {tasks.map((t, i) => {
              const s = STATUS[t.status] ?? STATUS.pending;
              return (
                <tr key={t.id} style={{ borderBottom: i < tasks.length - 1 ? `1px solid ${T.bgSubtle}` : "none" }}>
                  <td style={{ padding: "12px 18px", fontSize: 13, fontWeight: 500, color: T.text1 }}>{formatComplianceType(t.compliance_type)}</td>
                  <td style={{ padding: "12px 18px", fontSize: 12, color: T.text2 }}>{t.period}</td>
                  <td style={{ padding: "12px 18px", fontSize: 12, color: T.text2 }}>{t.due_date}</td>
                  <td style={{ padding: "12px 18px" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: s.bg, color: s.text }}>{t.status.replace(/_/g, " ")}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Timeline */}
      <div style={{ ...S.card, padding: 0, overflow: "hidden", marginBottom: 18 }}>
        <div style={{ padding: "13px 18px", borderBottom: `1px solid ${T.bgMuted}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>Communication Audit Trail</span>
          <span style={{ fontSize: 11, color: T.text3 }}>{logs.length} events · Immutable</span>
        </div>
        <div style={{ padding: 20 }}>
          {logs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", fontSize: 13, color: T.text3 }}>No communication logged yet.</div>
          ) : (
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 18, top: 8, bottom: 8, width: 1, background: T.bgMuted }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {logs.map(log => {
                  const cfg = EVT[log.action] ?? { icon: "•", label: log.action, bg: T.bgSubtle, border: T.border, text: T.text2 };
                  return (
                    <div key={log.id} style={{ display: "flex", gap: 14 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: cfg.bg, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, zIndex: 1 }}>
                        {cfg.icon}
                      </div>
                      <div style={{ flex: 1, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: cfg.text }}>{cfg.label}</div>
                            {log.channel && <div style={{ fontSize: 11, color: T.text2, marginTop: 2 }}>via {log.channel}</div>}
                            {log.message_id && <div style={{ fontSize: 10, color: T.text3, fontFamily: "monospace", marginTop: 2 }}>ID: {log.message_id}</div>}
                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                              <div style={{ fontSize: 10, color: T.text2, marginTop: 2 }}>{Object.entries(log.metadata).map(([k, v]) => `${k}: ${v}`).join(" · ")}</div>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: T.text3, flexShrink: 0, textAlign: "right" }}>
                            {new Date(log.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} IST
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
        <div style={{ background: "#1C1917", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#E7E5E4", marginBottom: 10 }}>🛡️ Legal Conclusion</div>
          <p style={{ fontSize: 13, color: "#A8A29E", lineHeight: 1.7 }}>
            Based on the audit trail above, <strong style={{ color: "#E7E5E4" }}>{sent} reminder{sent !== 1 ? "s were" : " was"}</strong> sent to <strong style={{ color: "#E7E5E4" }}>{client.name}</strong> between <strong style={{ color: "#E7E5E4" }}>{new Date(logs[0].timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}</strong> and <strong style={{ color: "#E7E5E4" }}>{new Date(logs[logs.length - 1].timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong>. {uploaded > 0 ? `Client uploaded ${uploaded} document${uploaded !== 1 ? "s" : ""}.` : "Client has not uploaded any documents as of this report."} <strong style={{ color: "#F5F5F4" }}>Any penalties incurred are attributable to client delay, not CA negligence.</strong>
          </p>
        </div>
      )}
    </div>
  );
}
