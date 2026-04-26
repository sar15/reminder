"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/dashboard",          label: "Overview"  },
  { href: "/dashboard/clients",  label: "Clients"   },
  { href: "/dashboard/settings", label: "Settings"  },
];

interface SidebarProps {
  firmName?: string;
  userName?: string;
  userRole?: string;
}

export function Sidebar({ firmName = "Demo CA Firm", userName = "Admin User", userRole = "partner" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  function active(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CA";

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        background: "#FAF9F7",
        borderRight: "1px solid #E5E2DB",
        padding: "32px 20px",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "#1A1A1A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 4,
                borderRadius: 4,
                border: "1.5px solid #2D5BFF",
                opacity: 0.7,
              }}
            />
            <Shield size={13} color="#fff" style={{ position: "relative", zIndex: 1 }} />
          </div>
          <span
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontWeight: 500,
              fontSize: 16,
              color: "#1A1A1A",
              letterSpacing: "-0.03em",
            }}
          >
            Deadline<span style={{ color: "#2D5BFF" }}>Shield</span>
          </span>
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "#9B9B9B",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            paddingLeft: 39,
            maxWidth: 160,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {firmName}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#C5C2BB",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 8,
            paddingLeft: 10,
          }}
        >
          Menu
        </div>
        {NAV.map(({ href, label }) => {
          const isActive = active(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "block",
                padding: "9px 12px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#1A1A1A" : "#6B6B6B",
                background: isActive ? "#EDEBE6" : "transparent",
                textDecoration: "none",
                transition: "all 0.15s",
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "#F3F1EC";
                  (e.currentTarget as HTMLElement).style.color = "#3D3D3D";
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#6B6B6B";
                }
              }}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div
        style={{
          paddingTop: 20,
          borderTop: "1px solid #E5E2DB",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 10px",
            borderRadius: 8,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#EDEBE6",
              border: "1px solid #E5E2DB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
              color: "#6B6B6B",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#3D3D3D", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {userName}
            </div>
            <div style={{ fontSize: 10, color: "#9B9B9B", textTransform: "capitalize" }}>{userRole}</div>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              border: "1px solid #E5E2DB",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9B9B9B",
              cursor: "pointer",
              transition: "all 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "#FFEBE6";
              (e.currentTarget as HTMLElement).style.color = "#DE350B";
              (e.currentTarget as HTMLElement).style.borderColor = "#FFBDAD";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "#9B9B9B";
              (e.currentTarget as HTMLElement).style.borderColor = "#E5E2DB";
            }}
          >
            <LogOut size={11} />
          </button>
        </div>
      </div>
    </aside>
  );
}
