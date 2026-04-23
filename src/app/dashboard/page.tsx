import { getClients, getAllTasks, IS_MOCK } from "@/lib/data";
import { getRiskLevel, daysUntilDue, formatComplianceType } from "@/lib/utils";
import Link from "next/link";
import { AlertTriangle, CheckCircle, Clock, Send } from "lucide-react";

export default async function DashboardPage() {
  const clients = await getClients();
  const tasks = await getAllTasks();

  // Group tasks by client
  const tasksByClient = tasks.reduce<Record<string, typeof tasks>>((acc, task) => {
    if (!acc[task.client_id]) acc[task.client_id] = [];
    acc[task.client_id].push(task);
    return acc;
  }, {});

  const summaries = clients.map((client) => {
    const clientTasks = tasksByClient[client.id] ?? [];
    const activeTasks = clientTasks.filter((t) => t.status !== "filed");
    const riskLevel = getRiskLevel(activeTasks);
    const nextTask = [...activeTasks].sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    )[0];
    return {
      client,
      riskLevel,
      nextDueDate: nextTask?.due_date ?? null,
      days: nextTask ? daysUntilDue(nextTask.due_date) : null,
      nextTaskType: nextTask?.compliance_type ?? null,
    };
  });

  const red = summaries.filter((s) => s.riskLevel === "red");
  const yellow = summaries.filter((s) => s.riskLevel === "yellow");
  const green = summaries.filter((s) => s.riskLevel === "green");
  const sorted = [...red, ...yellow, ...green];

  return (
    <div className="p-6 space-y-6">
      {IS_MOCK && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
          <span>⚡</span>
          <span>
            <strong>Demo mode</strong> — showing sample data. Add your Supabase keys to{" "}
            <code className="bg-amber-100 px-1 rounded">.env.local</code> to use real data.
          </span>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Risk Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          {clients.length} active clients · {red.length} need immediate attention
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Critical" count={red.length} color="red" icon={<AlertTriangle size={18} />} />
        <SummaryCard label="Waiting" count={yellow.length} color="yellow" icon={<Clock size={18} />} />
        <SummaryCard label="On Track" count={green.length} color="green" icon={<CheckCircle size={18} />} />
      </div>

      {/* Client risk list */}
      <div className="space-y-2">
        {sorted.map(({ client, riskLevel, days, nextDueDate, nextTaskType }) => (
          <div
            key={client.id}
            className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <RiskDot level={riskLevel} />
              <div>
                <p className="font-medium text-gray-900">{client.name}</p>
                <p className="text-xs text-gray-500">
                  {nextTaskType ? formatComplianceType(nextTaskType) : "No pending tasks"}
                  {nextDueDate && (
                    <span className="ml-2">
                      · Due {nextDueDate}
                      {days !== null && (
                        <span className={days < 0 ? " text-red-600 font-medium" : ""}>
                          {" "}
                          ({days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`})
                        </span>
                      )}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/dashboard/clients/${client.id}`} className="text-xs text-indigo-600 hover:underline">
                View
              </Link>
              {riskLevel !== "green" && (
                <Link
                  href={`/dashboard/clients/${client.id}/remind`}
                  className="flex items-center gap-1 bg-red-50 text-red-700 text-xs px-3 py-1.5 rounded-lg hover:bg-red-100 transition"
                >
                  <Send size={12} />
                  Send Warning
                </Link>
              )}
            </div>
          </div>
        ))}

        {clients.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No clients yet.</p>
            <Link href="/dashboard/clients/new" className="text-indigo-600 text-sm hover:underline mt-2 inline-block">
              Add your first client →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, count, color, icon }: {
  label: string; count: number; color: "red" | "yellow" | "green"; icon: React.ReactNode;
}) {
  const styles = {
    red: "bg-red-50 text-red-700 border-red-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    green: "bg-green-50 text-green-700 border-green-200",
  };
  return (
    <div className={`rounded-xl border p-4 ${styles[color]}`}>
      <div className="flex items-center gap-2 mb-1">{icon}<span className="text-sm font-medium">{label}</span></div>
      <p className="text-3xl font-bold">{count}</p>
    </div>
  );
}

function RiskDot({ level }: { level: "red" | "yellow" | "green" }) {
  const colors = { red: "bg-red-500", yellow: "bg-yellow-400", green: "bg-green-500" };
  return <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colors[level]}`} />;
}
