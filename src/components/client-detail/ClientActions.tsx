"use client";

import { useState } from "react";
import { Plus, Bell, X, Loader2, CheckCircle2 } from "lucide-react";
import { formatComplianceType } from "@/lib/utils";
import { SlideOver } from "@/components/shared/SlideOver";
import { RemindSlideOver } from "@/components/remind/RemindSlideOver";
import type { ComplianceType } from "@/types";

const ALL_TYPES: ComplianceType[] = [
  "GSTR1", "GSTR3B", "GSTR9",
  "TDS_PAYMENT", "TDS_RETURN_24Q", "TDS_RETURN_26Q",
  "ADVANCE_TAX", "ITR_NON_AUDIT", "ITR_AUDIT", "TAX_AUDIT_3CD",
  "AOC4", "MGT7", "DIR3_KYC", "MSME1", "PF", "ESI", "LLP_FORM11",
];

export function ClientActions({ clientId }: { clientId: string }) {
  const [taskOpen, setTaskOpen] = useState(false);
  const [remindOpen, setRemindOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const [complianceType, setComplianceType] = useState<ComplianceType>("GSTR3B");
  const [period, setPeriod] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 10);
  });

  async function submitTask(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          compliance_type: complianceType,
          period,
          due_date: dueDate,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? "Failed to create task.");
        return;
      }

      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function resetAndClose() {
    setTaskOpen(false);
    if (done) {
      window.location.reload();
    }
    setTimeout(() => {
      setDone(false);
      setError("");
    }, 300);
  }

  const ic = "w-full border border-[#e2e8f0] rounded-xl px-4 py-2.5 text-sm text-[#0f172a] bg-[#f8fafc] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#bfdbfe] focus:ring-4 focus:ring-[#eff6ff] focus:bg-white transition-all";

  return (
    <>
      <button
        onClick={() => setRemindOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#475569] border border-[#e2e8f0] rounded-xl text-sm font-semibold hover:bg-[#f8fafc] hover:text-[#0f172a] transition-all shadow-sm"
      >
        <Bell size={16} /> Remind
      </button>
      <button
        onClick={() => setTaskOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#1d4ed8] text-white rounded-xl text-sm font-semibold hover:bg-[#1e40af] transition-all shadow-sm"
      >
        <Plus size={16} /> Add Task
      </button>

      {/* Add Task Slide-Over */}
      <SlideOver
        isOpen={taskOpen}
        onClose={resetAndClose}
        title={done ? "Task Created" : "Add Compliance Task"}
        description={done ? undefined : "Create a new compliance task for this client."}
      >
        {done ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-[#f0fdf4] text-[#16a34a] rounded-full flex items-center justify-center mb-6 shadow-sm">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-[#0f172a] mb-2">Task Created</h3>
            <p className="text-sm text-[#64748b] mb-8">
              {formatComplianceType(complianceType)} for period {period} has been added.
            </p>
            <button onClick={resetAndClose} className="w-full py-3 bg-[#1d4ed8] text-white rounded-xl font-semibold hover:bg-[#1e40af]">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submitTask} className="flex flex-col gap-6">
            <div>
              <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Compliance Type</label>
              <select
                value={complianceType}
                onChange={(e) => setComplianceType(e.target.value as ComplianceType)}
                className={ic}
              >
                {ALL_TYPES.map(t => (
                  <option key={t} value={t}>{formatComplianceType(t)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Period</label>
              <input
                required
                type="text"
                placeholder="e.g. 2026-04 or FY2025-26"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className={ic}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Due Date</label>
              <input
                required
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={ic}
              />
            </div>

            {error && (
              <div className="px-4 py-3 bg-[#fff1f2] border border-[#fecdd3] rounded-xl text-sm font-medium text-[#be123c]">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-[#f1f5f9]">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1d4ed8] text-white rounded-xl text-sm font-semibold hover:bg-[#1e40af] disabled:opacity-50 transition-all shadow-sm"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? "Creating..." : "Create Task"}
              </button>
              <button
                type="button"
                onClick={resetAndClose}
                className="px-5 py-3 bg-white text-[#475569] border border-[#e2e8f0] rounded-xl text-sm font-semibold hover:bg-[#f8fafc] transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </SlideOver>

      {/* Remind Slide-Over */}
      <RemindSlideOver
        isOpen={remindOpen}
        onClose={() => setRemindOpen(false)}
        clientId={clientId}
      />
    </>
  );
}
