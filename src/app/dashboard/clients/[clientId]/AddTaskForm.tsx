"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatComplianceType } from "@/lib/utils";
import { T, S } from "@/lib/tokens";

export default function AddTaskForm({ clientId, complianceTypes }: { clientId: string; complianceTypes: string[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ compliance_type: complianceTypes[0] ?? "", period: "", due_date: "" });
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setOpen(false); setLoading(false); router.refresh();
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 6,
      padding: "10px 16px", borderRadius: 10,
      border: `1px dashed ${T.borderStrong}`,
      background: "transparent",
      fontSize: 12, color: T.text3,
    }}>
      + Add compliance task
    </button>
  );

  return (
    <form onSubmit={submit} style={{ ...S.card, border: `1px solid ${T.brandBorder}`, padding: 18 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: T.text1, marginBottom: 14 }}>Add Compliance Task</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[
          { label: "Compliance", content: (
            <select value={form.compliance_type} onChange={e => setForm({...form, compliance_type: e.target.value})} required style={S.input}>
              {complianceTypes.map(t => <option key={t} value={t}>{formatComplianceType(t)}</option>)}
            </select>
          )},
          { label: "Period", content: (
            <input value={form.period} onChange={e => setForm({...form, period: e.target.value})} placeholder="e.g. 2026-04" required style={S.input} />
          )},
          { label: "Due Date", content: (
            <input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} required style={S.input} />
          )},
        ].map(({ label, content }) => (
          <div key={label}>
            <label style={{ ...S.label, display: "block", marginBottom: 5 }}>{label}</label>
            {content}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" disabled={loading} style={{ ...S.btnPrimary, opacity: loading ? 0.5 : 1 }}>
          {loading ? "Saving…" : "Add Task"}
        </button>
        <button type="button" onClick={() => setOpen(false)} style={S.btnSecondary}>Cancel</button>
      </div>
    </form>
  );
}
