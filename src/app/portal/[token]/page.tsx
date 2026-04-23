import { formatComplianceType } from "@/lib/utils";
import { MOCK_CLIENTS, MOCK_TASKS } from "@/lib/mock-data";
import { Shield, Upload, Camera } from "lucide-react";

const TOKEN_MAP: Record<string, string> = {
  "demo-sharma": "1", "demo-mehta": "2", "demo-patel": "3",
  "demo-gupta": "4", "demo-reddy": "5",
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
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
      <div className="text-center">
        <p className="text-[14px] text-[#57534E]">Invalid or expired link.</p>
        <p className="text-[12px] text-[#A8A29E] mt-1">Please contact your CA for a new link.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF9]">

      {/* Header */}
      <div className="bg-white border-b border-[#E8E6E3] px-5 pt-6 pb-5">
        <div className="max-w-[520px] mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md bg-[#6D28D9] flex items-center justify-center">
              <Shield size={12} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-medium text-[#A8A29E]">DeadlineShield · Secure Portal</span>
          </div>
          <h1 className="text-[18px] font-semibold text-[#1C1917] tracking-tight">{client.name}</h1>
          <p className="text-[12px] text-[#A8A29E] mt-0.5">
            {client.contact_name && `${client.contact_name} · `}
            {client.pan && `PAN: ${client.pan}`}
          </p>

          {/* Stats */}
          <div className="flex gap-3 mt-4">
            <Stat n={active.length} label="Pending" color={active.length > 0 ? "#D97706" : "#A8A29E"} />
            <Stat n={filed.length}  label="Filed"   color="#059669" />
            <Stat n={client.compliance_types.length} label="Compliances" color="#6D28D9" />
          </div>
        </div>
      </div>

      <div className="max-w-[520px] mx-auto px-5 py-5 space-y-4">

        {/* Active tasks */}
        {active.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-3">
              Action Required
            </p>
            <div className="space-y-3">
              {active.map(task => {
                const d = Math.ceil((new Date(task.due_date).getTime() - Date.now()) / 86400000);
                const overdue = d < 0;
                const urgent  = d <= 3 && !overdue;
                const docs = DOCS[task.compliance_type] ?? DOCS.DEFAULT;
                const accent = overdue ? "#DC2626" : urgent ? "#D97706" : "#6D28D9";
                const accentBg = overdue ? "#FEF2F2" : urgent ? "#FFFBEB" : "#EDE9FE";
                const accentBorder = overdue ? "#FECACA" : urgent ? "#FDE68A" : "#DDD6FE";

                return (
                  <div key={task.id} className="bg-white rounded-xl border overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)]" style={{ borderColor: accentBorder }}>
                    {/* Top accent line */}
                    <div className="h-0.5" style={{ background: accent }} />

                    <div className="p-4">
                      {/* Task header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-[14px] font-semibold text-[#1C1917]">
                            {formatComplianceType(task.compliance_type)}
                          </p>
                          <p className="text-[11px] text-[#A8A29E] mt-0.5">Period: {task.period}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] text-[#A8A29E]">Due</p>
                          <p className="text-[13px] font-bold" style={{ color: accent }}>{task.due_date}</p>
                          <p className="text-[11px] font-semibold" style={{ color: accent }}>
                            {overdue ? `${Math.abs(d)}d overdue` : `${d}d left`}
                          </p>
                        </div>
                      </div>

                      {/* Document checklist */}
                      <div className="rounded-lg p-3 mb-3" style={{ background: accentBg }}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: accent }}>
                          Documents Required
                        </p>
                        <div className="space-y-1.5">
                          {docs.map(doc => (
                            <div key={doc} className="flex items-center gap-2">
                              <div className="w-3.5 h-3.5 rounded border-[1.5px] flex-shrink-0" style={{ borderColor: accent }} />
                              <span className="text-[12px] text-[#374151]">{doc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Status */}
                      <p className="text-[12px] mb-3" style={{ color: accent }}>
                        {task.status === "waiting_docs" ? "📋 Please upload documents now"
                          : task.status === "docs_received" ? "⚙️ Documents received — CA is processing"
                          : task.status === "overdue" ? "🚨 OVERDUE — contact your CA immediately"
                          : "⏳ Awaiting your documents"}
                      </p>

                      {/* Upload buttons */}
                      {(task.status === "pending" || task.status === "waiting_docs") && (
                        <div className="flex gap-2">
                          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-[13px] font-semibold transition-colors" style={{ background: accent }}>
                            <Camera size={14} /> Camera
                          </button>
                          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold border-[1.5px] transition-colors" style={{ color: accent, borderColor: accent, background: "white" }}>
                            <Upload size={14} /> Upload File
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
          <div>
            <p className="text-[10px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-3">Completed</p>
            <div className="space-y-2">
              {filed.map(task => (
                <div key={task.id} className="bg-white rounded-xl border border-[#E8E6E3] px-4 py-3 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <div>
                    <p className="text-[13px] font-medium text-[#57534E]">{formatComplianceType(task.compliance_type)}</p>
                    <p className="text-[11px] text-[#A8A29E]">{task.period}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#A8A29E]">{task.due_date}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] text-[10px] font-semibold">Filed ✓</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {active.length === 0 && filed.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[32px] mb-3">🎉</p>
            <p className="text-[14px] text-[#57534E]">No pending compliances.</p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-[#F0EFED] text-center">
          <p className="text-[11px] text-[#A8A29E]">🔒 Secured by DeadlineShield · Do not share this link</p>
        </div>
      </div>
    </div>
  );
}

function Stat({ n, label, color }: { n: number; label: string; color: string }) {
  return (
    <div className="flex-1 bg-[#FAFAF9] rounded-lg border border-[#E8E6E3] px-3 py-2 text-center">
      <p className="text-[18px] font-bold" style={{ color }}>{n}</p>
      <p className="text-[10px] text-[#A8A29E]">{label}</p>
    </div>
  );
}
