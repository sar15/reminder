"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatComplianceType } from "@/lib/utils";

export default function AddTaskForm({
  clientId,
  complianceTypes,
}: {
  clientId: string;
  complianceTypes: string[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ compliance_type: complianceTypes[0] ?? "", period: "", due_date: "" });
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // In demo mode, just simulate
    await new Promise((r) => setTimeout(r, 600));
    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          background: "none", border: "1px dashed #d1d5db",
          borderRadius: 8, padding: "10px 18px",
          fontSize: 13, color: "#6b7280", cursor: "pointer",
          width: "100%", textAlign: "left",
        }}
      >
        + Add compliance task
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{
      background: "#fff", border: "1px solid #e0e7ff",
      borderRadius: 10, padding: 18,
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 14 }}>Add Compliance Task</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 5 }}>Compliance</label>
          <select
            value={form.compliance_type}
            onChange={(e) => setForm({ ...form, compliance_type: e.target.value })}
            required
            style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: 12 }}
          >
            {complianceTypes.map((t) => (
              <option key={t} value={t}>{formatComplianceType(t)}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 5 }}>Period</label>
          <input
            value={form.period}
            onChange={(e) => setForm({ ...form, period: e.target.value })}
            placeholder="e.g. 2026-04"
            required
            style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: 12 }}
          />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 5 }}>Due Date</label>
          <input
            type="date"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            required
            style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: 12 }}
          />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" disabled={loading} style={{
          background: "#4f46e5", color: "#fff",
          border: "none", borderRadius: 6, padding: "8px 16px",
          fontSize: 12, fontWeight: 600, cursor: "pointer",
        }}>
          {loading ? "Saving..." : "Add Task"}
        </button>
        <button type="button" onClick={() => setOpen(false)} style={{
          background: "none", border: "1px solid #e5e7eb",
          borderRadius: 6, padding: "8px 16px",
          fontSize: 12, color: "#6b7280", cursor: "pointer",
        }}>
          Cancel
        </button>
      </div>
    </form>
  );
}
