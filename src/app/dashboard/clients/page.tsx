import { getClients, getAllTasks } from "@/lib/data";
import { getRiskLevel, formatComplianceType } from "@/lib/utils";
import Link from "next/link";
import { Plus, Search, ArrowRight } from "lucide-react";

export default async function ClientsPage() {
  const [clients, tasks] = await Promise.all([getClients(), getAllTasks()]);

  const tasksByClient = tasks.reduce<Record<string, typeof tasks>>((acc, t) => {
    if (!acc[t.client_id]) acc[t.client_id] = [];
    acc[t.client_id].push(t);
    return acc;
  }, {});

  const enriched = clients.map((c) => {
    const all = tasksByClient[c.id] ?? [];
    const active = all.filter((t) => t.status !== "filed");
    return { ...c, riskLevel: getRiskLevel(active), activeCount: active.length };
  });

  const riskDot = {
    red: "bg-red-500",
    yellow: "bg-amber-400",
    green: "bg-emerald-500",
  };

  const riskBadge = {
    red: "bg-red-50 text-red-700 border-red-200",
    yellow: "bg-amber-50 text-amber-700 border-amber-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <div className="p-6 space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Clients</h1>
          <p className="text-sm text-slate-500 mt-0.5">{clients.length} active clients</p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          <Plus size={15} />
          Add Client
        </Link>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search clients by name, PAN, or GSTIN..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          readOnly
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Client</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">PAN / GSTIN</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Compliances</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Risk</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tasks</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {enriched.map((client) => (
              <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-indigo-600">
                        {client.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{client.name}</p>
                      {client.contact_name && (
                        <p className="text-xs text-slate-400">{client.contact_name}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="text-xs font-mono text-slate-600">{client.pan ?? "—"}</p>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">{client.gstin ?? "—"}</p>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {client.compliance_types.slice(0, 3).map((t) => (
                      <span key={t} className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-md">
                        {formatComplianceType(t)}
                      </span>
                    ))}
                    {client.compliance_types.length > 3 && (
                      <span className="text-[10px] text-slate-400 px-1">
                        +{client.compliance_types.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${riskDot[client.riskLevel]}`} />
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${riskBadge[client.riskLevel]}`}>
                      {client.riskLevel === "red" ? "Critical" : client.riskLevel === "yellow" ? "Waiting" : "On Track"}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs text-slate-500">{client.activeCount} active</span>
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={`/dashboard/clients/${client.id}`}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition"
                  >
                    View <ArrowRight size={12} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
