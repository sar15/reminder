"use client";

import type { AuditLog } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Send, Eye, FileUp, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";

export function AuditTimeline({ logs }: { logs: AuditLog[] }) {
  const getIcon = (action: string) => {
    switch (action) {
      case "reminder_sent": return { icon: Send, color: "text-[#3b82f6]", bg: "bg-[#eff6ff]" };
      case "opened":        return { icon: Eye, color: "text-[#8b5cf6]", bg: "bg-[#f5f3ff]" };
      case "doc_uploaded":  return { icon: FileUp, color: "text-[#10b981]", bg: "bg-[#ecfdf5]" };
      case "filed":         return { icon: ShieldCheck, color: "text-[#14b8a6]", bg: "bg-[#f0fdfa]" };
      case "escalated":     return { icon: AlertTriangle, color: "text-[#ef4444]", bg: "bg-[#fef2f2]" };
      default:              return { icon: CheckCircle2, color: "text-[#64748b]", bg: "bg-[#f1f5f9]" };
    }
  };

  const getMessage = (log: any) => {
    switch (log.action) {
      case "reminder_sent": return `Reminder sent via ${log.channel}`;
      case "opened":        return `Client opened reminder email`;
      case "doc_uploaded":  return `Documents uploaded by client`;
      case "filed":         return `Compliance marked as filed`;
      case "escalated":     return `Issue escalated to partner`;
      default:              return log.action.replace(/_/g, " ");
    }
  };

  if (logs.length === 0) {
    return (
      <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm p-8 text-center">
        <p className="text-sm font-semibold text-[#0f172a]">No Activity Yet</p>
        <p className="text-xs text-[#64748b] mt-1">Audit log will track all reminders and responses.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm overflow-hidden h-[400px] flex flex-col">
      <div className="px-5 py-4 border-b border-[#f1f5f9] bg-[#f8fafc]/50">
        <h3 className="text-sm font-bold text-[#0f172a]">Audit Trail</h3>
        <p className="text-[10px] text-[#64748b] uppercase tracking-wider mt-0.5">Immutable • Court Admissible</p>
      </div>
      
      <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
        <div className="relative border-l border-[#e2e8f0] ml-3 space-y-6">
          {logs.map((log) => {
            const { icon: Icon, color, bg } = getIcon(log.action);
            return (
              <div key={log.id} className="relative pl-6">
                <div className={`absolute -left-[13px] top-0.5 w-[26px] h-[26px] rounded-full border-4 border-white ${bg} flex items-center justify-center`}>
                  <Icon size={10} className={color} />
                </div>
                
                <div>
                  <div className="text-sm font-semibold text-[#0f172a]">
                    {getMessage(log)}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-medium text-[#64748b]">
                      {new Date(log.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="text-xs text-[#cbd5e1]">•</span>
                    <span className="text-[11px] text-[#94a3b8]">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
