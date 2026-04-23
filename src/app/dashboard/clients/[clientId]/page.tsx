import { createClient } from "@/lib/supabase/server";
import { formatComplianceType, daysUntilDue, getRiskLevel } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, FileText, Plus } from "lucide-react";
import AddTaskForm from "./AddTaskForm";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (!client) notFound();

  const { data: tasks } = await supabase
    .from("compliance_tasks")
    .select("*")
    .eq("client_id", clientId)
    .order("due_date");

  const { data: auditLogs } = await supabase
    .from("audit_log")
    .select("*")
    .eq("client_id", clientId)
    .order("timestamp", { ascending: false })
    .limit(20);

  const taskList = tasks ?? [];
  const logs = auditLogs ?? [];
  const riskLevel = getRiskLevel(taskList.filter((t) => t.status !== "filed"));

  const riskColors = {
    red: "bg-red-100 text-red-700 border-red-200",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
    green: "bg-green-100 text-green-700 border-green-200",
  };

  const actionLabels: Record<string, string> = {
    reminder_sent: "📤 Reminder Sent",
    delivered: "✅ Delivered",
    opened: "👁️ Opened",
    doc_uploaded: "📎 Document Uploaded",
    filed: "🏛️ Filed",
    escalated: "🚨 Escalated",
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/clients" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              {client.pan && <span>PAN: {client.pan}</span>}
              {client.gstin && <span>· GSTIN: {client.gstin}</span>}
              {client.email && <span>· {client.email}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-3 py-1 rounded-full border font-medium ${riskColors[riskLevel]}`}>
            {riskLevel === "red" ? "🔴 Critical" : riskLevel === "yellow" ? "🟡 Waiting" : "🟢 On Track"}
          </span>
          <Link
            href={`/dashboard/clients/${clientId}/remind`}
            className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Send size={14} />
            Send Reminder
          </Link>
          <Link
            href={`/dashboard/reports/${clientId}`}
            className="flex items-center gap-1.5 border border-gray-300 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            <FileText size={14} />
            Liability Report
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Tasks */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Compliance Tasks</h2>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2.5 text-gray-600 font-medium">Compliance</th>
                  <th className="text-left px-4 py-2.5 text-gray-600 font-medium">Period</th>
                  <th className="text-left px-4 py-2.5 text-gray-600 font-medium">Due Date</th>
                  <th className="text-left px-4 py-2.5 text-gray-600 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {taskList.map((task) => {
                  const days = daysUntilDue(task.due_date);
                  return (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-medium text-gray-800">
                        {formatComplianceType(task.compliance_type)}
                      </td>
                      <td className="px-4 py-2.5 text-gray-500">{task.period}</td>
                      <td className="px-4 py-2.5">
                        <span className={days < 0 ? "text-red-600 font-bold" : days <= 5 ? "text-orange-600" : "text-gray-700"}>
                          {task.due_date}
                        </span>
                        {task.status !== "filed" && (
                          <span className="text-xs text-gray-400 ml-1">
                            ({days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={task.status} />
                      </td>
                    </tr>
                  );
                })}
                {taskList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-sm">
                      No tasks yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add task form */}
          <AddTaskForm clientId={clientId} complianceTypes={client.compliance_types as string[]} />
        </div>

        {/* Audit log sidebar */}
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900">Audit Trail</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-400 text-xs text-center py-4">No activity yet.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="text-xs border-b border-gray-100 pb-2 last:border-0">
                  <p className="font-medium text-gray-800">{actionLabels[log.action] ?? log.action}</p>
                  {log.channel && <p className="text-gray-400">via {log.channel}</p>}
                  <p className="text-gray-400 mt-0.5">
                    {new Date(log.timestamp).toLocaleString("en-IN", {
                      day: "numeric", month: "short",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-gray-100 text-gray-600",
    waiting_docs: "bg-yellow-100 text-yellow-700",
    docs_received: "bg-blue-100 text-blue-700",
    in_progress: "bg-blue-100 text-blue-700",
    review_ready: "bg-purple-100 text-purple-700",
    filed: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
