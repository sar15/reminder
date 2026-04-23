import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatComplianceType } from "@/lib/utils";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  // Validate magic link token
  const { data: link } = await supabase
    .from("client_magic_links")
    .select("*, clients(*)")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (!link) notFound();

  const client = link.clients;

  // Fetch active tasks
  const { data: tasks } = await supabase
    .from("compliance_tasks")
    .select("*")
    .eq("client_id", client.id)
    .neq("status", "filed")
    .order("due_date");

  // Fetch filed tasks
  const { data: filedTasks } = await supabase
    .from("compliance_tasks")
    .select("*")
    .eq("client_id", client.id)
    .eq("status", "filed")
    .order("due_date", { ascending: false })
    .limit(5);

  const activeTasks = tasks ?? [];
  const filed = filedTasks ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-700 text-white px-4 py-5">
        <div className="max-w-lg mx-auto">
          <p className="text-indigo-200 text-xs mb-1">Your Compliance Portal</p>
          <h1 className="text-xl font-bold">{client.name}</h1>
          {client.pan && <p className="text-indigo-200 text-sm">PAN: {client.pan}</p>}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Pending tasks */}
        {activeTasks.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <AlertTriangle size={14} className="text-yellow-500" />
              Action Required ({activeTasks.length})
            </h2>
            <div className="space-y-3">
              {activeTasks.map((task) => {
                const daysLeft = Math.ceil(
                  (new Date(task.due_date).getTime() - Date.now()) / 86400000
                );
                return (
                  <div
                    key={task.id}
                    className={`bg-white rounded-xl border p-4 ${
                      daysLeft <= 3 ? "border-red-300" : daysLeft <= 7 ? "border-yellow-300" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatComplianceType(task.compliance_type)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">Period: {task.period}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Due</p>
                        <p className={`text-sm font-bold ${daysLeft <= 3 ? "text-red-600" : "text-gray-800"}`}>
                          {task.due_date}
                        </p>
                        <p className={`text-xs ${daysLeft < 0 ? "text-red-600" : daysLeft <= 3 ? "text-red-500" : "text-gray-400"}`}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <StatusIndicator status={task.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filed returns */}
        {filed.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <CheckCircle size={14} className="text-green-500" />
              Recently Filed
            </h2>
            <div className="space-y-2">
              {filed.map((task) => (
                <div key={task.id} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{formatComplianceType(task.compliance_type)}</p>
                    <p className="text-xs text-gray-500">{task.period}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Filed ✓</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTasks.length === 0 && filed.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Clock size={32} className="mx-auto mb-3 opacity-40" />
            <p>No pending compliances. You&apos;re all caught up!</p>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center pt-4">
          This is a secure, personalized portal. Do not share this link.
        </p>
      </div>
    </div>
  );
}

function StatusIndicator({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    pending: { label: "Awaiting documents", color: "text-gray-500" },
    waiting_docs: { label: "Please upload your documents", color: "text-yellow-600" },
    docs_received: { label: "Documents received — processing", color: "text-blue-600" },
    in_progress: { label: "Filing in progress", color: "text-blue-600" },
    review_ready: { label: "Under partner review", color: "text-purple-600" },
    overdue: { label: "OVERDUE — please contact your CA immediately", color: "text-red-600 font-bold" },
  };
  const info = map[status] ?? { label: status, color: "text-gray-500" };
  return <p className={`text-xs ${info.color}`}>{info.label}</p>;
}
