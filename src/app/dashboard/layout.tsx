import Link from "next/link";
import {
  LayoutDashboard, Users, ListChecks,
  FileText, Settings, Shield,
  Activity,
} from "lucide-react";

const NAV = [
  { href: "/dashboard",         icon: LayoutDashboard, label: "Dashboard"         },
  { href: "/dashboard/clients", icon: Users,           label: "Clients"           },
  { href: "/dashboard/tasks",   icon: ListChecks,      label: "Tasks"             },
  { href: "/dashboard/reports", icon: FileText,        label: "Liability Reports" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAF9]">

      {/* ─── Sidebar ─── */}
      <aside className="w-[220px] flex-shrink-0 flex flex-col bg-white border-r border-[#E8E6E3]">

        {/* Logo mark */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#6D28D9] flex items-center justify-center flex-shrink-0">
              <Shield size={13} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-[13px] font-semibold text-[#1C1917] tracking-tight">
                DeadlineShield
              </span>
            </div>
          </div>
        </div>

        {/* Firm pill */}
        <div className="px-3 pb-3">
          <div className="px-3 py-2 rounded-lg bg-[#F5F5F4]">
            <p className="text-[10px] font-medium text-[#A8A29E] uppercase tracking-wider">Firm</p>
            <p className="text-[12px] font-semibold text-[#1C1917] mt-0.5">Demo CA Firm</p>
          </div>
        </div>

        <div className="h-px bg-[#F0EFED] mx-3" />

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          <p className="px-3 pt-1 pb-2 text-[10px] font-semibold text-[#A8A29E] uppercase tracking-wider">
            Workspace
          </p>
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-[#57534E] hover:bg-[#F5F5F4] hover:text-[#1C1917] group transition-colors"
            >
              <Icon size={14} className="text-[#A8A29E] group-hover:text-[#6D28D9] transition-colors flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2 pb-4 space-y-1">
          {/* Portal health */}
          <PortalHealth />

          <div className="h-px bg-[#F0EFED] mx-1 my-2" />

          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-[#57534E] hover:bg-[#F5F5F4] hover:text-[#1C1917] group transition-colors"
          >
            <Settings size={14} className="text-[#A8A29E] group-hover:text-[#6D28D9] transition-colors" />
            Settings
          </Link>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-12 bg-white border-b border-[#E8E6E3] flex items-center justify-between px-6 flex-shrink-0">
          <p className="text-[12px] text-[#A8A29E]">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long", day: "numeric", month: "long", year: "numeric",
            })}
          </p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[11px] font-medium text-[#92400E]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
              Demo Mode
            </span>
            <div className="w-7 h-7 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[11px] font-bold text-[#6D28D9]">
              CA
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function PortalHealth() {
  const day = new Date().getDate();
  const isWarning = day >= 18 && day <= 22;

  return (
    <div className={`mx-1 px-3 py-2.5 rounded-lg border ${
      isWarning
        ? "bg-[#FFFBEB] border-[#FDE68A]"
        : "bg-[#ECFDF5] border-[#A7F3D0]"
    }`}>
      <div className="flex items-center gap-2">
        <Activity size={11} className={isWarning ? "text-[#D97706]" : "text-[#059669]"} />
        <span className={`text-[11px] font-semibold ${isWarning ? "text-[#92400E]" : "text-[#065F46]"}`}>
          GST Portal: {isWarning ? "Slow" : "Stable"}
        </span>
      </div>
      <p className={`text-[10px] mt-0.5 pl-[18px] ${isWarning ? "text-[#D97706]" : "text-[#059669]"}`}>
        {isWarning ? "File within 6 hours" : "Safe to file now"}
      </p>
    </div>
  );
}
