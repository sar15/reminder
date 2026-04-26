"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export function Topbar({ today, isDemoMode = false }: { today: string; isDemoMode?: boolean }) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header
      style={{
        height: 60,
        background: "#FAF9F7",
        borderBottom: "1px solid #E5E2DB",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 12, color: "#9B9B9B", fontWeight: 500 }}>
        {today}
        {isDemoMode && (
          <span
            style={{
              marginLeft: 10,
              fontSize: 10,
              fontWeight: 700,
              color: "#FF8B00",
              background: "#FFF3E0",
              border: "1px solid #FFD591",
              borderRadius: 100,
              padding: "2px 8px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Demo
          </span>
        )}
      </span>

      <button
        onClick={signOut}
        title="Sign out"
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          border: "1px solid #E5E2DB",
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9B9B9B",
          cursor: "pointer",
          transition: "all 0.15s",
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
        <LogOut size={13} />
      </button>
    </header>
  );
}
