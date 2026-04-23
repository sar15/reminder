export default function SettingsPage() {
  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Firm profile and integrations</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Integrations</h2>
        <div className="space-y-3 text-sm">
          <IntegrationRow
            name="Resend (Email)"
            description="Personalized 1-to-1 email reminders with delivery tracking"
            status="Configure in .env.local → RESEND_API_KEY"
            docsUrl="https://resend.com/docs"
          />
          <IntegrationRow
            name="WhatsApp Business API"
            description="WhatsApp reminders via Cleomitra or Interakt (Rs.999/mo)"
            status="Add after first paying customer"
            docsUrl="https://developers.facebook.com/docs/whatsapp"
          />
          <IntegrationRow
            name="Supabase"
            description="Database, auth, file storage"
            status="Configure in .env.local → NEXT_PUBLIC_SUPABASE_URL"
            docsUrl="https://supabase.com/docs"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="font-semibold text-gray-800">Reminder Cadence</h2>
        <p className="text-sm text-gray-500">Industry-standard cadence (customizable per firm):</p>
        <div className="space-y-2 text-sm">
          {[
            { cadence: "T-10", desc: "First gentle reminder — request documents" },
            { cadence: "T-7", desc: "Formal reminder with document checklist" },
            { cadence: "T-3", desc: "Firm reminder with consequence language" },
            { cadence: "T-1", desc: "Final warning — escalation notice" },
            { cadence: "T-0", desc: "Due day alert at 9 AM" },
            { cadence: "T+1", desc: "Overdue notice" },
            { cadence: "T+3", desc: "Second overdue notice — partner escalation" },
          ].map(({ cadence, desc }) => (
            <div key={cadence} className="flex items-center gap-3">
              <span className="w-12 text-xs font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-center">
                {cadence}
              </span>
              <span className="text-gray-600">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IntegrationRow({
  name,
  description,
  status,
  docsUrl,
}: {
  name: string;
  description: string;
  status: string;
  docsUrl: string;
}) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="font-medium text-gray-800">{name}</p>
        <p className="text-gray-500 text-xs mt-0.5">{description}</p>
        <p className="text-gray-400 text-xs mt-0.5 font-mono">{status}</p>
      </div>
      <a
        href={docsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-indigo-600 hover:underline flex-shrink-0 ml-4"
      >
        Docs →
      </a>
    </div>
  );
}
