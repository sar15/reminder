"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { formatComplianceType } from "@/lib/utils";
import { Plus } from "lucide-react";

export default function AddTaskForm({
  clientId,
  complianceTypes,
}: {
  clientId: string;
  complianceTypes: string[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    compliance_type: complianceTypes[0] ?? "",
    period: "",
    due_date: "",
  });
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: userData } = await supabase
      .from("users")
      .select("firm_id")
      .eq("id", user.id)
      .single();

    await supabase.from("compliance_tasks").insert({
      client_id: clientId,
      firm_id: userData?.firm_id,
      compliance_type: form.compliance_type,
      period: form.period,
      due_date: form.due_date,
      status: "pending",
    });

    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 transition"
      >
        <Plus size={14} />
        Add Task
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-indigo-200 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-800">Add Compliance Task</h3>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Compliance</label>
          <select
            value={form.compliance_type}
            onChange={(e) => setForm({ ...form, compliance_type: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
            required
          >
            {complianceTypes.map((t) => (
              <option key={t} value={t}>{formatComplianceType(t)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Period</label>
          <input
            value={form.period}
            onChange={(e) => setForm({ ...form, period: e.target.value })}
            placeholder="e.g. 2026-04"
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
            required
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Due Date</label>
          <input
            type="date"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
            required
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Add Task"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
