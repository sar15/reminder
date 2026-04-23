import Link from "next/link";
import { Shield, Users, LayoutDashboard, FileText, Settings } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Shield className="text-indigo-600" size={20} />
            <span className="font-bold text-gray-900 text-sm">CA Shield</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <NavItem href="/dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" />
          <NavItem href="/dashboard/clients" icon={<Users size={16} />} label="Clients" />
          <NavItem href="/dashboard/tasks" icon={<FileText size={16} />} label="Tasks" />
          <NavItem href="/dashboard/reports" icon={<Shield size={16} />} label="Liability Reports" />
        </nav>

        <div className="p-3 border-t border-gray-200">
          <NavItem href="/dashboard/settings" icon={<Settings size={16} />} label="Settings" />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
    >
      {icon}
      {label}
    </Link>
  );
}
