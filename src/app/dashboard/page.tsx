import { getClients, getAllTasks } from "@/lib/data";
import { getRiskLevel, daysUntilDue, formatComplianceType } from "@/lib/utils";
import Link from "next/link";

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
    return { client, riskLevel, nextTask: next ?? null, days: next ? daysUntilDue(next.due_date) : null, activeCount: active.length };
  });

  const red    = summaries.filter((s) => s.riskLevel === "red");
  const yellow = summaries.filter((s) => s.riskLevel === "yellow");
  const green  = summaries.filter((s) => s.riskLevel === "green");
  const filed  = tasks.filter((t) => t.status === "filed").length;

  return (
    <div style={{ padding: 28, maxWidth: 1100 }}>

      {/* ── Page title ── */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Command Center</h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 3 }}>
            Focus on red first. Everything else can wait.
          </p>
        </div>
        <Link href="/dashboard/clients/new" style={{
          background: "#4f46e5", color: "#fff",
          padding: "9px 18px", borderRadius: 8,
          fontSize: 13, fontWeight: 600,
          textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6,
        }}>
          + Add Client
        </Link>
      </div>

      {/* ── 4 KPI cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        <KpiCard value={clients.length} label="Total Clients" sub="active this month" color="#4f46e5" bg="#f5f3ff" />
        <KpiCard value={red.length}     label="Critical"      sub="need action now"   color="#dc2626" bg="#fef2f2" pulse={red.length > 0} />
        <KpiCard value={yellow.length}  label="Awaiting Docs" sub="reminders sent"    color="#d97706" bg="#fffbeb" />
        <KpiCard value={filed}          label="Filed"         sub="this month"        color="#059669" bg="#f0fdf4" />
      </div>

      {/* ── Escalation banner ── */}
      {red.length > 0 && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca",
          borderRadius: 10, padding: "14px 18px", marginBottom: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 15 }}>🚨</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#991b1b" }}>
              Partner Action Required — {red.length} client{red.length > 1 ? "s" : ""} at critical risk
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {red.map(({ client, nextTask, days }) => (
              <div key={client.id} style={{
                background: "#fff", border: "1px solid #fecaca",
                borderRadius: 8, padding: "10px 14px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{client.name}</span>
                  {nextTask && (
                    <span style={{ fontSize: 12, color: "#dc2626", marginLeft: 10 }}>
                      {formatComplianceType(nextTask.compliance_type)} ·{" "}
                      {days !== null && days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                    </span>
                  )}
                </div>
                <Link href={`/dashboard/clients/${client.id}/remind`} style={{
                  background: "#dc2626", color: "#fff",
                  padding: "6px 14px", borderRadius: 6,
                  fontSize: 12, fontWeight: 600, textDecoration: "none",
                }}>
                  Send Final Warning →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3-column heatmap ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <HeatmapColumn
          color="red" label="🔴 Critical" sublabel="Deadline ≤5 days or overdue"
          count={red.length} items={red}
        />
        <HeatmapColumn
          color="yellow" label="🟡 Awaiting Docs" sublabel="Reminders sent, waiting"
          count={yellow.length} items={yellow}
        />
        <HeatmapColumn
          color="green" label="🟢 On Track" sublabel="Docs received or filed"
          count={green.length} items={green}
        />
      </div>
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────
function KpiCard({ value, label, sub, color, bg, pulse }: {
  value: number; label: string; sub: string;
  color: string; bg: string; pulse?: boolean;
}) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e7eb",
      borderRadius: 10, padding: "16px 18px",
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
        <span style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{value}</span>
        {pulse && value > 0 && (
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, marginBottom: 6, animation: "pulse 1.5s infinite" }} />
        )}
      </div>
      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{sub}</div>
    </div>
  );
}

// ── Heatmap Column ────────────────────────────────────────────
function HeatmapColumn({ color, label, sublabel, count, items }: {
  color: "red" | "yellow" | "green";
  label: string; sublabel: string; count: number;
  items: Array<{
    client: { id: string; name: string; pan: string | null };
    nextTask: { compliance_type: string; due_date: string } | null;
    days: number | null; activeCount: number;
  }>;
}) {
  const cfg = {
    red:    { header: "#dc2626", headerBg: "#fef2f2", cardBorder: "#fecaca", dotBg: "#fee2e2", dot: "#dc2626" },
    yellow: { header: "#d97706", headerBg: "#fffbeb", cardBorder: "#fde68a", dotBg: "#fef3c7", dot: "#d97706" },
    green:  { header: "#059669", headerBg: "#f0fdf4", cardBorder: "#bbf7d0", dotBg: "#dcfce7", dot: "#059669" },
  }[color];

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{
        background: cfg.headerBg, borderRadius: "10px 10px 0 0",
        border: `1px solid ${cfg.cardBorder}`, borderBottom: "none",
        padding: "12px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: cfg.header }}>{label}</div>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{sublabel}</div>
        </div>
        <div style={{
          background: cfg.header, color: "#fff",
          borderRadius: 20, padding: "2px 10px",
          fontSize: 12, fontWeight: 700,
        }}>
          {count}
        </div>
      </div>

      {/* Cards */}
      <div style={{
        border: `1px solid ${cfg.cardBorder}`,
        borderTop: "none", borderRadius: "0 0 10px 10px",
        background: "#fff",
        minHeight: 180, padding: 10,
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        {items.length === 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 80 }}>
            <span style={{ fontSize: 12, color: "#d1d5db" }}>No clients here</span>
          </div>
        )}
        {items.map(({ client, nextTask, days, activeCount }) => (
          <Link key={client.id} href={`/dashboard/clients/${client.id}`} style={{ textDecoration: "none" }}>
            <div style={{
              background: "#fafafa", border: "1px solid #f3f4f6",
              borderRadius: 8, padding: "10px 12px",
              cursor: "pointer",
            }}
            className="heatmap-card"
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{client.name}</span>
              </div>
              {client.pan && (
                <div style={{ fontSize: 10, color: "#9ca3af", marginLeft: 15, marginBottom: 4 }}>
                  {client.pan}
                </div>
              )}
              {nextTask && (
                <div style={{ marginLeft: 15 }}>
                  <div style={{ fontSize: 11, color: "#374151" }}>
                    {formatComplianceType(nextTask.compliance_type)}
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 600, marginTop: 2,
                    color: days !== null && days < 0 ? "#dc2626" : days !== null && days <= 5 ? "#d97706" : "#6b7280",
                  }}>
                    {days !== null && days < 0
                      ? `⚠ ${Math.abs(days)}d overdue`
                      : days !== null
                      ? `Due in ${days}d · ${nextTask.due_date}`
                      : nextTask.due_date}
                  </div>
                </div>
              )}
              {activeCount > 1 && (
                <div style={{ fontSize: 10, color: "#9ca3af", marginLeft: 15, marginTop: 4 }}>
                  +{activeCount - 1} more task{activeCount > 2 ? "s" : ""}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .heatmap-card:hover { border-color: ${cfg.cardBorder} !important; background: ${cfg.dotBg} !important; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
