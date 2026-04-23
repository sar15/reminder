import { formatComplianceType } from "@/lib/utils";
import { MOCK_CLIENTS, MOCK_TASKS } from "@/lib/mock-data";
import { Shield, Upload, CheckCircle, Clock, AlertTriangle, ChevronRight } from "lucide-react";

// In demo mode, token "demo-sharma" shows Sharma Enterprises
export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Demo: map token to client
  const tokenMap: Record<string, string> = {
    "demo-sharma": "1",
    "demo-mehta": "2",
    "demo-patel": "3",
    "demo-gupta": "4",
    "demo-reddy": "5",
  };

  const clientId = tokenMap[token] ?? "1";
  const client = MOCK_CLIENTS.find((c) => c.id === clientId);
  const tasks = MOCK_TASKS.filter((t) => t.client_id === clientId);
  const activeTasks = tasks.filter((t) => t.status !== "filed");
  const filedTasks = tasks.filter((t) => t.status === "filed");

  if (!client) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-slate-500">Invalid or expired link.</p>
          <p className="text-xs text-slate-400">Please contact your CA for a new link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-indigo-700 px-4 pt-8 pb-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>
            <span className="text-indigo-200 text-xs font-medium">ComplianceShield · Secure Portal</span>
          </div>
          <h1 className="text-xl font-bold text-white">{client.name}</h1>
          <p className="text-indigo-300 text-sm mt-1">
            {client.contact_name && `${client.contact_name} · `}
            {client.pan && `PAN: ${client.pan}`}
          </p>

          {/* Status summary */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <PortalStat label="Pending" value={activeTasks.length} color="text-amber-300" />
            <PortalStat label="Filed" value={filedTasks.length} color="text-emerald-300" />
            <PortalStat label="Compliances" value={client.compliance_types.length} color="text-indigo-200" />
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* Pending tasks */}
        {activeTasks.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <AlertTriangle size={12} className="text-amber-500" />
              Action Required
            </h2>
            <div className="space-y-2">
              {activeTasks.map((task) => {
                const daysLeft = Math.ceil(
                  (new Date(task.due_date).getTime() - Date.now()) / 86400000
                );
                const isUrgent = daysLeft <= 3;
                const isOverdue = daysLeft < 0;

                return (
                  <div
                    key={task.id}
                    className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
                      isOverdue ? "border-red-200" : isUrgent ? "border-amber-200" : "border-slate-200"
                    }`}
                  >
                    {/* Urgency bar */}
                    <div className={`h-1 ${isOverdue ? "bg-red-500" : isUrgent ? "bg-amber-400" : "bg-indigo-400"}`} />

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {formatComplianceType(task.compliance_type)}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">Period: {task.period}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-slate-400">Due date</p>
                          <p className={`text-sm font-bold ${isOverdue ? "text-red-600" : isUrgent ? "text-amber-600" : "text-slate-700"}`}>
                            {task.due_date}
                          </p>
                          <p className={`text-[10px] font-medium ${isOverdue ? "text-red-500" : isUrgent ? "text-amber-500" : "text-slate-400"}`}>
                            {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                          </p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <PortalStatus status={task.status} />
                      </div>

                      {/* Upload button */}
                      {(task.status === "pending" || task.status === "waiting_docs") && (
                        <button className="mt-3 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm py-2.5 rounded-lg hover:bg-indigo-700 transition font-medium">
                          <Upload size={15} />
                          Upload Documents
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filed */}
        {filedTasks.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <CheckCircle size={12} className="text-emerald-500" />
              Completed
            </h2>
            <div className="space-y-2">
              {filedTasks.map((task) => (
                <div key={task.id} className="bg-white rounded-xl border border-slate-200 p-3.5 flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{formatComplianceType(task.compliance_type)}</p>
                    <p className="text-xs text-slate-400">{task.period}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{task.due_date}</span>
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      Filed ✓
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTasks.length === 0 && filedTasks.length === 0 && (
          <div className="text-center py-12">
            <Clock size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No pending compliances.</p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-slate-400">
            <Shield size={11} />
            <p className="text-[11px]">Secured by ComplianceShield · Do not share this link</p>
          </div>
          <p className="text-[10px] text-slate-300">
            This portal is personalized for {client.name} only
          </p>
        </div>
      </div>
    </div>
  );
}

function PortalStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white/10 rounded-lg px-3 py-2 text-center">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-indigo-300 text-[10px]">{label}</p>
    </div>
  );
}

function PortalStatus({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; icon: string }> = {
    pending: { label: "Awaiting your documents", color: "text-slate-500", icon: "⏳" },
    waiting_docs: { label: "Please upload documents now", color: "text-amber-600", icon: "📋" },
    docs_received: { label: "Documents received — CA is processing", color: "text-blue-600", icon: "⚙️" },
    in_progress: { label: "Filing in progress", color: "text-blue-600", icon: "⚙️" },
    review_ready: { label: "Under partner review", color: "text-purple-600", icon: "🔍" },
    overdue: { label: "OVERDUE — contact your CA immediately", color: "text-red-600 font-semibold", icon: "🚨" },
  };
  const info = map[status] ?? { label: status, color: "text-slate-500", icon: "•" };
  return (
    <p className={`text-xs ${info.color} flex items-center gap-1.5`}>
      <span>{info.icon}</span>
      {info.label}
    </p>
  );
}
