import Link from "next/link";
import { LayoutDashboard, Users, ListChecks, FileText, Settings, Shield } from "lucide-react";
import PortalHealthBadge from "@/components/PortalHealthBadge";

const NAV_ITEMS = [
  { href: "/dashboard",          icon: LayoutDashboard, label: "Dashboard"         },
  { href: "/dashboard/clients",  icon: Users,           label: "Clients"           },
  { href: "/dashboard/tasks",    icon: ListChecks,      label: "Tasks"             },
  { href: "/dashboard/reports",  icon: FileText,        label: "Liability Reports" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

      {/* ─── Sidebar ─── */}
      <aside style={{
        width: 220,
        flexShrink: 0,
        background: "#fff",
        borderRight: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>

        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32,
              background: "#4f46e5",
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Shield size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
                DeadlineShield
              </div>
              <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 1 }}>
                CA Practice Platform
              </div>
            </div>
          </div>
        </div>

        {/* Firm */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{
            background: "#f5f3ff",
            borderRadius: 8,
            padding: "8px 12px",
          }}>
            <div style={{ fontSize: 10, color: "#7c3aed", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Active Firm
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#4c1d95", marginTop: 2 }}>
              Demo CA Firm
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: "#374151",
                textDecoration: "none",
              }}
              className="nav-link"
            >
              <Icon size={15} color="#6b7280" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Portal health + settings */}
        <div style={{ padding: "12px 10px", borderTop: "1px solid #f3f4f6", display: "flex", flexDirection: "column", gap: 8 }}>
          <PortalHealthBadge />
          <Link
            href="/dashboard/settings"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: "#374151",
              textDecoration: "none",
            }}
            className="nav-link"
          >
            <Settings size={15} color="#6b7280" />
            Settings
          </Link>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top bar */}
        <header style={{
          height: 52,
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long", day: "numeric", month: "long", year: "numeric",
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              background: "#fef3c7",
              border: "1px solid #fde68a",
              borderRadius: 20,
              padding: "3px 10px",
              fontSize: 11,
              fontWeight: 600,
              color: "#92400e",
            }}>
              ⚡ Demo Mode
            </div>
            <div style={{
              width: 30, height: 30,
              background: "#4f46e5",
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#fff",
            }}>
              CA
            </div>
          </div>
        </header>

        {/* Page */}
        <main style={{ flex: 1, overflowY: "auto", background: "#f9fafb" }}>
          {children}
        </main>
      </div>

      <style>{`
        .nav-link:hover {
          background: #f9fafb;
          color: #4f46e5 !important;
        }
        .nav-link:hover svg { color: #4f46e5 !important; }
      `}</style>
    </div>
  );
}
