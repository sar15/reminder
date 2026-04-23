import { getClients } from "@/lib/data";
import Link from "next/link";
import { FileText } from "lucide-react";

export default async function ReportsPage() {
  const clients = await getClients();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Liability Reports</h1>
        <p className="text-gray-500 text-sm mt-1">
          Court-admissible proof of every reminder sent to your clients.
        </p>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-800">
        <strong>What is a Liability Report?</strong> A timestamped PDF showing every reminder sent,
        delivered, and acknowledged — plus when documents were uploaded and the return was filed.
        Use it to defend against client penalty claims and ICAI complaints.
      </div>

      <div className="grid gap-3">
        {clients.map((client) => (
          <div key={client.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-indigo-600" />
              <div>
                <p className="font-medium text-gray-900">{client.name}</p>
                {client.pan && <p className="text-xs text-gray-500">PAN: {client.pan}</p>}
              </div>
            </div>
            <Link
              href={`/dashboard/reports/${client.id}`}
              className="bg-indigo-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Generate Report
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
