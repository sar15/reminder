import { getClient, getTasksForClient, getAllAuditLogsForClient } from "@/lib/data";
import { formatComplianceType } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Download, ArrowLeft } from "lucide-react";

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

  const actionLabels: Record<string, string> = {
    reminder_sent: "📤 Reminder Sent",
    delivered: "✅ Delivered",
    opened: "👁️ Opened by Client",
    doc_uploaded: "📎 Document Uploaded",
    filed: "🏛️ Return Filed",
    escalated: "🚨 Escalated to Partner",
  };

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/reports" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Liability Report</h1>
          <p className="text-gray-500 text-sm">{client.name} · {client.pan ?? "No PAN"}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Client Summary</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">Name:</span> <span className="font-medium">{client.name}</span></div>
          <div><span className="text-gray-500">PAN:</span> <span className="font-medium">{client.pan ?? "—"}</span></div>
          <div><span className="text-gray-500">GSTIN:</span> <span className="font-medium">{client.gstin ?? "—"}</span></div>
          <div><span className="text-gray-500">Email:</span> <span className="font-medium">{client.email ?? "—"}</span></div>
          <div><span className="text-gray-500">Reminders Sent:</span> <span className="font-medium">{logs.filter(l => l.action === "reminder_sent").length}</span></div>
          <div><span className="text-gray-500">Documents Uploaded:</span> <span className="font-medium">{logs.filter(l => l.action === "doc_uploaded").length}</span></div>
        </div>
      </div>

      {/* Tasks */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Compliance Tasks</h2>
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
              <div>
                <span className="font-medium">{formatComplianceType(task.compliance_type)}</span>
                <span className="text-gray-500 ml-2">· {task.period}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-500">Due: {task.due_date}</span>
                <StatusBadge status={task.status} />
              </div>
            </div>
          ))}
          {tasks.length === 0 && <p className="text-gray-400 text-sm">No tasks.</p>}
        </div>
      </div>

      {/* Audit timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Communication Timeline (Audit Trail)</h2>
        {logs.length === 0 ? (
          <p className="text-gray-400 text-sm">No communication logged yet.</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3 text-sm">
                <div className="w-44 flex-shrink-0 text-gray-400 text-xs pt-0.5">
                  {new Date(log.timestamp).toLocaleString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{actionLabels[log.action] ?? log.action}</p>
                  {log.channel && <p className="text-gray-500 text-xs">via {log.channel}</p>}
                  {log.message_id && <p className="text-gray-400 text-xs font-mono">ID: {log.message_id}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Link
          href={`/api/reports/${clientId}/pdf`}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          <Download size={16} />
          Download PDF Report
        </Link>
      </div>

      <p className="text-xs text-gray-400">
        Generated from an immutable audit log. All timestamps in IST.
        Suitable for client disputes and ICAI disciplinary proceedings.
      </p>
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
