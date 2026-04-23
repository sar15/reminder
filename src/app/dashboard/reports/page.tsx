import { getClients, getAllTasks } from "@/lib/data";
import { getRiskLevel } from "@/lib/utils";
import Link from "next/link";
import { T, S } from "@/lib/tokens";

export default async function ReportsPage() {
  const [clients, tasks] = await Promise.all([getClients(), getAllTasks()]);
  const byClient = tasks.reduce<Record<string, typeof tasks>>((a, t) => { (a[t.client_id] ??= []).push(t); return a; }, {});
  const enriched = clients.map(c => {
    const all = byClient[c.id] ?? [];
    return { ...c, risk: getRiskLevel(all.filter(t => t.status !== "filed")), taskCount: all.length };
  });
  const RISK_DOT = { red: T.red, yellow: T.amber, green: T.green };

  return (
    <div style={{ padding: 28, maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text1, letterSpacing: "-0.03em" }}>Liability Reports</h1>
        <p style={{ fontSize: 13, color: T.text3, marginTop: 4 }}>Court-admissible proof of every client communication</p>
      </div>

      <div style={{ background: T.brandLight, border: `1px solid ${T.brandBorder}`, borderRadius: 12, padding: "16px 20px", marginBottom: 24, display: "flex", gap: 14 }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>🛡️</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.brandText, marginBottom: 5 }}>Your Legal Shield</div>
          <div style={{ fontSize: 13, color: T.brand, lineHeight: 1.6 }}>
            When a client blames you for a penalty, generate this report instantly. It shows every reminder sent, delivered, and opened — plus when documents were uploaded and returns were filed. Timestamped, immutable, ready for ICAI proceedings.
          </div>
        </div>
      </div>

      <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "13px 18px", borderBottom: `1px solid ${T.bgMuted}` }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>Select Client</span>
        </div>
        {enriched.map((c, i) => (
          <div key={c.id} style={{ padding: "14px 18px", borderBottom: i < enriched.length - 1 ? `1px solid ${T.bgSubtle}` : "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: T.brandLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: T.brand }}>
                {c.name.charAt(0)}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>{c.name}</span>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: RISK_DOT[c.risk] }} />
                </div>
                <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{c.pan ?? "No PAN"} · {c.taskCount} tasks</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href={`/api/reports/${c.id}/pdf`} style={S.btnSecondary}>↓ PDF</Link>
              <Link href={`/dashboard/reports/${c.id}`} style={S.btnPrimary}>View Report →</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
