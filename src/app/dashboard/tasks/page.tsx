import { getAllTasks, getClients } from "@/lib/data";
import { formatComplianceType, daysUntilDue } from "@/lib/utils";
import Link from "next/link";

export default async function TasksPage() {
  const [tasks, clients] = await Promise.all([getAllTasks(), getClients()]);

  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));

  const sorted = [...tasks].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
        <p className="text-gray-500 text-sm mt-1">Sorted by deadline proximity · {tasks.length} tasks</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Client</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Compliance</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Period</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Due Date</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((task) => {
              const days = daysUntilDue(task.due_date);
              const isUrgent = days <= 3 && task.status !== "filed";
              const client = clientMap[task.client_id];
              return (
                <tr key={task.id} className={isUrgent ? "bg-red-50" : "hover:bg-gray-50"}>
                  <td className="px-4 py-3 font-medium text-gray-900">{client?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-700">{formatComplianceType(task.compliance_type)}</td>
                  <td className="px-4 py-3 text-gray-500">{task.period}</td>
                  <td className="px-4 py-3">
                    <span className={days < 0 ? "text-red-600 font-bold" : days <= 5 ? "text-orange-600 font-medium" : "text-gray-700"}>
                      {task.due_date}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">
                      {task.status === "filed" ? "" : days < 0 ? `(${Math.abs(days)}d overdue)` : `(${days}d)`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/clients/${task.client_id}`} className="text-indigo-600 hover:underline text-xs">
                      View →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
