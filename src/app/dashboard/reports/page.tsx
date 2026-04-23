import { getClients, getAllTasks } from "@/lib/data";
import { getRiskLevel } from "@/lib/utils";
import Link from "next/link";
import { Shield, ArrowRight, Download } from "lucide-react";

export default async function ReportsPage() {
  const [clients, tasks] = await Promise.all([getClients(), getAllTasks()]);

  const tasksByClient = tasks.reduce<Record<string, typeof tasks>>((acc, t) => {
    if (!acc[t.client_id]) acc[t.client_id] = [];
    acc[t.client_id].push(t);
    return acc;
  }, {});

  const enriched = clients.map((c) => {
    const all = tasksByClient[c.id] ?? [];
    const active = all.filter((t) => t.status !== "filed");
    const reminderCount = 0; // would come from audit_log in real mode
    return { ...c, riskLevel: getRiskLevel(active), taskCount: all.length, reminderCount };
  });

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Liability Reports</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Court-admissible proof of every client communication
        </p>
      </div>

      {/* What is this */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 flex gap-4">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-indigo-900">Your Legal Shield</h3>
          <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
            When a client blames you for a penalty, generate this report instantly. It shows every reminder sent,
            delivered, and opened — plus when documents were uploaded and returns were filed.
            Timestamped, immutable, and ready for ICAI proceedings.
          </p>
        </div>
      </div>

      {/* Client list */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Select Client</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {enriched.map((client) => {
            const riskDot = { red: "bg-red-500", yellow: "bg-amber-400", green: "bg-emerald-500" }[client.riskLevel];
            return (
              <div key={client.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-indigo-600">{client.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">{client.name}</p>
                      <span className={`w-1.5 h-1.5 rounded-full ${riskDot}`} />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {client.pan ?? "No PAN"} · {client.taskCount} tasks
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/api/reports/${client.id}/pdf`}
                    className="flex items-center gap-1.5 border border-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
                  >
                    <Download size={12} />
                    PDF
                  </Link>
                  <Link
                    href={`/dashboard/reports/${client.id}`}
                    className="flex items-center gap-1.5 bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition"
                  >
                    View Report
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
