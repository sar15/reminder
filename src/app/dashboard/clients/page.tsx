import { getClients, getAllTasks } from "@/lib/data";
import { getRiskLevel, formatComplianceType } from "@/lib/utils";
import Link from "next/link";
import { T, S } from "@/lib/tokens";

export default async function ClientsPage() {
  const [clients, tasks] = await Promise.all([getClients(), getAllTasks()]);
  const byClient = tasks.reduce<Record<string, typeof tasks>>((a, t) => { (a[t.client_id] ??= []).push(t); return a; }, {});
  const enriched = clients.map(c => {
    const all = byClient[c.id] ?? [];
    const active = all.filter(t => t.status !== "filed");
    return { ...c, risk: getRiskLevel(active), activeCount: active.length };
  });

  const RISK = {
    red:    { dot: T.red,   label: "Critical",  bg: T.redLight,   text: T.redText   },
    yellow: { dot: T.amber, label: "Awaiting",  bg: T.amberLight, text: T.amberText },
    green:  { dot: T.green, label: "On Track",  bg: T.greenLight, text: T.greenText },
  };

  return (
    <div style={{ padding: 28, maxWidth: 1060 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text1, letterSpacing: "-0.03em" }}>Clients</h1>
          <p style={{ fontSize: 13, color: T.text3, marginTop: 4 }}>{clients.length} active clients</p>
        </div>
        <Link href="/dashboard/clients/new" style={S.btnPrimary}>+ Add Client</Link>
      </div>

      <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: T.bgSubtle, borderBottom: `1px solid ${T.bgMuted}` }}>
              {["Client", "PAN / GSTIN", "Compliances", "Risk", "Tasks", ""].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "11px 18px", ...S.label }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {enriched.map((c, i) => {
              const r = RISK[c.risk];
              return (
                <tr key={c.id} style={{ borderBottom: i < enriched.length - 1 ? `1px solid ${T.bgSubtle}` : "none" }}>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 8,
                        background: T.brandLight,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700, color: T.brand, flexShrink: 0,
                      }}>
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>{c.name}</div>
                        {c.contact_name && <div style={{ fontSize: 11, color: T.text3, marginTop: 1 }}>{c.contact_name}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ fontSize: 12, fontFamily: "monospace", color: T.text2 }}>{c.pan ?? "—"}</div>
                    <div style={{ fontSize: 11, fontFamily: "monospace", color: T.text3, marginTop: 2 }}>{c.gstin ?? "—"}</div>
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {c.compliance_types.slice(0, 3).map(t => (
                        <span key={t} style={{ background: T.bgSubtle, color: T.text2, fontSize: 10, fontWeight: 500, padding: "2px 7px", borderRadius: 5 }}>
                          {formatComplianceType(t)}
                        </span>
                      ))}
                      {c.compliance_types.length > 3 && (
                        <span style={{ fontSize: 11, color: T.text3 }}>+{c.compliance_types.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 20, background: r.bg, color: r.text, fontSize: 11, fontWeight: 600 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: r.dot }} />
                      {r.label}
                    </span>
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <span style={{ fontSize: 12, color: T.text3 }}>{c.activeCount} active</span>
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <Link href={`/dashboard/clients/${c.id}`} style={{ fontSize: 12, fontWeight: 600, color: T.brand }}>
                      View →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
