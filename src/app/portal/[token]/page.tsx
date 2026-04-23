import { formatComplianceType } from "@/lib/utils";
import { MOCK_CLIENTS, MOCK_TASKS } from "@/lib/mock-data";
import { T } from "@/lib/tokens";

const TOKEN_MAP: Record<string, string> = {
  "demo-sharma": "1", "demo-mehta": "2", "demo-patel": "3", "demo-gupta": "4", "demo-reddy": "5",
};

const DOCS: Record<string, string[]> = {
  GSTR1:          ["Sales Register", "Invoice Summary", "E-way Bills (if any)"],
  GSTR3B:         ["Bank Statement", "Sales Register", "Purchase Register", "Expense Invoices"],
  TDS_PAYMENT:    ["Salary Sheet", "Vendor Payment Details"],
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

export default async function PortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const clientId = TOKEN_MAP[token] ?? "1";
  const client = MOCK_CLIENTS.find(c => c.id === clientId);
  const tasks = MOCK_TASKS.filter(t => t.client_id === clientId);
  const active = tasks.filter(t => t.status !== "filed");
  const filed  = tasks.filter(t => t.status === "filed");

  if (!client) return (
    <div style={{ minHeight: "100vh", background: T.bgBase, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 14, color: T.text2 }}>Invalid or expired link.</p>
        <p style={{ fontSize: 12, color: T.text3, marginTop: 4 }}>Please contact your CA for a new link.</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bgBase }}>

      {/* Header */}
      <div style={{ background: T.bgSurface, borderBottom: `1px solid ${T.border}`, padding: "20px 20px 16px" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 24, height: 24, background: T.brand, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 700 }}>D</div>
            <span style={{ fontSize: 11, color: T.text3, fontWeight: 500 }}>DeadlineShield · Secure Portal</span>
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: T.text1, letterSpacing: "-0.02em" }}>{client.name}</h1>
          <p style={{ fontSize: 12, color: T.text3, marginTop: 3 }}>
            {client.contact_name && `${client.contact_name} · `}{client.pan && `PAN: ${client.pan}`}
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            {[
              { n: active.length, label: "Pending",     color: active.length > 0 ? T.amber : T.text3 },
              { n: filed.length,  label: "Filed",       color: T.green },
              { n: client.compliance_types.length, label: "Compliances", color: T.brand },
            ].map(({ n, label, color }) => (
              <div key={label} style={{ flex: 1, background: T.bgSubtle, borderRadius: 8, border: `1px solid ${T.border}`, padding: "8px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color }}>{n}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "18px 16px" }}>

        {/* Active */}
        {active.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
              Action Required
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {active.map(task => {
                const d = Math.ceil((new Date(task.due_date).getTime() - Date.now()) / 86400000);
                const overdue = d < 0;
                const urgent  = d <= 3 && !overdue;
                const docs = DOCS[task.compliance_type] ?? DOCS.DEFAULT;
                const accent = overdue ? T.red : urgent ? T.amber : T.brand;
                const accentBg = overdue ? T.redLight : urgent ? T.amberLight : T.brandLight;
                const accentBorder = overdue ? T.redBorder : urgent ? T.amberBorder : T.brandBorder;

                return (
                  <div key={task.id} style={{ background: T.bgSurface, borderRadius: 12, border: `1px solid ${accentBorder}`, overflow: "hidden", boxShadow: T.shadow }}>
                    <div style={{ height: 3, background: accent }} />
                    <div style={{ padding: 16 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: T.text1 }}>{formatComplianceType(task.compliance_type)}</div>
                          <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>Period: {task.period}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 11, color: T.text3 }}>Due</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: accent }}>{task.due_date}</div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: accent }}>{overdue ? `${Math.abs(d)}d overdue` : `${d}d left`}</div>
                        </div>
                      </div>

                      {/* Checklist */}
                      <div style={{ background: accentBg, borderRadius: 8, padding: "10px 12px", marginBottom: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Documents Required</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {docs.map(doc => (
                            <div key={doc} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${accent}`, flexShrink: 0 }} />
                              <span style={{ fontSize: 12, color: T.text2 }}>{doc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Status */}
                      <div style={{ fontSize: 12, color: accent, marginBottom: 12 }}>
                        {task.status === "waiting_docs" ? "📋 Please upload documents now"
                          : task.status === "docs_received" ? "⚙️ Documents received — CA is processing"
                          : task.status === "overdue" ? "🚨 OVERDUE — contact your CA immediately"
                          : "⏳ Awaiting your documents"}
                      </div>

                      {/* Upload */}
                      {(task.status === "pending" || task.status === "waiting_docs") && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px", background: accent, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                            📷 Camera
                          </button>
                          <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px", background: T.bgSurface, color: accent, border: `1.5px solid ${accent}`, borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                            📁 Upload File
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filed */}
        {filed.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Completed</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filed.map(task => (
                <div key={task.id} style={{ background: T.bgSurface, borderRadius: 10, border: `1px solid ${T.border}`, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: T.shadow }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: T.text2 }}>{formatComplianceType(task.compliance_type)}</div>
                    <div style={{ fontSize: 11, color: T.text3 }}>{task.period}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, color: T.text3 }}>{task.due_date}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: T.greenLight, color: T.greenText }}>Filed ✓</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {active.length === 0 && filed.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🎉</div>
            <p style={{ fontSize: 14, color: T.text2 }}>No pending compliances. You're all caught up!</p>
          </div>
        )}

        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 16, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: T.text3 }}>🔒 Secured by DeadlineShield · Do not share this link</p>
        </div>
      </div>
    </div>
  );
}
