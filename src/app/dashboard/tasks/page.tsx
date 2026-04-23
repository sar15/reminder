import { getAllTasks, getClients } from "@/lib/data";
import { formatComplianceType, daysUntilDue } from "@/lib/utils";
import Link from "next/link";

export default async function TasksPage() {
  const [tasks, clients] = await Promise.all([getAllTasks(), getClients()]);
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));

  const sorted = [...tasks].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  const overdue  = sorted.filter((t) => daysUntilDue(t.due_date) < 0 && t.status !== "filed");
  const upcoming = sorted.filter((t) => daysUntilDue(t.due_date) >= 0 && t.status !== "filed");
  const filed    = sorted.filter((t) => t.status === "filed");

  const statusCfg: Record<string, { bg: string; text: string }> = {
    pending:       { bg: "#f3f4f6", text: "#374151" },
    waiting_docs:  { bg: "#fef3c7", text: "#92400e" },
    docs_received: { bg: "#dbeafe", text: "#1e40af" },
    in_progress:   { bg: "#dbeafe", text: "#1e40af" },
    review_ready:  { bg: "#ede9fe", text: "#5b21b6" },
    filed:         { bg: "#d1fae5", text: "#065f46" },
    overdue:       { bg: "#fee2e2", text: "#991b1b" },
  };

  function TaskTable({ items, title, count, accent }: {
    items: typeof tasks; title: string; count: number; accent: string;
  }) {
    if (items.length === 0) return null;
    return (
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{title}</span>
          <span style={{ fontSize: 12, color: accent, fontWeight: 600 }}>{count} tasks</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
              {["Client", "Compliance", "Period", "Due Date", "Status", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "9px 18px", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((task, i) => {
              const days = daysUntilDue(task.due_date);
              const isOverdue = days < 0 && task.status !== "filed";
              const client = clientMap[task.client_id];
              const s = statusCfg[task.status] ?? statusCfg.pending;
              return (
                <tr key={task.id} style={{
                  borderBottom: i < items.length - 1 ? "1px solid #f3f4f6" : "none",
                  background: isOverdue ? "#fff9f9" : "transparent",
                }}>
                  <td style={{ padding: "12px 18px", fontSize: 13, fontWeight: 600, color: "#111827" }}>{client?.name ?? "—"}</td>
                  <td style={{ padding: "12px 18px", fontSize: 13, color: "#374151" }}>{formatComplianceType(task.compliance_type)}</td>
                  <td style={{ padding: "12px 18px", fontSize: 12, color: "#6b7280" }}>{task.period}</td>
                  <td style={{ padding: "12px 18px" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: isOverdue ? "#dc2626" : days <= 5 ? "#d97706" : "#111827" }}>
                      {task.due_date}
                    </div>
                    {task.status !== "filed" && (
                      <div style={{ fontSize: 11, color: isOverdue ? "#dc2626" : "#9ca3af", marginTop: 1 }}>
                        {isOverdue ? `${Math.abs(days)}d overdue` : `${days}d left`}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "12px 18px" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, background: s.bg, color: s.text, padding: "3px 8px", borderRadius: 20 }}>
                      {task.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td style={{ padding: "12px 18px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      {isOverdue && (
                        <Link href={`/dashboard/clients/${task.client_id}/remind`} style={{
                          fontSize: 11, fontWeight: 600, color: "#dc2626",
                          background: "#fef2f2", padding: "3px 8px", borderRadius: 6,
                          textDecoration: "none",
                        }}>
                          Remind
                        </Link>
                      )}
                      <Link href={`/dashboard/clients/${task.client_id}`} style={{ fontSize: 12, color: "#4f46e5", textDecoration: "none", fontWeight: 600 }}>
                        View →
                      </Link>
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
    <div style={{ padding: 28, maxWidth: 1100 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>All Tasks</h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 3 }}>
          Sorted by deadline · {overdue.length} overdue · {upcoming.length} upcoming · {filed.length} filed
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TaskTable items={overdue}  title="⚠️ Overdue"  count={overdue.length}  accent="#dc2626" />
        <TaskTable items={upcoming} title="📋 Upcoming" count={upcoming.length} accent="#4f46e5" />
        <TaskTable items={filed}    title="✅ Filed"    count={filed.length}    accent="#059669" />
      </div>
    </div>
  );
}
