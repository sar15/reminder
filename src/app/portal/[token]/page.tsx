import { formatComplianceType } from "@/lib/utils";
import { MOCK_CLIENTS, MOCK_TASKS } from "@/lib/mock-data";

const TOKEN_MAP: Record<string, string> = {
  "demo-sharma": "1",
  "demo-mehta":  "2",
  "demo-patel":  "3",
  "demo-gupta":  "4",
  "demo-reddy":  "5",
};

// Required documents per compliance type
const REQUIRED_DOCS: Record<string, string[]> = {
  GSTR1:           ["Sales Register", "Invoice Summary", "E-way Bills (if any)"],
  GSTR3B:          ["Bank Statement", "Sales Register", "Purchase Register", "Expense Invoices"],
  TDS_PAYMENT:     ["Salary Sheet", "Vendor Payment Details", "TDS Challan"],
  TDS_RETURN_26Q:  ["Vendor PAN Details", "Payment Summary", "TDS Certificates"],
  ITR_NON_AUDIT:   ["Bank Statements (all)", "Investment Proofs", "Form 16", "Rental Income (if any)"],
  ITR_AUDIT:       ["Audited Balance Sheet", "P&L Statement", "Bank Statements", "Fixed Asset Register"],
  ADVANCE_TAX:     ["Estimated Income Statement", "Previous Year ITR"],
  AOC4:            ["Audited Financial Statements", "Board Resolution", "Director Details"],
  MGT7:            ["Shareholder Register", "Director Details", "Annual Return"],
  PF:              ["Salary Sheet", "Employee PF Details", "ECR File"],
  ESI:             ["Salary Sheet", "Employee ESI Details"],
  DEFAULT:         ["Relevant Documents", "Bank Statement"],
};

export default async function ClientPortalPage({
  params,
}: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const clientId = TOKEN_MAP[token] ?? "1";
  const client = MOCK_CLIENTS.find((c) => c.id === clientId);
  const tasks = MOCK_TASKS.filter((t) => t.client_id === clientId);
  const activeTasks = tasks.filter((t) => t.status !== "filed");
  const filedTasks  = tasks.filter((t) => t.status === "filed");

  if (!client) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔗</div>
          <p style={{ fontSize: 14, color: "#6b7280" }}>Invalid or expired link.</p>
          <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>Please contact your CA for a new link.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>

      {/* Header */}
      <div style={{ background: "#4f46e5", padding: "24px 20px 20px" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 14 }}>🛡️</span>
            <span style={{ fontSize: 11, color: "#a5b4fc", fontWeight: 600 }}>DeadlineShield · Secure Client Portal</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{client.name}</h1>
          <p style={{ fontSize: 13, color: "#c7d2fe" }}>
            {client.contact_name && `${client.contact_name} · `}
            {client.pan && `PAN: ${client.pan}`}
          </p>

          {/* Summary pills */}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Pill value={activeTasks.length} label="Pending" color="#fbbf24" />
            <Pill value={filedTasks.length}  label="Filed"   color="#34d399" />
            <Pill value={client.compliance_types.length} label="Compliances" color="#a5b4fc" />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px" }}>

        {/* Pending tasks */}
        {activeTasks.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <span>⚠️</span> Action Required
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {activeTasks.map((task) => {
                const daysLeft = Math.ceil((new Date(task.due_date).getTime() - Date.now()) / 86400000);
                const isOverdue = daysLeft < 0;
                const isUrgent  = daysLeft <= 3 && !isOverdue;
                const docs = REQUIRED_DOCS[task.compliance_type] ?? REQUIRED_DOCS.DEFAULT;
                const urgencyColor = isOverdue ? "#dc2626" : isUrgent ? "#d97706" : "#4f46e5";
                const urgencyBg    = isOverdue ? "#fef2f2" : isUrgent ? "#fffbeb" : "#f5f3ff";
                const urgencyBorder= isOverdue ? "#fecaca" : isUrgent ? "#fde68a" : "#e0e7ff";

                return (
                  <div key={task.id} style={{
                    background: "#fff", borderRadius: 12,
                    border: `1px solid ${urgencyBorder}`,
                    overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  }}>
                    {/* Urgency bar */}
                    <div style={{ height: 3, background: urgencyColor }} />

                    <div style={{ padding: 16 }}>
                      {/* Task header */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                            {formatComplianceType(task.compliance_type)}
                          </div>
                          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Period: {task.period}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 11, color: "#9ca3af" }}>Due date</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: urgencyColor }}>{task.due_date}</div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: urgencyColor }}>
                            {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                          </div>
                        </div>
                      </div>

                      {/* Document checklist */}
                      <div style={{ background: urgencyBg, borderRadius: 8, padding: "10px 12px", marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: urgencyColor, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          Documents Required
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {docs.map((doc) => (
                            <div key={doc} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{
                                width: 16, height: 16, borderRadius: 4,
                                border: `1.5px solid ${urgencyColor}`,
                                flexShrink: 0,
                              }} />
                              <span style={{ fontSize: 12, color: "#374151" }}>{doc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Status */}
                      <div style={{ marginBottom: 12 }}>
                        <PortalStatus status={task.status} />
                      </div>

                      {/* Upload button */}
                      {(task.status === "pending" || task.status === "waiting_docs") && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button style={{
                            flex: 1, background: urgencyColor, color: "#fff",
                            border: "none", borderRadius: 8, padding: "12px",
                            fontSize: 13, fontWeight: 700, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          }}>
                            📷 Camera Upload
                          </button>
                          <button style={{
                            flex: 1, background: "#fff", color: urgencyColor,
                            border: `1.5px solid ${urgencyColor}`, borderRadius: 8, padding: "12px",
                            fontSize: 13, fontWeight: 700, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          }}>
                            📁 File Upload
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
        {filedTasks.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <span>✅</span> Completed
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filedTasks.map((task) => (
                <div key={task.id} style={{
                  background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb",
                  padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{formatComplianceType(task.compliance_type)}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{task.period}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{task.due_date}</span>
                    <span style={{ background: "#d1fae5", color: "#065f46", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>
                      Filed ✓
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTasks.length === 0 && filedTasks.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <p style={{ fontSize: 14, color: "#6b7280" }}>No pending compliances. You&apos;re all caught up!</p>
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "#9ca3af" }}>🔒 Secured by DeadlineShield · Do not share this link</p>
          <p style={{ fontSize: 10, color: "#d1d5db", marginTop: 4 }}>
            This portal is personalized for {client.name} only
          </p>
        </div>
      </div>
    </div>
  );
}

function Pill({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "6px 12px", textAlign: "center" }}>
      <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 10, color: "#c7d2fe" }}>{label}</div>
    </div>
  );
}

function PortalStatus({ status }: { status: string }) {
  const map: Record<string, { icon: string; text: string; color: string }> = {
    pending:       { icon: "⏳", text: "Awaiting your documents",                    color: "#6b7280" },
    waiting_docs:  { icon: "📋", text: "Please upload documents now",                color: "#d97706" },
    docs_received: { icon: "⚙️", text: "Documents received — CA is processing",     color: "#2563eb" },
    in_progress:   { icon: "⚙️", text: "Filing in progress",                        color: "#2563eb" },
    review_ready:  { icon: "🔍", text: "Under partner review",                       color: "#7c3aed" },
    overdue:       { icon: "🚨", text: "OVERDUE — contact your CA immediately",      color: "#dc2626" },
  };
  const info = map[status] ?? { icon: "•", text: status, color: "#6b7280" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: info.color, fontWeight: 500 }}>
      <span>{info.icon}</span>
      {info.text}
    </div>
  );
}
