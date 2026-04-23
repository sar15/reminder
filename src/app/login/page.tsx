"use client";

import { useRouter } from "next/navigation";

const FEATURES = [
  { icon: "🛡️", text: "Timestamped, court-admissible proof of every reminder" },
  { icon: "📱", text: "Client magic link portal — no login, no friction" },
  { icon: "🔴", text: "Risk heatmap — focus only on critical clients" },
  { icon: "📊", text: "One-click Liability Report PDF for ICAI disputes" },
  { icon: "🔒", text: "1-to-1 only — no CC, no BCC, no privacy breach" },
];

export default function LoginPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex" }}>

      {/* Left — value prop */}
      <div style={{
        width: "45%", background: "#4f46e5",
        padding: "48px 48px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48 }}>
            <div style={{ width: 36, height: 36, background: "rgba(255,255,255,0.2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              🛡️
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>DeadlineShield</span>
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: 1.3, marginBottom: 16 }}>
            Stop getting blamed for<br />penalties you didn&apos;t cause.
          </h2>
          <p style={{ fontSize: 14, color: "#c7d2fe", lineHeight: 1.7, marginBottom: 36 }}>
            Built for Indian CA firms managing 50–500 clients.
            Automated reminders, document collection, and legal proof — all in one place.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {FEATURES.map((f) => (
              <div key={f.text} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{f.icon}</span>
                <span style={{ fontSize: 13, color: "#e0e7ff", lineHeight: 1.5 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 12, color: "#a5b4fc" }}>
          Rs.1,050/month total infra cost · Profitable with 1 paying customer
        </div>
      </div>

      {/* Right — login */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 48, background: "#fff",
      }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 6 }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 28 }}>Sign in to your firm dashboard</p>

          {/* Demo entry */}
          <div style={{
            background: "#fffbeb", border: "1px solid #fde68a",
            borderRadius: 10, padding: "14px 16px", marginBottom: 20,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e", marginBottom: 4 }}>⚡ Demo Mode Active</div>
            <div style={{ fontSize: 12, color: "#78350f", marginBottom: 12, lineHeight: 1.5 }}>
              No setup needed. Explore with 5 real-looking CA clients and full workflow.
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                width: "100%", background: "#4f46e5", color: "#fff",
                border: "none", borderRadius: 8, padding: "12px",
                fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}
            >
              Enter Demo Dashboard →
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
            <span style={{ fontSize: 12, color: "#9ca3af" }}>or sign in with email</span>
            <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              type="email"
              placeholder="partner@yourfirm.com"
              style={{
                width: "100%", border: "1px solid #e5e7eb", borderRadius: 8,
                padding: "11px 14px", fontSize: 13, color: "#111827",
                outline: "none",
              }}
            />
            <button style={{
              width: "100%", background: "#f9fafb",
              border: "1px solid #e5e7eb", borderRadius: 8, padding: "11px",
              fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer",
            }}>
              Send Magic Link
            </button>
          </div>

          <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", marginTop: 16 }}>
            No password needed · Secure magic link sent to your email
          </p>

          {/* Demo portal links */}
          <div style={{ marginTop: 28, padding: "14px 16px", background: "#f9fafb", borderRadius: 10, border: "1px solid #f3f4f6" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
              Demo Client Portals
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { token: "demo-sharma", name: "Sharma Enterprises" },
                { token: "demo-patel",  name: "Patel Constructions" },
                { token: "demo-reddy",  name: "Reddy Tech Solutions" },
              ].map(({ token, name }) => (
                <a key={token} href={`/portal/${token}`} style={{
                  fontSize: 12, color: "#4f46e5", textDecoration: "none",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  → {name} portal
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
