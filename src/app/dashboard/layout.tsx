import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  ShieldCheck,
  Settings,
  Bell,
  ChevronRight,
  Zap,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/clients", icon: Users, label: "Clients" },
  { href: "/dashboard/tasks", icon: ClipboardList, label: "Tasks" },
  { href: "/dashboard/reports", icon: ShieldCheck, label: "Liability Reports" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* ── Sidebar ── */}
      <aside className="w-60 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <ShieldCheck size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-none">ComplianceShield</p>
              <p className="text-[10px] text-slate-400 mt-0.5">CA Practice Platform</p>
            </div>
          </div>
        </div>

        {/* Firm badge */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="bg-indigo-50 rounded-lg px-3 py-2">
            <p className="text-[10px] text-indigo-400 font-medium uppercase tracking-wide">Active Firm</p>
            <p className="text-xs font-semibold text-indigo-700 mt-0.5">Demo CA Firm</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors group"
            >
              <Icon size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
              <span className="font-medium">{label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-slate-100 space-y-0.5">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors group"
          >
            <Settings size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
            <span className="font-medium">Settings</span>
          </Link>
          {/* Portal health indicator */}
          <div className="mt-3 px-3 py-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium text-emerald-700">GST Portal: Stable</span>
            </div>
            <p className="text-[10px] text-emerald-500 mt-0.5">Safe to file now</p>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span>ComplianceShield</span>
            <ChevronRight size={12} />
            <span className="text-slate-600 font-medium">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
              <Zap size={11} className="text-amber-500" />
              <span className="text-[11px] font-medium text-amber-700">Demo Mode</span>
            </div>
            <button className="relative w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
              <Bell size={15} className="text-slate-500" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">CA</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
