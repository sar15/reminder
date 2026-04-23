import { getClient, getTasksForClient, getAuditLogsForClient } from "@/lib/data";
import { formatComplianceType, daysUntilDue, getRiskLevel, getPenaltyPerDay } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Send, FileText, Mail, Phone,
  Building2, AlertTriangle, CheckCircle2, Clock,
} from "lucide-react";
import AddTaskForm from "./AddTaskForm";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const [client, tasks, logs] = await Promise.all([
    getClient(clientId),
    getTasksForClient(clientId),
    getAuditLogsForClient(clientId),
  ]);
  if (!client) notFound();

  const activeTasks = tasks.filter((t) => t.status !== "filed");
  const filedTasks = tasks.filter((t) => t.status === "filed");
  const riskLevel = getRiskLevel(activeTasks);

  // Calculate total penalty exposure
  const penaltyExposure = activeTasks
    .filter((t) => daysUntilDue(t.due_date) < 0)
    .reduce((sum, t) => {
      const overdueDays = Math.abs(daysUntilDue(t.due_date));
      return sum + getPenaltyPerDay(t.compliance_type) * overdueDays;
    }, 0);

  const riskConfig = {
    red: { label: "Critical", bg: "bg-red-50", border: "border-red-200", text: "text-red-700", dot: "bg-red-500" },
    yellow: { label: "Awaiting Docs", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-400" },
    green: { label: "On Track", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  }[riskLevel];

  const actionLabels: Record<string, { label: string; color: string }> = {
    reminder_sent: { label: "Reminder Sent", color: "text-indigo-600" },
    delivered: { label: "Delivered", color: "text-emerald-600" },
    opened: { label: "Opened by Client", color: "text-blue-600" },
    doc_uploaded: { label: "Document Uploaded", color: "text-emerald-600" },
    filed: { label: "Return Filed", color: "text-emerald-700" },
    escalated: { label: "Escalated to Partner", color: "text-red-600" },
  };

  const actionIcons: Record<string, string> = {
    reminder_sent: "📤",
    delivered: "✅",
    opened: "👁️",
    doc_uploaded: "📎",
    filed: "🏛️",
    escalated: "🚨",
  };

  return (
    <div className="p-6 max-w-6xl space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/clients" className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition">
            <ArrowLeft size={15} className="text-slate-500" />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <span className="text-sm font-bold text-indigo-600">{client.name.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{client.name}</h1>
            <div className="flex items-center gap-3 mt-0.5">
              {client.pan && <span className="text-xs font-mono text-slate-400">PAN: {client.pan}</span>}
              {client.gstin && <span className="text-xs font-mono text-slate-400">GSTIN: {client.gstin}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${riskConfig.bg} ${riskConfig.border} ${riskConfig.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${riskConfig.dot}`} />
            {riskConfig.label}
          </div>
          <Link
            href={`/dashboard/clients/${clientId}/remind`}
            className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            <Send size={14} />
            Send Reminder
          </Link>
          <Link
            href={`/dashboard/reports/${clientId}`}
            className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 text-sm px-4 py-2 rounded-lg hover:bg-slate-50 transition font-medium"
          >
            <FileText size={14} />
            Liability Report
          </Link>
        </div>
      </div>

      {/* ── Info + penalty row ── */}
      <div className="grid grid-cols-4 gap-4">
        {client.email && (
          <InfoCard icon={<Mail size={14} className="text-slate-400" />} label="Email" value={client.email} />
        )}
        {client.phone && (
          <InfoCard icon={<Phone size={14} className="text-slate-400" />} label="Phone" value={client.phone} />
        )}
        {client.cin && (
          <InfoCard icon={<Building2 size={14} className="text-slate-400" />} label="CIN" value={client.cin} />
        )}
        {penaltyExposure > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle size={13} className="text-red-500" />
              <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wide">Penalty Exposure</span>
            </div>
            <p className="text-lg font-bold text-red-700">₹{penaltyExposure.toLocaleString("en-IN")}</p>
            <p className="text-[10px] text-red-400 mt-0.5">accruing daily</p>
          </div>
        )}
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-3 gap-5">

        {/* Tasks — 2 cols */}
        <div className="col-span-2 space-y-4">

          {/* Active tasks */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Active Tasks</h2>
              <span className="text-xs text-slate-400">{activeTasks.length} pending</span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Compliance</th>
                  <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Period</th>
                  <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Due Date</th>
                  <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeTasks.map((task) => {
                  const days = daysUntilDue(task.due_date);
                  const penalty = getPenaltyPerDay(task.compliance_type);
                  return (
                    <tr key={task.id} className={days < 0 ? "bg-red-50/50" : "hover:bg-slate-50"}>
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-slate-800">{formatComplianceType(task.compliance_type)}</p>
                        {penalty > 0 && (
                          <p className="text-[10px] text-slate-400">₹{penalty}/day penalty</p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-500">{task.period}</td>
                      <td className="px-5 py-3">
                        <p className={`text-sm font-medium ${days < 0 ? "text-red-600" : days <= 5 ? "text-orange-600" : "text-slate-700"}`}>
                          {task.due_date}
                        </p>
                        <p className={`text-[10px] mt-0.5 ${days < 0 ? "text-red-500 font-medium" : "text-slate-400"}`}>
                          {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d remaining`}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={task.status} />
                      </td>
                    </tr>
                  );
                })}
                {activeTasks.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center">
                      <CheckCircle2 size={24} className="text-emerald-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">All tasks filed. Client is compliant.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add task */}
          <AddTaskForm clientId={clientId} complianceTypes={client.compliance_types as string[]} />

          {/* Filed tasks */}
          {filedTasks.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">Filed Returns</h2>
                <span className="text-xs text-emerald-600 font-medium">{filedTasks.length} completed</span>
              </div>
              <div className="divide-y divide-slate-100">
                {filedTasks.map((task) => (
                  <div key={task.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{formatComplianceType(task.compliance_type)}</p>
                      <p className="text-xs text-slate-400">{task.period}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{task.due_date}</span>
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-medium px-2 py-0.5 rounded-full">Filed ✓</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Audit trail — 1 col */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3.5 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">Audit Trail</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Immutable · Court-admissible</p>
            </div>
            <div className="p-4 space-y-3 max-h-[480px] overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-center py-6">
                  <Clock size={20} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No activity yet</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-100" />
                  <div className="space-y-4">
                    {logs.map((log) => {
                      const info = actionLabels[log.action] ?? { label: log.action, color: "text-slate-600" };
                      const icon = actionIcons[log.action] ?? "•";
                      return (
                        <div key={log.id} className="flex gap-3 relative">
                          <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 z-10 text-[11px]">
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0 pb-1">
                            <p className={`text-xs font-semibold ${info.color}`}>{info.label}</p>
                            {log.channel && (
                              <p className="text-[10px] text-slate-400">via {log.channel}</p>
                            )}
                            {log.message_id && (
                              <p className="text-[10px] text-slate-300 font-mono truncate">{log.message_id}</p>
                            )}
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(log.timestamp).toLocaleString("en-IN", {
                                day: "numeric", month: "short",
                                hour: "2-digit", minute: "2-digit",
                              })}
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
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Applicable Compliances</h3>
            <div className="flex flex-wrap gap-1.5">
              {client.compliance_types.map((t) => (
                <span key={t} className="bg-indigo-50 text-indigo-700 text-[10px] font-medium px-2 py-1 rounded-md border border-indigo-100">
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

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
      <div className="flex items-center gap-1.5 mb-1">{icon}<span className="text-[11px] text-slate-400 font-medium">{label}</span></div>
      <p className="text-sm text-slate-700 font-medium truncate">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-slate-100 text-slate-600",
    waiting_docs: "bg-amber-100 text-amber-700",
    docs_received: "bg-blue-100 text-blue-700",
    in_progress: "bg-blue-100 text-blue-700",
    review_ready: "bg-purple-100 text-purple-700",
    filed: "bg-emerald-100 text-emerald-700",
    overdue: "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${map[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
