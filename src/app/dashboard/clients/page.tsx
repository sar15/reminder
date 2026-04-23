import { getClients, getAllTasks } from "@/lib/data";
import { getRiskLevel, formatComplianceType } from "@/lib/utils";
import Link from "next/link";

export default async function ClientsPage() {
  const [clients, tasks] = await Promise.all([getClients(), getAllTasks()]);

  const tasksByClient = tasks.reduce<Record<string, typeof tasks>>((acc, t) => {
    if (!acc[t.client_id]) acc[t.client_id] = [];
    acc[t.client_id].push(t);
    return acc;
  }, {});

  const enriched = clients.map((c) => {
    const all = tasksByClient[c.id] ?? [];
    const active = all.filter((t) => t.status !== "filed");
    return { ...c, riskLevel: getRiskLevel(active), activeCount: active.length, totalCount: all.length };
  });

  const riskDot = { red: "#dc2626", yellow: "#d97706", green: "#059669" };
  const riskLabel = { red: "Critical", yellow: "Waiting", green: "On Track" };
  const riskBg = { red: "#fef2f2", yellow: "#fffbeb", green: "#f0fdf4" };
  const riskText = { red: "#991b1b", yellow: "#92400e", green: "#166534" };

  return (
    <div style={{ padding: 28, maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Clients</h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 3 }}>{clients.length} active clients</p>
        </div>
        <Link href="/dashboard/clients/new" style={{
          background: "#4f46e5", color: "#fff",
          padding: "9px 18px", borderRadius: 8,
          fontSize: 13, fontWeight: 600, textDecoration: "none",
        }}>
          + Add Client
        </Link>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              {["Client", "PAN / GSTIN", "Compliances", "Risk", "Tasks", ""].map((h) => (
                <th key={h} style={{
                  textAlign: "left", padding: "11px 18px",
                  fontSize: 11, fontWeight: 600, color: "#6b7280",
                  textTransform: "uppercase", letterSpacing: "0.05em",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {enriched.map((client, i) => (
              <tr key={client.id} style={{
                borderBottom: i < enriched.length - 1 ? "1px solid #f3f4f6" : "none",
              }}
              className="table-row"
              >
                {/* Client */}
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8,
                      background: "#ede9fe",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, color: "#4f46e5", flexShrink: 0,
                    }}>
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{client.name}</div>
                      {client.contact_name && (
                        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{client.contact_name}</div>
                      )}
                    </div>
                  </div>
                </td>

                {/* PAN / GSTIN */}
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ fontSize: 12, fontFamily: "monospace", color: "#374151" }}>{client.pan ?? "—"}</div>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: "#9ca3af", marginTop: 2 }}>{client.gstin ?? "—"}</div>
                </td>

                {/* Compliances */}
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {client.compliance_types.slice(0, 3).map((t) => (
                      <span key={t} style={{
                        background: "#f3f4f6", color: "#374151",
                        fontSize: 10, fontWeight: 500,
                        padding: "2px 7px", borderRadius: 4,
                      }}>
                        {formatComplianceType(t)}
                      </span>
                    ))}
                    {client.compliance_types.length > 3 && (
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>
                        +{client.compliance_types.length - 3}
                      </span>
                    )}
                  </div>
                </td>

                {/* Risk */}
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: riskDot[client.riskLevel] }} />
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      background: riskBg[client.riskLevel],
                      color: riskText[client.riskLevel],
                      padding: "2px 8px", borderRadius: 20,
                    }}>
                      {riskLabel[client.riskLevel]}
                    </span>
                  </div>
                </td>

                {/* Tasks */}
                <td style={{ padding: "14px 18px" }}>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>{client.activeCount} active</span>
                </td>

                {/* Action */}
                <td style={{ padding: "14px 18px" }}>
                  <Link href={`/dashboard/clients/${client.id}`} style={{
                    fontSize: 12, fontWeight: 600, color: "#4f46e5", textDecoration: "none",
                  }}>
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .table-row:hover { background: #fafafa; }
      `}</style>
    </div>
  );
}
