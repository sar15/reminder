import Link from "next/link";
import { T } from "@/lib/tokens";

const NAV = [
  { href: "/dashboard",         icon: "⊞", label: "Dashboard"         },
  { href: "/dashboard/clients", icon: "◎", label: "Clients"           },
  { href: "/dashboard/tasks",   icon: "☑", label: "Tasks"             },
  { href: "/dashboard/reports", icon: "⊡", label: "Liability Reports" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const day = new Date().getDate();
  const portalWarning = day >= 18 && day <= 22;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: T.bgBase }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 216,
        flexShrink: 0,
        background: T.bgSurface,
        borderRight: `1px solid ${T.border}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>

        {/* Logo */}
        <div style={{ padding: "18px 16px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28,
              background: T.brand,
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, color: "#fff", fontWeight: 700, flexShrink: 0,
            }}>
              D
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.text1, letterSpacing: "-0.02em" }}>
              DeadlineShield
            </span>
          </div>
        </div>

        {/* Firm */}
        <div style={{ padding: "0 10px 12px" }}>
          <div style={{ background: T.bgSubtle, borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em" }}>Firm</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text1, marginTop: 2 }}>Demo CA Firm</div>
          </div>
        </div>

        <div style={{ height: 1, background: T.bgMuted, margin: "0 10px" }} />

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em", padding: "6px 8px 4px" }}>
            Workspace
          </div>
          {NAV.map(({ href, icon, label }) => (
            <NavLink key={href} href={href} icon={icon} label={label} />
          ))}
        </nav>

        {/* Portal health */}
        <div style={{ padding: "8px 10px" }}>
          <div style={{
            background: portalWarning ? T.amberLight : T.greenLight,
            border: `1px solid ${portalWarning ? T.amberBorder : T.greenBorder}`,
            borderRadius: 8,
            padding: "8px 10px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: portalWarning ? T.amber : T.green,
              }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: portalWarning ? T.amberText : T.greenText }}>
                GST Portal: {portalWarning ? "Slow" : "Stable"}
              </span>
            </div>
            <div style={{ fontSize: 10, color: portalWarning ? T.amber : T.green, marginTop: 2, paddingLeft: 12 }}>
              {portalWarning ? "File within 6 hours" : "Safe to file now"}
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: T.bgMuted, margin: "4px 10px" }} />

        <div style={{ padding: "4px 8px 12px" }}>
          <NavLink href="/dashboard/settings" icon="⚙" label="Settings" />
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Topbar */}
        <header style={{
          height: 48,
          background: T.bgSurface,
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 12, color: T.text3 }}>{today}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "3px 10px",
              background: T.amberLight,
              border: `1px solid ${T.amberBorder}`,
              borderRadius: 20,
              fontSize: 11, fontWeight: 600, color: T.amberText,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.amber }} />
              Demo Mode
            </span>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: T.brandLight,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: T.brand,
            }}>
              CA
            </div>
          </div>
        </header>

        {/* Page */}
        <main style={{ flex: 1, overflowY: "auto", background: T.bgBase }}>
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link href={href} style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 10px",
      borderRadius: 7,
      fontSize: 13,
      fontWeight: 500,
      color: "#57534E",
      textDecoration: "none",
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.background = "#F5F5F4";
      (e.currentTarget as HTMLElement).style.color = "#1C1917";
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.background = "transparent";
      (e.currentTarget as HTMLElement).style.color = "#57534E";
    }}
    >
      <span style={{ fontSize: 14, width: 16, textAlign: "center", flexShrink: 0 }}>{icon}</span>
      {label}
    </Link>
  );
}
