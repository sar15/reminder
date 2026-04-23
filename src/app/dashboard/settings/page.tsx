export default function SettingsPage() {
  const integrations = [
    {
      name: "Resend (Email)",
      icon: "📧",
      desc: "Personalized 1-to-1 transactional email with delivery tracking",
      status: "Configure RESEND_API_KEY in .env.local",
      docs: "https://resend.com/docs",
      free: "3,000 emails/month free",
    },
    {
      name: "WhatsApp Business API",
      icon: "💬",
      desc: "WhatsApp reminders via Cleomitra (Rs.999/mo) or Interakt (Rs.1,166/mo)",
      status: "Add after first paying customer",
      docs: "https://developers.facebook.com/docs/whatsapp",
      free: "Rs.0.115/message",
    },
    {
      name: "Supabase",
      icon: "🗄️",
      desc: "PostgreSQL database, magic link auth, file storage",
      status: "Configure NEXT_PUBLIC_SUPABASE_URL in .env.local",
      docs: "https://supabase.com/docs",
      free: "Free tier: 500MB DB, 1GB storage",
    },
  ];

  const cadences = [
    { key: "T-15", desc: "First gentle nudge — request documents",       color: "#6b7280" },
    { key: "T-10", desc: "Email + WhatsApp with document checklist",      color: "#2563eb" },
    { key: "T-7",  desc: "Firmer reminder — 'deadline approaching'",      color: "#4f46e5" },
    { key: "T-3",  desc: "Alert CA Partner — client ignored 3 reminders", color: "#d97706" },
    { key: "T-1",  desc: "Final notice — recommend phone call",           color: "#dc2626" },
    { key: "T+1",  desc: "Overdue notice — penalties accruing",           color: "#7f1d1d" },
    { key: "T+3",  desc: "Second overdue — partner escalation",           color: "#7f1d1d" },
  ];

  return (
    <div style={{ padding: 28, maxWidth: 760 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Settings</h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 3 }}>Integrations and configuration</p>
      </div>

      {/* Integrations */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f3f4f6" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Integrations</span>
        </div>
        {integrations.map((item, i) => (
          <div key={item.name} style={{
            padding: "16px 18px",
            borderBottom: i < integrations.length - 1 ? "1px solid #f3f4f6" : "none",
            display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16,
          }}>
            <div style={{ display: "flex", gap: 12 }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 3 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{item.desc}</div>
                <div style={{ fontSize: 11, fontFamily: "monospace", color: "#9ca3af" }}>{item.status}</div>
                <div style={{ fontSize: 11, color: "#059669", marginTop: 2 }}>{item.free}</div>
              </div>
            </div>
            <a href={item.docs} target="_blank" rel="noopener noreferrer" style={{
              fontSize: 12, fontWeight: 600, color: "#4f46e5", textDecoration: "none", flexShrink: 0,
            }}>
              Docs →
            </a>
          </div>
        ))}
      </div>

      {/* Reminder cadence */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Reminder Cadence</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Industry-standard escalation schedule</div>
        </div>
        <div style={{ padding: "8px 0" }}>
          {cadences.map((c, i) => (
            <div key={c.key} style={{
              padding: "10px 18px",
              borderBottom: i < cadences.length - 1 ? "1px solid #f9fafb" : "none",
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <span style={{
                width: 44, fontSize: 11, fontWeight: 700, fontFamily: "monospace",
                color: c.color, flexShrink: 0,
              }}>
                {c.key}
              </span>
              <span style={{ fontSize: 13, color: "#374151" }}>{c.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
