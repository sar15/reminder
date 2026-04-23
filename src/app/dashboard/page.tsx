import { getClients, getAllTasks } from "@/lib/data";
import { getRiskLevel, daysUntilDue, formatComplianceType } from "@/lib/utils";
import Link from "next/link";
import { T, S } from "@/lib/tokens";

export default async function DashboardPage() {
  const [clients, tasks] = await Promise.all([getClients(), getAllTasks()]);

  const byClient = tasks.reduce<Record<string, typeof tasks>>((a, t) => {
    (a[t.client_id] ??= []).push(t); return a;
  }, {});

  const summaries = clients.map((c) => {
    const all    = byClient[c.id] ?? [];
    const active = all.filter(t => t.status !== "filed");
    const risk   = getRiskLevel(active);
    const next   = [...active].sort((a, b) => +new Date(a.due_date) - +new Date(b.due_date))[0];
    return { c, risk, next: next ?? null, days: next ? daysUntilDue(next.due_date) : null, activeCount: active.length };
  });

  const red    = summaries.filter(s => s.risk === "red");
  const yellow = summaries.filter(s => s.risk === "yellow");
  const green  = summaries.filter(s => s.risk === "green");
  const filed  = tasks.filter(t => t.status === "filed").length;

  return (
    <div style={{ padding: 28, maxWidth: 1060 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text1, letterSpacing: "-0.03em", lineHeight: 1.2 }}>
            Command Center
          </h1>
          <p style={{ fontSize: 13, color: T.text3, marginTop: 4 }}>
            Focus on red first — everything else can wait.
          </p>
        </div>
        <Link href="/dashboard/clients/new" style={S.btnPrimary}>
          + Add Client
        </Link>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { n: clients.length, label: "Total Clients",  sub: "active",          color: T.brand,  bg: T.brandLight },
          { n: red.length,     label: "Critical",       sub: "need action now", color: T.red,    bg: T.redLight,   pulse: red.length > 0 },
          { n: yellow.length,  label: "Awaiting Docs",  sub: "reminders sent",  color: T.amber,  bg: T.amberLight },
          { n: filed,          label: "Filed",          sub: "this month",      color: T.green,  bg: T.greenLight },
        ].map(({ n, label, sub, color, bg, pulse }) => (
          <div key={label} style={{ ...S.card, padding: "18px 20px" }}>
            <div style={{ ...S.label, marginBottom: 10 }}>{label}</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color, lineHeight: 1 }}>{n}</span>
              {pulse && n > 0 && (
                <span style={{
                  width: 8, height: 8, borderRadius: "50%", background: color,
                  marginBottom: 6, animation: "pulse 1.5s infinite",
                }} />
              )}
            </div>
            <div style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Escalation banner */}
      {red.length > 0 && (
        <div style={{
          background: T.redLight,
          border: `1px solid ${T.redBorder}`,
          borderRadius: 12,
          padding: "14px 16px",
          marginBottom: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 14 }}>🚨</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.redText }}>
              Partner action required — {red.length} client{red.length > 1 ? "s" : ""} at critical risk
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {red.map(({ c, next, days }) => (
              <div key={c.id} style={{
                background: T.bgSurface,
                border: `1px solid ${T.redBorder}`,
                borderRadius: 8,
                padding: "10px 14px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>{c.name}</span>
                  {next && (
                    <span style={{ fontSize: 12, color: T.red, marginLeft: 10 }}>
                      {formatComplianceType(next.compliance_type)} ·{" "}
                      {days !== null && days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                    </span>
                  )}
                </div>
                <Link href={`/dashboard/clients/${c.id}/remind`} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "6px 14px",
                  background: T.red, color: "#fff",
                  borderRadius: 7, fontSize: 12, fontWeight: 600,
                  textDecoration: "none",
                }}>
                  Send Final Warning →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3-col heatmap */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <HeatmapCol color="red"    label="🔴 Critical"      sub="≤5 days or overdue"     count={red.length}    items={red} />
        <HeatmapCol color="yellow" label="🟡 Awaiting Docs" sub="Reminders sent, waiting" count={yellow.length} items={yellow} />
        <HeatmapCol color="green"  label="🟢 On Track"      sub="Docs received or filed"  count={green.length}  items={green} />
      </div>
    </div>
  );
}

const COL = {
  red:    { dot: T.red,   hBg: T.redLight,   hBorder: T.redBorder,   hText: T.redText,   cardBorder: "#FECACA" },
  yellow: { dot: T.amber, hBg: T.amberLight, hBorder: T.amberBorder, hText: T.amberText, cardBorder: "#FDE68A" },
  green:  { dot: T.green, hBg: T.greenLight, hBorder: T.greenBorder, hText: T.greenText, cardBorder: "#A7F3D0" },
};

function HeatmapCol({ color, label, sub, count, items }: {
  color: "red" | "yellow" | "green";
  label: string; sub: string; count: number;
  items: Array<{
    c: { id: string; name: string; pan: string | null };
    next: { compliance_type: string; due_date: string } | null;
    days: number | null; activeCount: number;
  }>;
}) {
  const cfg = COL[color];
  return (
    <div style={{ display: "flex", flexDirection: "column", borderRadius: 12, overflow: "hidden", border: `1px solid ${cfg.cardBorder}` }}>
      {/* Column header */}
      <div style={{
        background: cfg.hBg,
        padding: "12px 14px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: cfg.hText }}>{label}</div>
          <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{sub}</div>
        </div>
        <span style={{
          background: cfg.dot, color: "#fff",
          borderRadius: 20, padding: "2px 9px",
          fontSize: 12, fontWeight: 700,
        }}>
          {count}
        </span>
      </div>

      {/* Cards */}
      <div style={{
        flex: 1, background: T.bgBase,
        padding: 10, display: "flex", flexDirection: "column", gap: 8,
        minHeight: 160,
      }}>
        {items.length === 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 80 }}>
            <span style={{ fontSize: 12, color: T.text4 }}>Nothing here</span>
          </div>
        )}
        {items.map(({ c, next, days, activeCount }) => (
          <Link key={c.id} href={`/dashboard/clients/${c.id}`} style={{ textDecoration: "none" }}>
            <div style={{
              background: T.bgSurface,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: "10px 12px",
              cursor: "pointer",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: T.text1 }}>{c.name}</span>
              </div>
              {c.pan && (
                <div style={{ fontSize: 10, color: T.text3, fontFamily: "monospace", marginLeft: 13, marginBottom: 4 }}>
                  {c.pan}
                </div>
              )}
              {next && (
                <div style={{ marginLeft: 13 }}>
                  <div style={{ fontSize: 11, color: T.text2 }}>{formatComplianceType(next.compliance_type)}</div>
                  <div style={{
                    fontSize: 11, fontWeight: 600, marginTop: 2,
                    color: days !== null && days < 0 ? T.red : days !== null && days <= 5 ? T.amber : T.text3,
                  }}>
                    {days !== null && days < 0
                      ? `⚠ ${Math.abs(days)}d overdue`
                      : days !== null ? `${days}d left · ${next.due_date}`
                      : next.due_date}
                  </div>
                </div>
              )}
              {activeCount > 1 && (
                <div style={{ fontSize: 10, color: T.text3, marginLeft: 13, marginTop: 4 }}>
                  +{activeCount - 1} more task{activeCount > 2 ? "s" : ""}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
