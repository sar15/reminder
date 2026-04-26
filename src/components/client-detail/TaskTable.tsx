"use client";

import { useState } from "react";
import { formatComplianceType, daysUntilDue } from "@/lib/utils";
import type { ComplianceTask } from "@/types";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";

export function TaskTable({ tasks }: { tasks: ComplianceTask[] }) {
  const activeTasks = tasks.filter(t => t.status !== "filed");
  
  if (activeTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-[#f8fafc] rounded-2xl border border-dashed border-[#cbd5e1]">
        <div className="w-12 h-12 rounded-full bg-[#f0fdf4] text-[#16a34a] flex items-center justify-center mb-3">
          <CheckCircle2 size={24} />
        </div>
        <p className="text-sm font-semibold text-[#0f172a]">All clear</p>
        <p className="text-xs text-[#64748b] mt-1">There are no active compliance tasks for this client.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#f1f5f9] bg-[#f8fafc]/50 flex justify-between items-center">
        <h3 className="text-sm font-bold text-[#0f172a]">Active Tasks</h3>
        <span className="text-xs font-semibold text-[#64748b] bg-[#f1f5f9] px-2 py-1 rounded-md">{activeTasks.length} pending</span>
      </div>
      
      <div className="divide-y divide-[#f1f5f9]">
        {activeTasks.map(t => {
          const d = daysUntilDue(t.due_date);
          const isOverdue = d < 0;
          const isWarning = d >= 0 && d <= 7;
          
          return (
            <div key={t.id} className="flex items-center justify-between p-4 hover:bg-[#f8fafc] transition-colors">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  isOverdue ? "border-[#e11d48]" : isWarning ? "border-[#ea580c]" : "border-[#cbd5e1]"
                }`}>
                  {isOverdue && <div className="w-2 h-2 rounded-full bg-[#e11d48]" />}
                  {isWarning && <div className="w-2 h-2 rounded-full bg-[#ea580c]" />}
                </div>
                
                <div>
                  <div className="text-sm font-semibold text-[#0f172a]">
                    {formatComplianceType(t.compliance_type)}
                  </div>
                  <div className="text-xs text-[#64748b] mt-0.5">
                    Period {t.period}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xs font-medium text-[#0f172a]">{t.due_date}</div>
                <div className={`text-[11px] font-bold mt-0.5 ${
                  isOverdue ? "text-[#e11d48]" : isWarning ? "text-[#ea580c]" : "text-[#64748b]"
                }`}>
                  {isOverdue ? `${Math.abs(d)}d overdue` : `Due in ${d}d`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
