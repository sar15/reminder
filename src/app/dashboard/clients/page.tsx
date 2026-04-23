import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatComplianceType } from "@/lib/utils";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("name");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 text-sm mt-1">{clients?.length ?? 0} clients</p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          <Plus size={16} />
          Add Client
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Name</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">PAN</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">GSTIN</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Compliances</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients?.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{client.name}</td>
                <td className="px-4 py-3 text-gray-500">{client.pan ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{client.gstin ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(client.compliance_types as string[]).slice(0, 3).map((t) => (
                      <span key={t} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded">
                        {formatComplianceType(t)}
                      </span>
                    ))}
                    {client.compliance_types.length > 3 && (
                      <span className="text-gray-400 text-xs">+{client.compliance_types.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/clients/${client.id}`} className="text-indigo-600 hover:underline text-xs">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
            {(!clients || clients.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No clients yet. <Link href="/dashboard/clients/new" className="text-indigo-600 hover:underline">Add one →</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
