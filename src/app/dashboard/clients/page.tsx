import { getClients, getAllTasks } from "@/lib/data";
import { getRiskLevel, formatComplianceType } from "@/lib/utils";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";

export default async function ClientsPage() {
  const [clients, tasks] = await Promise.all([getClients(), getAllTasks()]);

  const byClient = tasks.reduce<Record<string, typeof tasks>>((a, t) => {
    (a[t.client_id] ??= []).push(t); return a;
  }, {});

  const enriched = clients.map((c) => {
    const all    = byClient[c.id] ?? [];
    const active = all.filter((t) => t.status !== "filed");
    return { ...c, risk: getRiskLevel(active), activeCount: active.length };
  });

  const RISK = {
    red:    { dot: "#DC2626", label: "Critical",     bg: "#FEF2F2", text: "#991B1B" },
    yellow: { dot: "#D97706", label: "Awaiting",     bg: "#FFFBEB", text: "#92400E" },
    green:  { dot: "#059669", label: "On Track",     bg: "#ECFDF5", text: "#065F46" },
  };

  return (
    <div className="p-7 max-w-[1080px]">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-[20px] font-semibold text-[#1C1917] tracking-tight">Clients</h1>
          <p className="text-[13px] text-[#A8A29E] mt-0.5">{clients.length} active clients</p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6D28D9] text-white text-[13px] font-medium hover:bg-[#5B21B6] shadow-[0_1px_2px_rgba(109,40,217,0.25)] transition-colors"
        >
          <Plus size={14} />
          Add Client
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-[#E8E6E3] shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F0EFED]">
              {["Client", "PAN / GSTIN", "Compliances", "Risk", "Tasks", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider bg-[#FAFAF9]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {enriched.map((c, i) => {
              const r = RISK[c.risk];
              return (
                <tr
                  key={c.id}
                  className="border-b border-[#F5F5F4] last:border-0 hover:bg-[#FAFAF9] transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] flex items-center justify-center text-[12px] font-bold text-[#6D28D9] flex-shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#1C1917]">{c.name}</p>
                        {c.contact_name && <p className="text-[11px] text-[#A8A29E]">{c.contact_name}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-[12px] font-mono text-[#57534E]">{c.pan ?? "—"}</p>
                    <p className="text-[11px] font-mono text-[#A8A29E] mt-0.5">{c.gstin ?? "—"}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {c.compliance_types.slice(0, 3).map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-md bg-[#F5F5F4] text-[#57534E] text-[10px] font-medium">
                          {formatComplianceType(t)}
                        </span>
                      ))}
                      {c.compliance_types.length > 3 && (
                        <span className="text-[11px] text-[#A8A29E] self-center">+{c.compliance_types.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium" style={{ background: r.bg, color: r.text }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.dot }} />
                      {r.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[12px] text-[#A8A29E]">{c.activeCount} active</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/dashboard/clients/${c.id}`} className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#6D28D9] hover:text-[#5B21B6] transition-colors">
                      View <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
