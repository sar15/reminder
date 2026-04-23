import { getClients, getAllTasks } from "@/lib/data";
import { getRiskLevel } from "@/lib/utils";
import Link from "next/link";

export default async function ReportsPage() {
  const [clients, tasks] = await Promise.all([getClients(), getAllTasks()]);

  const tasksByClient = tasks.reduce<Record<string, typeof tasks>>((acc, t) => {
    if (!acc[t.client_id]) acc[t.client_id] = [];
    acc[t.client_id].push(t);
    return acc;
  }, {});

  const enriched = clients.map((c) => {
    const all = tasksByClient[c.id] ?? [];
    const active = all.filter((t) => t.status !== "filed");
    return { ...c, riskLevel: getRiskLevel(active), taskCount: all.length };
  });

  const riskDot  = { red: "#dc2626", yellow: "#d97706", green: "#059669" };
  const riskText = { red: "#991b1b", yellow: "#92400e", green: "#166534" };
  const riskBg   = { red: "#fef2f2", yellow: "#fffbeb", green: "#f0fdf4" };

  return (
    <div style={{ padding: 28, maxWidth: 860 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Liability Reports</h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 3 }}>Court-admissible proof of every client communication</p>
      </div>

      {/* What is this */}
      <div style={{
        background: "#f5f3ff", border: "1px solid #e0e7ff",
        borderRadius: 10, padding: "16px 20px", marginBottom: 24,
        display: "flex", gap: 14,
      }}>
        <span style={{ fontSize: 24, flexShrink: 0 }}>🛡️</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#4338ca", marginBottom: 6 }}>Your Legal Shield</div>
          <div style={{ fontSize: 13, color: "#4f46e5", lineHeight: 1.6 }}>
            When a client blames you for a penalty, generate this report instantly. It shows every reminder sent,
            delivered, and opened — plus when documents were uploaded and returns were filed.
            Timestamped, immutable, and ready for ICAI proceedings.
          </div>
        </div>
      </div>

      {/* Client list */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f3f4f6" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Select Client</span>
        </div>
        {enriched.map((client, i) => (
          <div key={client.id} style={{
            padding: "14px 18px",
            borderBottom: i < enriched.length - 1 ? "1px solid #f3f4f6" : "none",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
          className="report-row"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: "#ede9fe",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700, color: "#4f46e5",
              }}>
                {client.name.charAt(0)}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{client.name}</span>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: riskDot[client.riskLevel] }} />
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                  {client.pan ?? "No PAN"} · {client.taskCount} tasks
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href={`/api/reports/${client.id}/pdf`} style={{
                border: "1px solid #e5e7eb", background: "#fff",
                color: "#374151", padding: "7px 14px", borderRadius: 7,
                fontSize: 12, fontWeight: 600, textDecoration: "none",
              }}>
                ↓ PDF
              </Link>
              <Link href={`/dashboard/reports/${client.id}`} style={{
                background: "#4f46e5", color: "#fff",
                padding: "7px 14px", borderRadius: 7,
                fontSize: 12, fontWeight: 600, textDecoration: "none",
              }}>
                View Report →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <style>{`.report-row:hover { background: #fafafa; }`}</style>
    </div>
  );
}
