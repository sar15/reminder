import { getClient, getTasksForClient, getAuditLogsForClient } from "@/lib/data";
import { formatComplianceType, daysUntilDue, getRiskLevel, getPenaltyPerDay } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, FileText, Mail, Phone } from "lucide-react";
import AddTaskForm from "./AddTaskForm";

export default async function ClientDetailPage({
  params,
}: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const [client, tasks, logs] = await Promise.all([
    getClient(clientId), getTasksForClient(clientId), getAuditLogsForClient(clientId),
  ]);
  if (!client) notFound();

  const active  = tasks.filter((t) => t.status !== "filed");
  const filed   = tasks.filter((t) => t.status === "filed");
  const risk    = getRiskLevel(active);

  const penalty = active
    .filter((t) => daysUntilDue(t.due_date) < 0)
    .reduce((s, t) => s + getPenaltyPerDay(t.compliance_type) * Math.abs(daysUntilDue(t.due_date)), 0);

  const RISK = {
    red:    { label: "Critical",      bg: "#FEF2F2", border: "#FECACA", text: "#991B1B", dot: "#DC2626" },
    yellow: { label: "Awaiting Docs", bg: "#FFFBEB", border: "#FDE68A", text: "#92400E", dot: "#D97706" },
    green:  { label: "On Track",      bg: "#ECFDF5", border: "#A7F3D0", text: "#065F46", dot: "#059669" },
  }[risk];

  const STATUS: Record<string, { bg: string; text: string; label: string }> = {
    pending:       { bg: "#F5F5F4", text: "#57534E", label: "Pending" },
    waiting_docs:  { bg: "#FFFBEB", text: "#92400E", label: "Waiting Docs" },
    docs_received: { bg: "#EFF6FF", text: "#1E40AF", label: "Docs Received" },
    in_progress:   { bg: "#EFF6FF", text: "#1E40AF", label: "In Progress" },
    review_ready:  { bg: "#EDE9FE", text: "#5B21B6", label: "Review Ready" },
    filed:         { bg: "#ECFDF5", text: "#065F46", label: "Filed ✓" },
    overdue:       { bg: "#FEF2F2", text: "#991B1B", label: "Overdue" },
  };

  const AUDIT_CFG: Record<string, { icon: string; label: string; color: string }> = {
    reminder_sent: { icon: "📤", label: "Reminder Sent",       color: "#6D28D9" },
    delivered:     { icon: "✅", label: "Delivered",            color: "#059669" },
    opened:        { icon: "👁️", label: "Opened by Client",    color: "#2563EB" },
    doc_uploaded:  { icon: "📎", label: "Document Uploaded",   color: "#059669" },
    filed:         { icon: "🏛️", label: "Return Filed",        color: "#065F46" },
    escalated:     { icon: "🚨", label: "Escalated",           color: "#DC2626" },
  };

  return (
    <div className="p-7 max-w-[1080px]">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/clients" className="w-8 h-8 rounded-lg bg-white border border-[#E8E6E3] flex items-center justify-center text-[#57534E] hover:bg-[#F5F5F4] transition-colors">
            <ArrowLeft size={14} />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center text-[15px] font-bold text-[#6D28D9]">
            {client.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-[20px] font-semibold text-[#1C1917] tracking-tight">{client.name}</h1>
            <div className="flex items-center gap-3 mt-0.5">
              {client.pan   && <span className="text-[11px] font-mono text-[#A8A29E]">PAN: {client.pan}</span>}
              {client.gstin && <span className="text-[11px] font-mono text-[#A8A29E]">GSTIN: {client.gstin}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-semibold" style={{ background: RISK.bg, borderColor: RISK.border, color: RISK.text }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: RISK.dot }} />
            {RISK.label}
          </span>
          <Link href={`/dashboard/clients/${clientId}/remind`} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6D28D9] text-white text-[13px] font-medium hover:bg-[#5B21B6] transition-colors">
            <Send size={13} /> Send Reminder
          </Link>
          <Link href={`/dashboard/reports/${clientId}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[#E8E6E3] text-[#1C1917] text-[13px] font-medium hover:bg-[#F5F5F4] transition-colors">
            <FileText size={13} /> Liability Report
          </Link>
        </div>
      </div>

      {/* Contact strip */}
      <div className="flex items-center gap-4 mb-5 p-3.5 bg-white rounded-xl border border-[#E8E6E3]">
        {client.email && (
          <div className="flex items-center gap-2 text-[12px] text-[#57534E]">
            <Mail size={12} className="text-[#A8A29E]" /> {client.email}
          </div>
        )}
        {client.phone && (
          <div className="flex items-center gap-2 text-[12px] text-[#57534E]">
            <Phone size={12} className="text-[#A8A29E]" /> {client.phone}
          </div>
        )}
        {penalty > 0 && (
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA]">
            <span className="text-[12px] font-bold text-[#991B1B]">⚠ Penalty Exposure: ₹{penalty.toLocaleString("en-IN")}</span>
            <span className="text-[11px] text-[#DC2626]">accruing daily</span>
          </div>
        )}
      </div>

      {/* 2-col layout */}
      <div className="grid grid-cols-[1fr_280px] gap-5">

        {/* Left */}
        <div className="space-y-4">

          {/* Active tasks */}
          <div className="bg-white rounded-xl border border-[#E8E6E3] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <div className="px-5 py-3.5 border-b border-[#F0EFED] flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[#1C1917]">Active Tasks</span>
              <span className="text-[11px] text-[#A8A29E]">{active.length} pending</span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-[#FAFAF9] border-b border-[#F0EFED]">
                  {["Compliance", "Period", "Due Date", "Status"].map((h) => (
                    <th key={h} className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#A8A29E] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {active.map((t, i) => {
                  const d = daysUntilDue(t.due_date);
                  const p = getPenaltyPerDay(t.compliance_type);
                  const s = STATUS[t.status] ?? STATUS.pending;
                  return (
                    <tr key={t.id} className={`border-b border-[#F5F5F4] last:border-0 ${d < 0 ? "bg-[#FFFAFA]" : "hover:bg-[#FAFAF9]"} transition-colors`}>
                      <td className="px-5 py-3">
                        <p className="text-[13px] font-medium text-[#1C1917]">{formatComplianceType(t.compliance_type)}</p>
                        {p > 0 && <p className="text-[10px] text-[#A8A29E] mt-0.5">₹{p}/day penalty</p>}
                      </td>
                      <td className="px-5 py-3 text-[12px] text-[#57534E]">{t.period}</td>
                      <td className="px-5 py-3">
                        <p className="text-[13px] font-semibold" style={{ color: d < 0 ? "#DC2626" : d <= 5 ? "#D97706" : "#1C1917" }}>
                          {t.due_date}
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: d < 0 ? "#DC2626" : "#A8A29E" }}>
                          {d < 0 ? `${Math.abs(d)}d overdue` : `${d}d remaining`}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: s.bg, color: s.text }}>
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {active.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-[13px] text-[#A8A29E]">
                    ✅ All tasks filed. Client is fully compliant.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>

          <AddTaskForm clientId={clientId} complianceTypes={client.compliance_types as string[]} />

          {/* Filed */}
          {filed.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E8E6E3] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
              <div className="px-5 py-3.5 border-b border-[#F0EFED] flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[#1C1917]">Filed Returns</span>
                <span className="text-[11px] font-semibold text-[#059669]">{filed.length} completed</span>
              </div>
              {filed.map((t, i) => (
                <div key={t.id} className={`px-5 py-3 flex items-center justify-between ${i < filed.length - 1 ? "border-b border-[#F5F5F4]" : ""}`}>
                  <div>
                    <p className="text-[13px] font-medium text-[#57534E]">{formatComplianceType(t.compliance_type)}</p>
                    <p className="text-[11px] text-[#A8A29E]">{t.period}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-[#A8A29E]">{t.due_date}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] text-[10px] font-semibold">Filed ✓</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — audit trail */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E8E6E3] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <div className="px-4 py-3.5 border-b border-[#F0EFED]">
              <p className="text-[13px] font-semibold text-[#1C1917]">Audit Trail</p>
              <p className="text-[10px] text-[#A8A29E] mt-0.5">Immutable · Court-admissible</p>
            </div>
            <div className="p-4 max-h-[420px] overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-[12px] text-[#A8A29E] text-center py-6">No activity yet</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-[10px] top-2 bottom-2 w-px bg-[#F0EFED]" />
                  <div className="space-y-4">
                    {logs.map((log) => {
                      const cfg = AUDIT_CFG[log.action] ?? { icon: "•", label: log.action, color: "#57534E" };
                      return (
                        <div key={log.id} className="flex gap-3 relative">
                          <div className="w-5 h-5 rounded-full bg-white border border-[#E8E6E3] flex items-center justify-center text-[10px] flex-shrink-0 z-10">
                            {cfg.icon}
                          </div>
                          <div className="flex-1 pb-1">
                            <p className="text-[12px] font-semibold" style={{ color: cfg.color }}>{cfg.label}</p>
                            {log.channel && <p className="text-[10px] text-[#A8A29E]">via {log.channel}</p>}
                            {log.message_id && <p className="text-[10px] text-[#D6D3CF] font-mono truncate">{log.message_id}</p>}
                            <p className="text-[10px] text-[#A8A29E] mt-0.5">
                              {new Date(log.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Compliance types */}
          <div className="bg-white rounded-xl border border-[#E8E6E3] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <p className="text-[10px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-3">Applicable Compliances</p>
            <div className="flex flex-wrap gap-1.5">
              {client.compliance_types.map((t) => (
                <span key={t} className="px-2 py-1 rounded-md bg-[#EDE9FE] text-[#5B21B6] text-[10px] font-medium border border-[#DDD6FE]">
                  {formatComplianceType(t)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
