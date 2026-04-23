import { getAllTasks, getClients } from "@/lib/data";
import { formatComplianceType, daysUntilDue } from "@/lib/utils";
import Link from "next/link";
import { T, S } from "@/lib/tokens";

export default async function TasksPage() {
  const [tasks, clients] = await Promise.all([getAllTasks(), getClients()]);
  const cMap = Object.fromEntries(clients.map(c => [c.id, c]));
  const sorted = [...tasks].sort((a, b) => +new Date(a.due_date) - +new Date(b.due_date));
  const overdue  = sorted.filter(t => daysUntilDue(t.due_date) < 0 && t.status !== "filed");
  const upcoming = sorted.filter(t => daysUntilDue(t.due_date) >= 0 && t.status !== "filed");
  const filed    = sorted.filter(t => t.status === "filed");

  const STATUS: Record<string, { bg: string; text: string }> = {
    pending:       { bg: T.bgSubtle,   text: T.text2      },
    waiting_docs:  { bg: T.amberLight, text: T.amberText  },
    docs_received: { bg: T.blueLight,  text: T.blueText   },
    in_progress:   { bg: T.blueLight,  text: T.blueText   },
    review_ready:  { bg: T.brandLight, text: T.brandText  },
    filed:         { bg: T.greenLight, text: T.greenText  },
    overdue:       { bg: T.redLight,   text: T.redText    },
  };

  function Section({ title, items, accent }: { title: string; items: typeof tasks; accent: string }) {
    if (items.length === 0) return null;
    return (
      <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "13px 18px", borderBottom: `1px solid ${T.bgMuted}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>{title}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: accent }}>{items.length} tasks</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: T.bgSubtle, borderBottom: `1px solid ${T.bgMuted}` }}>
              {["Client", "Compliance", "Period", "Due Date", "Status", ""].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "9px 18px", ...S.label }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((t, i) => {
              const d = daysUntilDue(t.due_date);
              const isOv = d < 0 && t.status !== "filed";
              const s = STATUS[t.status] ?? STATUS.pending;
              const client = cMap[t.client_id];
              return (
                <tr key={t.id} style={{ borderBottom: i < items.length - 1 ? `1px solid ${T.bgSubtle}` : "none", background: isOv ? "#FFFAFA" : "transparent" }}>
                  <td style={{ padding: "12px 18px", fontSize: 13, fontWeight: 600, color: T.text1 }}>{client?.name ?? "—"}</td>
                  <td style={{ padding: "12px 18px", fontSize: 13, color: T.text2 }}>{formatComplianceType(t.compliance_type)}</td>
                  <td style={{ padding: "12px 18px", fontSize: 12, color: T.text3 }}>{t.period}</td>
                  <td style={{ padding: "12px 18px" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: isOv ? T.red : d <= 5 ? T.amber : T.text1 }}>{t.due_date}</div>
                    {t.status !== "filed" && <div style={{ fontSize: 10, color: isOv ? T.red : T.text3, marginTop: 2 }}>{isOv ? `${Math.abs(d)}d overdue` : `${d}d left`}</div>}
                  </td>
                  <td style={{ padding: "12px 18px" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: s.bg, color: s.text }}>{t.status.replace(/_/g, " ")}</span>
                  </td>
                  <td style={{ padding: "12px 18px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      {isOv && <Link href={`/dashboard/clients/${t.client_id}/remind`} style={{ fontSize: 11, fontWeight: 600, color: T.red, background: T.redLight, padding: "3px 8px", borderRadius: 6 }}>Remind</Link>}
                      <Link href={`/dashboard/clients/${t.client_id}`} style={{ fontSize: 12, fontWeight: 600, color: T.brand }}>View →</Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div style={{ padding: 28, maxWidth: 1060 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text1, letterSpacing: "-0.03em" }}>All Tasks</h1>
        <p style={{ fontSize: 13, color: T.text3, marginTop: 4 }}>{overdue.length} overdue · {upcoming.length} upcoming · {filed.length} filed</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Section title="⚠️ Overdue"  items={overdue}  accent={T.red}   />
        <Section title="📋 Upcoming" items={upcoming} accent={T.brand} />
        <Section title="✅ Filed"    items={filed}    accent={T.green} />
      </div>
    </div>
  );
}
