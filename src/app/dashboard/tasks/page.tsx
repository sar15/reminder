import { getAllTasks, getClients } from "@/lib/data";
import { formatComplianceType, daysUntilDue } from "@/lib/utils";
import Link from "next/link";
import { Send, ArrowRight } from "lucide-react";

export default async function TasksPage() {
  const [tasks, clients] = await Promise.all([getAllTasks(), getClients()]);
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));

  const sorted = [...tasks].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );

  const overdue = sorted.filter((t) => daysUntilDue(t.due_date) < 0 && t.status !== "filed");
  const upcoming = sorted.filter((t) => daysUntilDue(t.due_date) >= 0 && t.status !== "filed");
  const filed = sorted.filter((t) => t.status === "filed");

  return (
    <div className="p-6 space-y-5 max-w-6xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">All Tasks</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Sorted by deadline · {overdue.length} overdue · {upcoming.length} upcoming · {filed.length} filed
        </p>
      </div>

      {/* Overdue */}
      {overdue.length > 0 && (
        <Section title="⚠️ Overdue" count={overdue.length} accent="red">
          {overdue.map((task) => (
            <TaskRow key={task.id} task={task} client={clientMap[task.client_id]} />
          ))}
        </Section>
      )}

      {/* Upcoming */}
      <Section title="📋 Upcoming" count={upcoming.length} accent="slate">
        {upcoming.length === 0 ? (
          <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-400">No upcoming tasks.</td></tr>
        ) : (
          upcoming.map((task) => (
            <TaskRow key={task.id} task={task} client={clientMap[task.client_id]} />
          ))
        )}
      </Section>

      {/* Filed */}
      {filed.length > 0 && (
        <Section title="✅ Filed" count={filed.length} accent="emerald">
          {filed.map((task) => (
            <TaskRow key={task.id} task={task} client={clientMap[task.client_id]} />
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, count, accent, children }: {
  title: string; count: number; accent: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        <span className="text-xs text-slate-400">{count} tasks</span>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Client</th>
            <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Compliance</th>
            <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Period</th>
            <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Due Date</th>
            <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Status</th>
            <th className="px-5 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

function TaskRow({ task, client }: { task: any; client: any }) {
  const days = daysUntilDue(task.due_date);
  const isOverdue = days < 0 && task.status !== "filed";

  const statusMap: Record<string, string> = {
    pending: "bg-slate-100 text-slate-600",
    waiting_docs: "bg-amber-100 text-amber-700",
    docs_received: "bg-blue-100 text-blue-700",
    in_progress: "bg-blue-100 text-blue-700",
    review_ready: "bg-purple-100 text-purple-700",
    filed: "bg-emerald-100 text-emerald-700",
    overdue: "bg-red-100 text-red-700",
  };

  return (
    <tr className={`${isOverdue ? "bg-red-50/40" : "hover:bg-slate-50"} transition-colors`}>
      <td className="px-5 py-3">
        <p className="text-sm font-medium text-slate-800">{client?.name ?? "—"}</p>
      </td>
      <td className="px-5 py-3 text-sm text-slate-700">{formatComplianceType(task.compliance_type)}</td>
      <td className="px-5 py-3 text-sm text-slate-500">{task.period}</td>
      <td className="px-5 py-3">
        <p className={`text-sm font-medium ${isOverdue ? "text-red-600" : days <= 5 ? "text-orange-600" : "text-slate-700"}`}>
          {task.due_date}
        </p>
        {task.status !== "filed" && (
          <p className={`text-[10px] mt-0.5 ${isOverdue ? "text-red-500 font-medium" : "text-slate-400"}`}>
            {isOverdue ? `${Math.abs(days)}d overdue` : `${days}d left`}
          </p>
        )}
      </td>
      <td className="px-5 py-3">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusMap[task.status] ?? "bg-slate-100 text-slate-600"}`}>
          {task.status.replace(/_/g, " ")}
        </span>
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-2">
          {isOverdue && (
            <Link
              href={`/dashboard/clients/${task.client_id}/remind`}
              className="flex items-center gap-1 text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded-lg hover:bg-red-200 transition"
            >
              <Send size={10} />
              Remind
            </Link>
          )}
          <Link href={`/dashboard/clients/${task.client_id}`} className="text-indigo-600 hover:text-indigo-800 transition">
            <ArrowRight size={14} />
          </Link>
        </div>
      </td>
    </tr>
  );
}
