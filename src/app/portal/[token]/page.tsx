import { validateMagicLink } from "@/lib/magic-link";
import { MOCK_CLIENTS, MOCK_TASKS } from "@/lib/mock-data";
import { formatComplianceType } from "@/lib/utils";
import { Shield } from "lucide-react";
import PortalUpload from "./PortalUpload";

const DOCS: Record<string, string[]> = {
  GSTR1:          ["Sales Register", "Invoice Summary", "E-way Bills (if any)"],
  GSTR3B:         ["Bank Statement", "Sales Register", "Purchase Register", "Expense Invoices"],
  TDS_PAYMENT:    ["Salary Sheet", "Vendor Payment Details"],
  TDS_RETURN_24Q: ["Salary Details", "TDS Certificates (Form 16)"],
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

const DEMO_TOKENS: Record<string, string> = {
  "demo-sharma": "1",
  "demo-patel":  "3",
  "demo-reddy":  "5",
  "demo-mehta":  "2",
  "demo-gupta":  "4",
};

export default async function PortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let client: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tasks: any[] = [];
  let isDemo = false;

  // Demo tokens
  const demoId = DEMO_TOKENS[token];
  if (demoId) {
    client = MOCK_CLIENTS.find((c) => c.id === demoId) ?? null;
    tasks  = MOCK_TASKS.filter((t) => t.client_id === demoId);
    isDemo = true;
  } else {
    // Real token — validate against DB
    const link = await validateMagicLink(token).catch(() => null);
    if (link) {
      client = link.clients;
      try {
        const { createAdminClient } = await import("@/lib/supabase/admin");
        const supabase = createAdminClient();
        const { data } = await supabase
          .from("compliance_tasks")
          .select("*")
          .eq("client_id", client.id)
          .neq("status", "filed")
          .order("due_date");
        tasks = data ?? [];
      } catch {
        tasks = [];
      }
    }
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-[40px] mb-3">🔗</div>
          <p className="text-[16px] font-semibold text-[#111827] mb-1">Link expired or invalid</p>
          <p className="text-[13px] text-[#9ca3af]">Please contact your CA for a new link.</p>
        </div>
      </div>
    );
  }

  const active = tasks.filter((t) => t.status !== "filed");
  const filed  = tasks.filter((t) => t.status === "filed");

  return (
    <div className="min-h-screen bg-[#fafafa]">

      {/* Header */}
      <div className="bg-white border-b border-[#e5e7eb] px-4 pt-5 pb-4">
        <div className="max-w-[520px] mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-[#2563eb] rounded-[6px] flex items-center justify-center">
              <Shield size={12} className="text-white" />
            </div>
            <span className="text-[11px] text-[#9ca3af] font-medium">
              DeadlineShield · Secure Client Portal
            </span>
          </div>
          <h1 className="text-[18px] font-bold text-[#111827]">{client.name}</h1>
          <p className="text-[12px] text-[#9ca3af] mt-0.5">
            {client.contact_name && `${client.contact_name} · `}
            {client.pan && `PAN: ${client.pan}`}
          </p>
          {isDemo && (
            <span className="inline-block mt-2 text-[10px] font-semibold text-[#92400e] bg-[#fffbeb] border border-[#fde68a] px-2 py-0.5 rounded-full">
              Demo Mode
            </span>
          )}
        </div>
      </div>

      <div className="max-w-[520px] mx-auto px-4 py-5 flex flex-col gap-4">

        {/* Active tasks */}
        {active.length > 0 && (
          <div>
            <div className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wide mb-3">
              Action Required ({active.length})
            </div>
            <div className="flex flex-col gap-3">
              {active.map((task) => {
                const d       = Math.ceil((new Date(task.due_date).getTime() - Date.now()) / 86400000);
                const overdue = d < 0;
                const urgent  = d <= 3 && !overdue;
                const docs    = DOCS[task.compliance_type] ?? DOCS.DEFAULT;
                const accent  = overdue ? "#dc2626" : urgent ? "#d97706" : "#2563eb";
                const accentBorder = overdue ? "border-[#fecaca]" : urgent ? "border-[#fde68a]" : "border-[#bfdbfe]";
                const accentText   = overdue ? "text-[#dc2626]"   : urgent ? "text-[#d97706]"   : "text-[#2563eb]";
                const accentBg     = overdue ? "bg-[#fef2f2]"     : urgent ? "bg-[#fffbeb]"     : "bg-[#eff6ff]";
                const canUpload    = task.status === "pending" || task.status === "waiting_docs";

                return (
                  <div
                    key={task.id}
                    className={`bg-white border ${accentBorder} rounded-[12px] overflow-hidden`}
                  >
                    <div className="h-[3px]" style={{ background: accent }} />
                    <div className="p-4">

                      {/* Task header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-[14px] font-bold text-[#111827]">
                            {formatComplianceType(task.compliance_type)}
                          </div>
                          <div className="text-[11px] text-[#9ca3af] mt-0.5">Period: {task.period}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] text-[#9ca3af]">Due</div>
                          <div className={`text-[13px] font-bold ${accentText}`}>{task.due_date}</div>
                          <div className={`text-[11px] font-semibold ${accentText}`}>
                            {overdue ? `${Math.abs(d)}d overdue` : `${d}d left`}
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className={`text-[12px] font-medium ${accentText} mb-3`}>
                        {task.status === "docs_received" || task.status === "in_progress"
                          ? "✅ Documents received — CA is processing"
                          : task.status === "review_ready"
                          ? "🔍 Under review — filing soon"
                          : overdue
                          ? "🚨 OVERDUE — upload documents immediately"
                          : "📋 Please upload the documents below"}
                      </div>

                      {/* Required docs */}
                      <div className={`${accentBg} rounded-[8px] p-3 mb-3`}>
                        <div className={`text-[10px] font-bold uppercase tracking-wide mb-2 ${accentText}`}>
                          Documents Required
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {docs.map((doc) => (
                            <div key={doc} className="flex items-center gap-2">
                              <div
                                className="w-3.5 h-3.5 rounded-[3px] border-[1.5px] flex-shrink-0"
                                style={{ borderColor: accent }}
                              />
                              <span className="text-[12px] text-[#374151]">{doc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Upload component */}
                      {canUpload && !isDemo && (
                        <PortalUpload
                          token={token}
                          taskId={task.id}
                          accentColor={accent}
                        />
                      )}

                      {/* Demo mode placeholder */}
                      {canUpload && isDemo && (
                        <div className="flex gap-2">
                          <button
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-white rounded-[8px] text-[13px] font-bold"
                            style={{ background: accent }}
                          >
                            📷 Camera
                          </button>
                          <button
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white rounded-[8px] text-[13px] font-bold border-[1.5px]"
                            style={{ color: accent, borderColor: accent }}
                          >
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

        {/* Filed tasks */}
        {filed.length > 0 && (
          <div>
            <div className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wide mb-3">
              Completed ({filed.length})
            </div>
            <div className="flex flex-col gap-2">
              {filed.map((task) => (
                <div
                  key={task.id}
                  className="bg-white border border-[#e5e7eb] rounded-[10px] px-4 py-3 flex items-center justify-between"
                >
                  <div>
                    <div className="text-[13px] font-medium text-[#6b7280]">
                      {formatComplianceType(task.compliance_type)}
                    </div>
                    <div className="text-[11px] text-[#9ca3af] mt-0.5">{task.period}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#ecfdf5] text-[#065f46]">
                    Filed ✓
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {active.length === 0 && filed.length === 0 && (
          <div className="text-center py-12">
            <div className="text-[36px] mb-3">🎉</div>
            <p className="text-[14px] text-[#6b7280]">All caught up! No pending compliances.</p>
          </div>
        )}

        <div className="text-center pt-2 border-t border-[#e5e7eb]">
          <p className="text-[11px] text-[#9ca3af]">
            🔒 Secured by DeadlineShield · Do not share this link
          </p>
        </div>
      </div>
    </div>
  );
}
