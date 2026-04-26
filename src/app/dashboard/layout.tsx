import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { getAuthenticatedUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthenticatedUser();
  const isDemoMode = !auth;

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#FAF9F7" }}>
      <Sidebar
        firmName={auth?.firmName ?? "Demo CA Firm"}
        userName={auth?.partnerName || auth?.email || "Admin User"}
        userRole={auth?.role ?? "partner"}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <Topbar today={today} isDemoMode={isDemoMode} />
        <main style={{ flex: 1, overflowY: "auto" }} className="custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
