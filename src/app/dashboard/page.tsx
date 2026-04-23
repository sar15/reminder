import { getClients, getAllTasks, IS_MOCK } from "@/lib/data";
import { getRiskLevel, daysUntilDue, formatComplianceType } from "@/lib/utils";
import Link from "next/link";
import {
  AlertTriangle, CheckCircle, Clock, Send, ArrowRight,
  TrendingUp, Users, FileCheck, Flame,
} from "lucide-react";

export default async function DashboardPage() {
  const [clients, tasks] = await Promise.all([getClients(), getAllTasks()]);

  const tasksByClient = tasks.reduce<Record<string, typeof tasks>>((acc, t) => {
    if (!acc[t.client_id]) acc[t.client_id] = [];
    acc[t.client_id].push(t);
    return acc;
  }, {});

  const summaries = clients.map((client) => {
    const all = tasksByClient[client.id] ?? [];
    const active = all.filter((t) => t.status !== "filed");
    const riskLevel = getRiskLevel(active);
    const next = [...active].sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    )[0];
    return {
      client,
      riskLevel,
      nextTask: next ?? null,
      days: next ? daysUntilDue(next.due_date) : null,
      activeCount: active.length,
      filedCount: all.filter((t) => t.status === "filed").length,
    };
  });

  const red = summaries.filter((s) => s.riskLevel === "red");
  const yellow = summaries.filter((s) => s.riskLevel === "yellow");
  const green = summaries.filter((s) => s.riskLevel === "green");
  const totalTasks = tasks.length;
  const filedTasks = tasks.filter((t) => t.status === "filed").length;

  return (
    <div className="p-6 space-y-6 max-w-6xl">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Risk Command Center</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          + Add Client
        </Link>
      </div>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Total Clients"
          value={clients.length}
          sub="active this month"
          icon={<Users size={18} className="text-indigo-500" />}
          bg="bg-indigo-50"
        />
        <KpiCard
          label="Critical"
          value={red.length}
          sub="need action now"
          icon={<Flame size={18} className="text-red-500" />}
          bg="bg-red-50"
          highlight={red.length > 0}
        />
        <KpiCard
          label="Awaiting Docs"
          value={yellow.length}
          sub="reminders sent"
          icon={<Clock size={18} className="text-amber-500" />}
          bg="bg-amber-50"
        />
        <KpiCard
          label="Filed This Month"
          value={filedTasks}
          sub={`of ${totalTasks} total tasks`}
          icon={<FileCheck size={18} className="text-emerald-500" />}
          bg="bg-emerald-50"
        />
      </div>

      {/* ── Risk heatmap ── */}
      <div className="grid grid-cols-3 gap-5">

        {/* 🔴 RED */}
        <RiskColumn
          color="red"
          label="🔴 Critical"
          sublabel="Deadline < 5 days or overdue"
          count={red.length}
          items={red}
        />

        {/* 🟡 YELLOW */}
        <RiskColumn
          color="yellow"
          label="🟡 Waiting"
          sublabel="Reminders sent, awaiting docs"
          count={yellow.length}
          items={yellow}
        />

        {/* 🟢 GREEN */}
        <RiskColumn
          color="green"
          label="🟢 On Track"
          sublabel="Docs received or filed"
          count={green.length}
          items={green}
        />
      </div>

      {/* ── Escalation alerts ── */}
      {red.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-red-600" />
            <h3 className="text-sm font-semibold text-red-800">
              Partner Action Required — {red.length} client{red.length > 1 ? "s" : ""} at critical risk
            </h3>
          </div>
          <div className="space-y-2">
            {red.map(({ client, nextTask, days }) => (
              <div key={client.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-red-100">
                <div>
                  <span className="text-sm font-medium text-slate-800">{client.name}</span>
                  {nextTask && (
                    <span className="text-xs text-red-600 ml-2">
                      {formatComplianceType(nextTask.compliance_type)} ·{" "}
                      {days !== null && days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                    </span>
                  )}
                </div>
                <Link
                  href={`/dashboard/clients/${client.id}/remind`}
                  className="flex items-center gap-1.5 bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-700 transition"
                >
                  <Send size={11} />
                  Send Final Warning
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon, bg, highlight,
}: {
  label: string; value: number; sub: string;
  icon: React.ReactNode; bg: string; highlight?: boolean;
}) {
  return (
    <div className={`${bg} rounded-xl p-4 border ${highlight ? "border-red-200" : "border-transparent"}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
    </div>
  );
}

function RiskColumn({
  color, label, sublabel, count, items,
}: {
  color: "red" | "yellow" | "green";
  label: string; sublabel: string; count: number;
  items: Array<{
    client: { id: string; name: string; pan: string | null };
    nextTask: { compliance_type: string; due_date: string } | null;
    days: number | null;
    activeCount: number;
  }>;
}) {
  const styles = {
    red: {
      header: "bg-red-600",
      card: "border-red-100 hover:border-red-300",
      badge: "bg-red-100 text-red-700",
      dot: "bg-red-500",
      btn: "text-red-600 hover:text-red-800",
    },
    yellow: {
      header: "bg-amber-500",
      card: "border-amber-100 hover:border-amber-300",
      badge: "bg-amber-100 text-amber-700",
      dot: "bg-amber-400",
      btn: "text-amber-600 hover:text-amber-800",
    },
    green: {
      header: "bg-emerald-600",
      card: "border-emerald-100 hover:border-emerald-300",
      badge: "bg-emerald-100 text-emerald-700",
      dot: "bg-emerald-500",
      btn: "text-emerald-600 hover:text-emerald-800",
    },
  }[color];

  return (
    <div className="flex flex-col">
      {/* Column header */}
      <div className={`${styles.header} rounded-t-xl px-4 py-3 flex items-center justify-between`}>
        <span className="text-white text-sm font-semibold">{label}</span>
        <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
      </div>
      <p className="text-[11px] text-slate-400 px-4 py-2 bg-white border-x border-slate-200">{sublabel}</p>

      {/* Cards */}
      <div className="flex-1 bg-slate-50 border border-t-0 border-slate-200 rounded-b-xl p-3 space-y-2 min-h-[200px]">
        {items.length === 0 && (
          <div className="flex items-center justify-center h-24">
            <p className="text-xs text-slate-400">No clients here</p>
          </div>
        )}
        {items.map(({ client, nextTask, days, activeCount }) => (
          <Link
            key={client.id}
            href={`/dashboard/clients/${client.id}`}
            className={`block bg-white rounded-lg border ${styles.card} p-3 transition-all hover:shadow-sm`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.dot}`} />
                  <p className="text-xs font-semibold text-slate-800 truncate">{client.name}</p>
                </div>
                {client.pan && (
                  <p className="text-[10px] text-slate-400 mt-0.5 ml-3">{client.pan}</p>
                )}
              </div>
              <ArrowRight size={12} className="text-slate-300 flex-shrink-0 mt-0.5" />
            </div>
            {nextTask && (
              <div className="mt-2 ml-3">
                <p className="text-[10px] text-slate-500">
                  {formatComplianceType(nextTask.compliance_type)}
                </p>
                <p className={`text-[10px] font-medium mt-0.5 ${
                  days !== null && days < 0 ? "text-red-600" :
                  days !== null && days <= 5 ? "text-orange-600" : "text-slate-500"
                }`}>
                  {days !== null && days < 0
                    ? `⚠ ${Math.abs(days)}d overdue`
                    : days !== null
                    ? `Due in ${days}d · ${nextTask.due_date}`
                    : nextTask.due_date}
                </p>
              </div>
            )}
            {activeCount > 1 && (
              <p className="text-[10px] text-slate-400 mt-1.5 ml-3">+{activeCount - 1} more tasks</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
