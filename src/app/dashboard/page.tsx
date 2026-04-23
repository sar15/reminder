import { getClients, getAllTasks } from "@/lib/data";
import { getRiskLevel, daysUntilDue, formatComplianceType } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, Send, AlertCircle } from "lucide-react";

export default async function DashboardPage() {
  const [clients, tasks] = await Promise.all([getClients(), getAllTasks()]);

  const byClient = tasks.reduce<Record<string, typeof tasks>>((a, t) => {
    (a[t.client_id] ??= []).push(t); return a;
  }, {});

  const summaries = clients.map((c) => {
    const all    = byClient[c.id] ?? [];
    const active = all.filter((t) => t.status !== "filed");
    const risk   = getRiskLevel(active);
    const next   = [...active].sort((a, b) => +new Date(a.due_date) - +new Date(b.due_date))[0];
    return { c, risk, next: next ?? null, days: next ? daysUntilDue(next.due_date) : null, activeCount: active.length };
  });

  const red    = summaries.filter((s) => s.risk === "red");
  const yellow = summaries.filter((s) => s.risk === "yellow");
  const green  = summaries.filter((s) => s.risk === "green");
  const filed  = tasks.filter((t) => t.status === "filed").length;

  return (
    <div className="p-7 max-w-[1080px]">

      {/* Page header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-[20px] font-semibold text-[#1C1917] tracking-tight">
            Command Center
          </h1>
          <p className="text-[13px] text-[#A8A29E] mt-0.5">
            Focus on red first — everything else can wait.
          </p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6D28D9] text-white text-[13px] font-medium hover:bg-[#5B21B6] shadow-[0_1px_2px_rgba(109,40,217,0.25)] transition-colors"
        >
          + Add Client
        </Link>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        <KpiCard n={clients.length} label="Total Clients"  sub="active"          accent="#6D28D9" bg="#F5F3FF" />
        <KpiCard n={red.length}     label="Critical"       sub="need action now" accent="#DC2626" bg="#FEF2F2" pulse={red.length > 0} />
        <KpiCard n={yellow.length}  label="Awaiting Docs"  sub="reminders sent"  accent="#D97706" bg="#FFFBEB" />
        <KpiCard n={filed}          label="Filed"          sub="this month"      accent="#059669" bg="#ECFDF5" />
      </div>

      {/* Escalation strip */}
      {red.length > 0 && (
        <div className="mb-7 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={14} className="text-[#DC2626]" />
            <span className="text-[13px] font-semibold text-[#991B1B]">
              Partner action required — {red.length} client{red.length > 1 ? "s" : ""} at critical risk
            </span>
          </div>
          <div className="space-y-2">
            {red.map(({ c, next, days }) => (
              <div key={c.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-[#FECACA]">
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-semibold text-[#1C1917]">{c.name}</span>
                  {next && (
                    <span className="text-[12px] text-[#DC2626]">
                      {formatComplianceType(next.compliance_type)} ·{" "}
                      {days !== null && days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                    </span>
                  )}
                </div>
                <Link
                  href={`/dashboard/clients/${c.id}/remind`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#DC2626] text-white text-[11px] font-semibold hover:bg-[#B91C1C] transition-colors"
                >
                  <Send size={10} />
                  Send Final Warning
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3-col heatmap */}
      <div className="grid grid-cols-3 gap-5">
        <HeatmapCol color="red"    label="Critical"      sub="≤5 days or overdue"    count={red.length}    items={red} />
        <HeatmapCol color="yellow" label="Awaiting Docs" sub="Reminders sent, waiting" count={yellow.length} items={yellow} />
        <HeatmapCol color="green"  label="On Track"      sub="Docs received or filed"  count={green.length}  items={green} />
      </div>
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ n, label, sub, accent, bg, pulse }: {
  n: number; label: string; sub: string;
  accent: string; bg: string; pulse?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E8E6E3] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <p className="text-[11px] font-medium text-[#A8A29E] uppercase tracking-wider mb-3">{label}</p>
      <div className="flex items-end gap-2">
        <span className="text-[32px] font-bold leading-none" style={{ color: accent }}>{n}</span>
        {pulse && n > 0 && (
          <span className="mb-1 w-2 h-2 rounded-full animate-pulse" style={{ background: accent }} />
        )}
      </div>
      <p className="text-[11px] text-[#A8A29E] mt-1.5">{sub}</p>
    </div>
  );
}

// ── Heatmap Column ────────────────────────────────────────────────────────────
const COL_CFG = {
  red:    { dot: "#DC2626", headerText: "#991B1B", headerBg: "#FEF2F2", border: "#FECACA", cardHover: "#FFF5F5" },
  yellow: { dot: "#D97706", headerText: "#92400E", headerBg: "#FFFBEB", border: "#FDE68A", cardHover: "#FFFDF0" },
  green:  { dot: "#059669", headerText: "#065F46", headerBg: "#ECFDF5", border: "#A7F3D0", cardHover: "#F0FDF8" },
};

function HeatmapCol({ color, label, sub, count, items }: {
  color: "red" | "yellow" | "green";
  label: string; sub: string; count: number;
  items: Array<{
    c: { id: string; name: string; pan: string | null };
    next: { compliance_type: string; due_date: string } | null;
    days: number | null;
    activeCount: number;
  }>;
}) {
  const cfg = COL_CFG[color];
  return (
    <div className="flex flex-col rounded-xl overflow-hidden border" style={{ borderColor: cfg.border }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: cfg.headerBg }}>
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: cfg.dot }} />
            <span className="text-[13px] font-semibold" style={{ color: cfg.headerText }}>{label}</span>
          </div>
          <p className="text-[11px] text-[#A8A29E] mt-0.5 pl-4">{sub}</p>
        </div>
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
          style={{ background: cfg.dot }}
        >
          {count}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 bg-[#FAFAF9] p-2.5 space-y-2 min-h-[180px]">
        {items.length === 0 && (
          <div className="flex items-center justify-center h-20">
            <p className="text-[12px] text-[#D6D3CF]">Nothing here</p>
          </div>
        )}
        {items.map(({ c, next, days, activeCount }) => (
          <Link
            key={c.id}
            href={`/dashboard/clients/${c.id}`}
            className="block bg-white rounded-lg border border-[#E8E6E3] p-3 hover:border-[#D6D3CF] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all group"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[12px] font-semibold text-[#1C1917] leading-tight">{c.name}</p>
              <ArrowRight size={12} className="text-[#D6D3CF] group-hover:text-[#A8A29E] flex-shrink-0 mt-0.5 transition-colors" />
            </div>
            {c.pan && <p className="text-[10px] text-[#A8A29E] mt-0.5 font-mono">{c.pan}</p>}
            {next && (
              <div className="mt-2 pt-2 border-t border-[#F0EFED]">
                <p className="text-[11px] text-[#57534E]">{formatComplianceType(next.compliance_type)}</p>
                <p className="text-[11px] font-semibold mt-0.5" style={{
                  color: days !== null && days < 0 ? "#DC2626" : days !== null && days <= 5 ? "#D97706" : "#A8A29E",
                }}>
                  {days !== null && days < 0
                    ? `⚠ ${Math.abs(days)}d overdue`
                    : days !== null ? `${days}d left · ${next.due_date}`
                    : next.due_date}
                </p>
              </div>
            )}
            {activeCount > 1 && (
              <p className="text-[10px] text-[#A8A29E] mt-1.5">+{activeCount - 1} more task{activeCount > 2 ? "s" : ""}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
