import { getClient, getTasksForClient, getAllAuditLogsForClient } from "@/lib/data";
import { formatComplianceType } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Shield, CheckCircle, AlertTriangle, Clock } from "lucide-react";

export default async function ClientReportPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const [client, tasks, logs] = await Promise.all([
    getClient(clientId),
    getTasksForClient(clientId),
    getAllAuditLogsForClient(clientId),
  ]);
  if (!client) notFound();

  const remindersSent = logs.filter((l) => l.action === "reminder_sent").length;
  const docsUploaded = logs.filter((l) => l.action === "doc_uploaded").length;
  const filed = logs.filter((l) => l.action === "filed").length;
  const opened = logs.filter((l) => l.action === "opened").length;

  const actionConfig: Record<string, { label: string; icon: string; color: string; bg: string }> = {
    reminder_sent: { label: "Reminder Sent", icon: "📤", color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-100" },
    delivered: { label: "Delivered", icon: "✅", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
    opened: { label: "Opened by Client", icon: "👁️", color: "text-blue-700", bg: "bg-blue-50 border-blue-100" },
    doc_uploaded: { label: "Document Uploaded", icon: "📎", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
    filed: { label: "Return Filed", icon: "🏛️", color: "text-emerald-800", bg: "bg-emerald-50 border-emerald-200" },
    escalated: { label: "Escalated to Partner", icon: "🚨", color: "text-red-700", bg: "bg-red-50 border-red-100" },
  };

  return (
    <div className="p-6 max-w-4xl space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/reports" className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition">
            <ArrowLeft size={15} className="text-slate-500" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-indigo-600" />
              <h1 className="text-xl font-bold text-slate-900">Liability Report</h1>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{client.name} · Generated {new Date().toLocaleDateString("en-IN")}</p>
          </div>
        </div>
        <Link
          href={`/api/reports/${clientId}/pdf`}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          <Download size={15} />
          Download PDF
        </Link>
      </div>

      {/* Legal notice */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex gap-3">
        <Shield size={18} className="text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-indigo-800">Court-Admissible Audit Document</p>
          <p className="text-xs text-indigo-600 mt-0.5 leading-relaxed">
            This report is generated from an immutable, append-only audit log. All timestamps are in IST.
            This document can be presented in client disputes, ICAI disciplinary proceedings, and penalty defense cases.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon="📤" label="Reminders Sent" value={remindersSent} color="indigo" />
        <StatCard icon="👁️" label="Times Opened" value={opened} color="blue" />
        <StatCard icon="📎" label="Docs Uploaded" value={docsUploaded} color="emerald" />
        <StatCard icon="🏛️" label="Returns Filed" value={filed} color="emerald" />
      </div>

      {/* Client info */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Client Information</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <Field label="Business Name" value={client.name} />
          <Field label="PAN" value={client.pan ?? "—"} mono />
          <Field label="GSTIN" value={client.gstin ?? "—"} mono />
          <Field label="Contact" value={client.contact_name ?? "—"} />
          <Field label="Email" value={client.email ?? "—"} />
          <Field label="Phone" value={client.phone ?? "—"} />
        </div>
      </div>

      {/* Tasks */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Compliance Tasks</h2>
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
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-slate-50">
                <td className="px-5 py-3 text-sm font-medium text-slate-800">{formatComplianceType(task.compliance_type)}</td>
                <td className="px-5 py-3 text-sm text-slate-500">{task.period}</td>
                <td className="px-5 py-3 text-sm text-slate-600">{task.due_date}</td>
                <td className="px-5 py-3">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    task.status === "filed" ? "bg-emerald-100 text-emerald-700" :
                    task.status === "overdue" ? "bg-red-100 text-red-700" :
                    task.status === "waiting_docs" ? "bg-amber-100 text-amber-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {task.status.replace(/_/g, " ")}
                  </span>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-sm text-slate-400">No tasks.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Audit timeline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Communication Audit Trail</h2>
          <span className="text-xs text-slate-400">{logs.length} events · Immutable</span>
        </div>
        <div className="p-5">
          {logs.length === 0 ? (
            <div className="text-center py-8">
              <Clock size={24} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No communication logged yet.</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-5 top-3 bottom-3 w-px bg-slate-100" />
              <div className="space-y-3">
                {logs.map((log, i) => {
                  const cfg = actionConfig[log.action] ?? {
                    label: log.action, icon: "•", color: "text-slate-600", bg: "bg-slate-50 border-slate-100",
                  };
                  return (
                    <div key={log.id} className="flex gap-4 relative">
                      <div className={`w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0 z-10 text-base ${cfg.bg}`}>
                        {cfg.icon}
                      </div>
                      <div className={`flex-1 rounded-xl border p-3 ${cfg.bg}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</p>
                            {log.channel && (
                              <p className="text-[10px] text-slate-400 mt-0.5">via {log.channel}</p>
                            )}
                            {log.message_id && (
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                Message ID: {log.message_id}
                              </p>
                            )}
                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {JSON.stringify(log.metadata).replace(/[{}"]/g, "").replace(/,/g, " · ")}
                              </p>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 flex-shrink-0">
                            {new Date(log.timestamp).toLocaleString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })} IST
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conclusion */}
      {logs.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-indigo-400" />
            <h3 className="text-sm font-semibold">Legal Conclusion</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Based on the audit trail above, {remindersSent} reminder{remindersSent !== 1 ? "s were" : " was"} sent to{" "}
            <strong className="text-white">{client.name}</strong> between{" "}
            <strong className="text-white">
              {new Date(logs[0].timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
            </strong>{" "}
            and{" "}
            <strong className="text-white">
              {new Date(logs[logs.length - 1].timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </strong>.
            {docsUploaded > 0
              ? ` Client uploaded ${docsUploaded} document${docsUploaded !== 1 ? "s" : ""}.`
              : " Client has not uploaded any documents as of this report."}
            {" "}Any penalties incurred are attributable to client delay, not CA negligence.
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-50 border-indigo-100",
    blue: "bg-blue-50 border-blue-100",
    emerald: "bg-emerald-50 border-emerald-100",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color] ?? "bg-slate-50 border-slate-100"}`}>
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-sm text-slate-700 ${mono ? "font-mono" : "font-medium"}`}>{value}</p>
    </div>
  );
}
