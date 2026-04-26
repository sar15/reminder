"use client";

import { formatComplianceType } from "@/lib/utils";
import type { ComplianceTask } from "@/types";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export function FiledReturns({ tasks }: { tasks: ComplianceTask[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const filedTasks = tasks.filter(t => t.status === "filed");

  if (filedTasks.length === 0) return null;

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm overflow-hidden mt-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#f8fafc] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#f0fdf4] text-[#16a34a] flex items-center justify-center">
            <CheckCircle2 size={16} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-[#0f172a]">Filed Returns</h3>
            <p className="text-xs text-[#64748b]">{filedTasks.length} completed compliances</p>
          </div>
        </div>
        {isOpen ? <ChevronUp size={20} className="text-[#94a3b8]" /> : <ChevronDown size={20} className="text-[#94a3b8]" />}
      </button>
      
      {isOpen && (
        <div className="border-t border-[#f1f5f9] divide-y divide-[#f1f5f9]">
          {filedTasks.map(t => (
            <div key={t.id} className="flex items-center justify-between p-4 bg-[#f8fafc]">
              <div>
                <div className="text-sm font-medium text-[#475569]">
                  {formatComplianceType(t.compliance_type)}
                </div>
                <div className="text-xs text-[#94a3b8] mt-0.5">
                  Period {t.period}
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]">
                Filed
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
