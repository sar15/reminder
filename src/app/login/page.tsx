"use client";
import { useRouter } from "next/navigation";
import { T, S } from "@/lib/tokens";

export default function LoginPage() {
  const router = useRouter();
  return (
    <div style={{ minHeight: "100vh", background: T.bgBase, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 880, display: "grid", gridTemplateColumns: "1fr 380px", gap: 64, alignItems: "center" }}>

        {/* Left */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
            <div style={{ width: 32, height: 32, background: T.brand, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff", fontWeight: 700 }}>D</div>
            <span style={{ fontSize: 15, fontWeight: 700, color: T.text1, letterSpacing: "-0.02em" }}>DeadlineShield</span>
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 800, color: T.text1, lineHeight: 1.15, letterSpacing: "-0.04em", marginBottom: 16 }}>
            Stop getting blamed<br />for penalties you<br /><span style={{ color: T.brand }}>didn't cause.</span>
          </h1>
          <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.7, marginBottom: 28, maxWidth: 400 }}>
            Built for Indian CA firms. Automated reminders, document collection, and timestamped legal proof — all in one place.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["🛡️", "Court-admissible proof of every reminder sent"],
              ["📱", "Client magic link portal — no login, no friction"],
              ["🔴", "Risk heatmap — focus only on critical clients"],
              ["📄", "One-click Liability Report PDF for ICAI disputes"],
              ["🔒", "1-to-1 only — no CC, no BCC, no privacy breach"],
            ].map(([icon, text]) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ fontSize: 13, color: T.text2 }}>{text}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: T.text3, marginTop: 24 }}>Rs.1,050/month total infra cost · Profitable with 1 paying customer</p>
        </div>

        {/* Right — card */}
        <div style={{ background: T.bgSurface, borderRadius: 16, border: `1px solid ${T.border}`, padding: 28, boxShadow: T.shadowMd }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 4, letterSpacing: "-0.02em" }}>Welcome back</h2>
          <p style={{ fontSize: 13, color: T.text3, marginBottom: 22 }}>Sign in to your firm dashboard</p>

          {/* Demo */}
          <div style={{ background: T.amberLight, border: `1px solid ${T.amberBorder}`, borderRadius: 10, padding: "14px 16px", marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.amberText, marginBottom: 4 }}>⚡ Demo Mode</div>
            <div style={{ fontSize: 12, color: "#78350F", marginBottom: 12, lineHeight: 1.5 }}>No setup needed. Explore with 5 real-looking CA clients and the full workflow.</div>
            <button onClick={() => router.push("/dashboard")} style={{ ...S.btnPrimary, width: "100%", justifyContent: "center", padding: "10px 16px" }}>
              Enter Demo Dashboard →
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ flex: 1, height: 1, background: T.bgMuted }} />
            <span style={{ fontSize: 11, color: T.text3 }}>or sign in with email</span>
            <div style={{ flex: 1, height: 1, background: T.bgMuted }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input type="email" placeholder="partner@yourfirm.com" style={S.input} />
            <button style={{ ...S.btnSecondary, width: "100%", justifyContent: "center", padding: "10px 16px" }}>Send Magic Link</button>
          </div>

          <p style={{ fontSize: 11, color: T.text3, textAlign: "center", marginTop: 12 }}>No password needed · Secure link sent to your email</p>

          <div style={{ marginTop: 20, paddingTop: 18, borderTop: `1px solid ${T.bgMuted}` }}>
            <div style={{ ...S.label, marginBottom: 8 }}>Demo Client Portals</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {[
                { token: "demo-sharma", name: "Sharma Enterprises (Critical)" },
                { token: "demo-patel",  name: "Patel Constructions (Critical)" },
                { token: "demo-reddy",  name: "Reddy Tech Solutions (On Track)" },
              ].map(({ token, name }) => (
                <a key={token} href={`/portal/${token}`} style={{ fontSize: 12, color: T.brand, display: "flex", alignItems: "center", gap: 4 }}>
                  → {name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
