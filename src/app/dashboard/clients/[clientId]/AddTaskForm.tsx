"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatComplianceType } from "@/lib/utils";
import { Plus } from "lucide-react";

export default function AddTaskForm({ clientId, complianceTypes }: { clientId: string; complianceTypes: string[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ compliance_type: complianceTypes[0] ?? "", period: "", due_date: "" });
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setOpen(false); setLoading(false); router.refresh();
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#D6D3CF] text-[12px] text-[#A8A29E] hover:border-[#6D28D9] hover:text-[#6D28D9] hover:bg-[#FAFAF9] transition-all">
      <Plus size={13} /> Add compliance task
    </button>
  );

  return (
    <form onSubmit={submit} className="bg-white rounded-xl border border-[#DDD6FE] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <p className="text-[13px] font-semibold text-[#1C1917] mb-4">Add Compliance Task</p>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Compliance", content: (
            <select value={form.compliance_type} onChange={e => setForm({...form, compliance_type: e.target.value})} required className="w-full border border-[#E8E6E3] rounded-lg px-3 py-2 text-[12px] text-[#1C1917] bg-white focus:outline-none focus:border-[#6D28D9]">
              {complianceTypes.map(t => <option key={t} value={t}>{formatComplianceType(t)}</option>)}
            </select>
          )},
          { label: "Period", content: (
            <input value={form.period} onChange={e => setForm({...form, period: e.target.value})} placeholder="e.g. 2026-04" required className="w-full border border-[#E8E6E3] rounded-lg px-3 py-2 text-[12px] text-[#1C1917] focus:outline-none focus:border-[#6D28D9]" />
          )},
          { label: "Due Date", content: (
            <input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} required className="w-full border border-[#E8E6E3] rounded-lg px-3 py-2 text-[12px] text-[#1C1917] focus:outline-none focus:border-[#6D28D9]" />
          )},
        ].map(({ label, content }) => (
          <div key={label}>
            <label className="block text-[10px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-1.5">{label}</label>
            {content}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-[#6D28D9] text-white text-[12px] font-semibold hover:bg-[#5B21B6] disabled:opacity-50 transition-colors">
          {loading ? "Saving…" : "Add Task"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border border-[#E8E6E3] text-[#57534E] text-[12px] hover:bg-[#F5F5F4] transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
