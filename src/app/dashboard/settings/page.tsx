import { getAuthenticatedUser } from "@/lib/auth";
import { getComplianceCalendar } from "@/lib/data";
import { MasterCalendar } from "./MasterCalendar";

export default async function SettingsPage() {
  const calendar = await getComplianceCalendar();

  const integrations = [
    { name: "Supabase",       env: "NEXT_PUBLIC_SUPABASE_URL",  docs: "https://supabase.com/docs",                          required: true  },
    { name: "Resend (Email)", env: "RESEND_API_KEY",            docs: "https://resend.com/docs",                            required: true  },
    { name: "WhatsApp",       env: "WHATSAPP_WEBHOOK_URL",      docs: "https://developers.facebook.com/docs/whatsapp",      required: false },
    { name: "Cron Secret",    env: "CRON_SECRET",               docs: "https://vercel.com/docs/cron-jobs",                  required: true  },
  ];

  const cadences = [
    { key: "T-7", desc: "7 days before — first reminder + magic link" },
    { key: "T-3", desc: "3 days before — urgent warning + magic link" },
    { key: "T-1", desc: "1 day before — final notice + magic link"    },
  ];

  return (
    <div style={{ maxWidth: 800, padding: "40px 40px 48px" }}>
      <div style={{ marginBottom: 40 }}>
        <h1
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontWeight: 400,
            fontSize: 32,
            color: "#1A1A1A",
            letterSpacing: "-0.03em",
            marginBottom: 6,
          }}
        >
          Settings
        </h1>
        <p style={{ fontSize: 13, color: "#9B9B9B" }}>
          Global calendars, integrations, and reminder cadences.
        </p>
      </div>

      {/* Universal Master Calendar */}
      <MasterCalendar calendar={calendar} />

      {/* Integrations */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #E5E2DB",
          borderRadius: 16,
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          overflow: "hidden",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            padding: "16px 22px",
            borderBottom: "1px solid #EDEBE6",
            fontSize: 13,
            fontWeight: 600,
            color: "#1A1A1A",
            background: "#FAFAF8",
          }}
        >
          Integrations
        </div>
        {integrations.map((item, i) => (
          <div
            key={item.name}
            style={{
              padding: "14px 22px",
              borderBottom: i < integrations.length - 1 ? "1px solid #EDEBE6" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A" }}>{item.name}</span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 100,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.06em",
                    ...(item.required
                      ? { background: "#FFEBE6", color: "#DE350B", border: "1px solid #FFBDAD" }
                      : { background: "#F3F1EC", color: "#9B9B9B", border: "1px solid #E5E2DB" }),
                  }}
                >
                  {item.required ? "Required" : "Optional"}
                </span>
              </div>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "#9B9B9B" }}>{item.env}</div>
            </div>
            <a
              href={item.docs}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "6px 12px",
                borderRadius: 8,
                background: "#EDF0FF",
                color: "#2D5BFF",
                border: "1px solid #C0CCFF",
                textDecoration: "none",
              }}
            >
              Docs →
            </a>
          </div>
        ))}
      </div>

      {/* Cadence */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #E5E2DB",
          borderRadius: 16,
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 22px",
            borderBottom: "1px solid #EDEBE6",
            fontSize: 13,
            fontWeight: 600,
            color: "#1A1A1A",
            background: "#FAFAF8",
          }}
        >
          Reminder Cadence
        </div>
        {cadences.map((c, i) => (
          <div
            key={c.key}
            style={{
              padding: "14px 22px",
              borderBottom: i < cadences.length - 1 ? "1px solid #EDEBE6" : "none",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "monospace",
                padding: "4px 10px",
                borderRadius: 7,
                background: "#EDF0FF",
                color: "#2D5BFF",
              }}
            >
              {c.key}
            </span>
            <span style={{ fontSize: 13, color: "#6B6B6B" }}>{c.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
