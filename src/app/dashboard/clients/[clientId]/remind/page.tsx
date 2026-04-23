"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatComplianceType } from "@/lib/utils";
import { MOCK_CLIENTS, MOCK_TASKS } from "@/lib/mock-data";
import Link from "next/link";
import { ArrowLeft, Send, Shield, CheckCircle2 } from "lucide-react";

const CADENCES = [
  { key: "T-15", label: "T-15", desc: "First gentle nudge",  color: "#57534E", bg: "#F5F5F4", border: "#E8E6E3" },
  { key: "T-10", label: "T-10", desc: "Document checklist",  color: "#1E40AF", bg: "#EFF6FF", border: "#BFDBFE" },
  { key: "T-7",  label: "T-7",  desc: "Formal reminder",     color: "#5B21B6", bg: "#EDE9FE", border: "#DDD6FE" },
  { key: "T-3",  label: "T-3",  desc: "Urgent warning",      color: "#92400E", bg: "#FFFBEB", border: "#FDE68A" },
  { key: "T-1",  label: "T-1",  desc: "Final notice",        color: "#991B1B", bg: "#FEF2F2", border: "#FECACA" },
  { key: "T+1",  label: "T+1",  desc: "Overdue notice",      color: "#7F1D1D", bg: "#FFF1F2", border: "#FECDD3" },
];

const PREVIEW: Record<string, string> = {
  "T-15": "This is a friendly reminder that your compliance filing is due in 15 days. Please start gathering the required documents at your earliest convenience.",
  "T-10": "Your compliance filing is due in 10 days. Please upload the required documents: Bank Statement, Sales Register, Purchase Register, and Expense Invoices.",
  "T-7":  "Your filing deadline is in 7 days. We have not yet received your documents. Please upload them immediately to avoid any delays.",
  "T-3":  "URGENT: Your filing deadline is in 3 days. Documents have not been received. Failure to upload by tomorrow may result in late fees and penalties.",
  "T-1":  "FINAL NOTICE: Your filing is due TOMORROW. If documents are not received today, we cannot guarantee timely filing. Penalties will apply.",
  "T+1":  "Your filing deadline has passed. Penalties are now accruing daily. Please upload documents immediately and contact us to discuss next steps.",
};

export default function RemindPage() {
  const { clientId } = useParams() as { clientId: string };
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [cadence, setCadence] = useState("T-3");
  const [email, setEmail] = useState(true);
  const [whatsapp, setWhatsapp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const c = MOCK_CLIENTS.find(x => x.id === clientId);
    const t = MOCK_TASKS.filter(x => x.client_id === clientId && x.status !== "filed");
    setClient(c ?? null); setTasks(t);
    if (t.length > 0) setSelectedTask(t[0].id);
  }, [clientId]);

  const taskData = tasks.find(t => t.id === selectedTask);
  const cad = CADENCES.find(c => c.key === cadence)!;

  async function send() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setSent(true); setLoading(false);
  }

  if (!client) return <div className="p-7 text-[13px] text-[#A8A29E]">Loading…</div>;

  if (sent) return (
    <div className="p-7 max-w-[480px] mx-auto mt-16 text-center">
      <div className="w-14 h-14 rounded-full bg-[#ECFDF5] flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 size={28} className="text-[#059669]" />
      </div>
      <h2 className="text-[18px] font-semibold text-[#1C1917] mb-2">Reminder Sent</h2>
      <p className="text-[13px] text-[#57534E] mb-6">
        {cadence} reminder sent to <strong>{client.email}</strong>
      </p>
      <div className="bg-[#FAFAF9] rounded-xl border border-[#E8E6E3] p-4 text-left space-y-2.5 mb-6">
        {["Logged in immutable audit trail with IST timestamp", "Message ID recorded for delivery proof", "Task status updated to Waiting Docs", "Liability Report updated automatically"].map(item => (
          <div key={item} className="flex items-center gap-2.5 text-[12px] text-[#57534E]">
            <span className="text-[#059669]">✓</span> {item}
          </div>
        ))}
      </div>
      <div className="flex gap-2 justify-center">
        <button onClick={() => setSent(false)} className="px-4 py-2 rounded-lg border border-[#E8E6E3] text-[#57534E] text-[13px] hover:bg-[#F5F5F4] transition-colors">Send Another</button>
        <Link href={`/dashboard/clients/${clientId}`} className="px-4 py-2 rounded-lg bg-[#6D28D9] text-white text-[13px] font-medium hover:bg-[#5B21B6] transition-colors">Back to Client</Link>
      </div>
    </div>
  );

  return (
    <div className="p-7 max-w-[960px]">
      <div className="flex items-center gap-3 mb-7">
        <Link href={`/dashboard/clients/${clientId}`} className="w-8 h-8 rounded-lg bg-white border border-[#E8E6E3] flex items-center justify-center text-[#57534E] hover:bg-[#F5F5F4] transition-colors">
          <ArrowLeft size={14} />
        </Link>
        <div>
          <h1 className="text-[20px] font-semibold text-[#1C1917] tracking-tight">Send Reminder</h1>
          <p className="text-[13px] text-[#A8A29E] mt-0.5">{client.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-6">
        {/* Config */}
        <div className="space-y-4">

          {/* Step 1 — Task */}
          <div className="bg-white rounded-xl border border-[#E8E6E3] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <p className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-4">1 · Select Task</p>
            {tasks.length === 0
              ? <p className="text-[13px] text-[#A8A29E]">No pending tasks.</p>
              : <div className="space-y-2">
                  {tasks.map(t => {
                    const d = Math.ceil((new Date(t.due_date).getTime() - Date.now()) / 86400000);
                    const sel = selectedTask === t.id;
                    return (
                      <label key={t.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${sel ? "border-[#DDD6FE] bg-[#FAFAF9]" : "border-[#E8E6E3] hover:border-[#D6D3CF]"}`}>
                        <input type="radio" name="task" value={t.id} checked={sel} onChange={() => setSelectedTask(t.id)} className="accent-[#6D28D9]" />
                        <div className="flex-1">
                          <p className="text-[13px] font-semibold text-[#1C1917]">{formatComplianceType(t.compliance_type)}</p>
                          <p className="text-[11px] text-[#A8A29E]">{t.period}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[12px] text-[#57534E]">{t.due_date}</p>
                          <p className="text-[11px] font-semibold" style={{ color: d < 0 ? "#DC2626" : d <= 5 ? "#D97706" : "#A8A29E" }}>
                            {d < 0 ? `${Math.abs(d)}d overdue` : `${d}d left`}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
            }
          </div>

          {/* Step 2 — Cadence */}
          <div className="bg-white rounded-xl border border-[#E8E6E3] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <p className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-4">2 · Reminder Cadence</p>
            <div className="grid grid-cols-3 gap-2">
              {CADENCES.map(c => {
                const sel = cadence === c.key;
                return (
                  <button key={c.key} type="button" onClick={() => setCadence(c.key)}
                    className="p-3 rounded-lg border text-left transition-all"
                    style={{ borderColor: sel ? c.border : "#E8E6E3", background: sel ? c.bg : "#FAFAF9" }}
                  >
                    <p className="text-[13px] font-bold" style={{ color: sel ? c.color : "#1C1917" }}>{c.label}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: sel ? c.color : "#A8A29E" }}>{c.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3 — Channels */}
          <div className="bg-white rounded-xl border border-[#E8E6E3] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <p className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-4">3 · Send Via</p>
            <div className="flex gap-3 mb-4">
              {[
                { key: "email", icon: "📧", label: "Email", sub: client.email ?? "No email", active: email, toggle: () => setEmail(!email) },
                { key: "wa",    icon: "💬", label: "WhatsApp", sub: client.phone ?? "No phone", active: whatsapp, toggle: () => setWhatsapp(!whatsapp), disabled: !client.phone },
              ].map(ch => (
                <button key={ch.key} type="button" onClick={ch.toggle} disabled={ch.disabled}
                  className={`flex-1 p-3 rounded-lg border text-left transition-all ${ch.disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"} ${ch.active ? "border-[#DDD6FE] bg-[#FAFAF9]" : "border-[#E8E6E3] hover:border-[#D6D3CF]"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[15px]">{ch.icon}</span>
                    <span className="text-[12px] font-semibold text-[#1C1917]">{ch.label}</span>
                    {ch.active && <span className="ml-auto text-[#6D28D9] text-[11px] font-bold">✓</span>}
                  </div>
                  <p className="text-[10px] text-[#A8A29E] truncate">{ch.sub}</p>
                </button>
              ))}
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0]">
              <Shield size={12} className="text-[#059669] mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-[#065F46] leading-relaxed">
                <strong>1-to-1 only.</strong> Sent exclusively to {client.contact_name ?? client.name}. No CC, no BCC, no privacy breach.
              </p>
            </div>
          </div>
        </div>

        {/* Preview + send */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E8E6E3] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <div className="px-4 py-3 bg-[#1C1917]">
              <p className="text-[10px] font-semibold text-[#A8A29E] uppercase tracking-wider">Preview</p>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-[10px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-1">To</p>
                <p className="text-[12px] font-semibold text-[#1C1917]">{client.contact_name ?? client.name}</p>
                <p className="text-[11px] text-[#A8A29E]">{client.email}</p>
              </div>
              <div className="border-t border-[#F0EFED] pt-3">
                <p className="text-[10px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-1">Subject</p>
                <p className="text-[12px] font-semibold text-[#1C1917]">
                  {cadence === "T+1" ? "⚠️ Overdue: " : cadence === "T-1" ? "🚨 Final Notice: " : "Action Required: "}
                  {taskData ? formatComplianceType(taskData.compliance_type) : "Compliance Reminder"}
                </p>
              </div>
              <div className="border-t border-[#F0EFED] pt-3">
                <p className="text-[10px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-2">Body</p>
                <div className="bg-[#FAFAF9] rounded-lg p-3 text-[11px] text-[#57534E] leading-relaxed space-y-2">
                  <p>Dear {client.contact_name ?? client.name},</p>
                  <p>{PREVIEW[cadence]}</p>
                  {taskData && (
                    <div className="bg-white rounded-lg border border-[#E8E6E3] p-2.5 space-y-1 text-[10px]">
                      <p><strong>Compliance:</strong> {formatComplianceType(taskData.compliance_type)}</p>
                      <p><strong>Due Date:</strong> {taskData.due_date}</p>
                      {client.pan && <p><strong>PAN:</strong> {client.pan}</p>}
                    </div>
                  )}
                  <p className="text-[#A8A29E] text-[10px]">Confidential — sent only to you.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#EDE9FE] rounded-xl border border-[#DDD6FE] p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <Shield size={12} className="text-[#6D28D9]" />
              <p className="text-[11px] font-semibold text-[#5B21B6]">Audit Trail Protection</p>
            </div>
            <p className="text-[11px] text-[#6D28D9] leading-relaxed">
              This send is logged with timestamp, message ID, and delivery status — usable as legal proof in ICAI proceedings.
            </p>
          </div>

          <button onClick={send} disabled={loading || !selectedTask || (!email && !whatsapp)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#6D28D9] text-white text-[14px] font-semibold hover:bg-[#5B21B6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[0_2px_8px_rgba(109,40,217,0.3)]"
          >
            {loading
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending…</>
              : <><Send size={14} /> Send {cadence} Reminder</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
