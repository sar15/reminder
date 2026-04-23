"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatComplianceType } from "@/lib/utils";
import { MOCK_CLIENTS, MOCK_TASKS } from "@/lib/mock-data";
import Link from "next/link";

const CADENCES = [
  { key: "T-15", label: "T-15", desc: "First gentle nudge",    tone: "Friendly",  color: "#6b7280" },
  { key: "T-10", label: "T-10", desc: "Document checklist",    tone: "Informative",color: "#2563eb" },
  { key: "T-7",  label: "T-7",  desc: "Formal reminder",       tone: "Firm",       color: "#4f46e5" },
  { key: "T-3",  label: "T-3",  desc: "Urgent warning",        tone: "Urgent",     color: "#d97706" },
  { key: "T-1",  label: "T-1",  desc: "Final notice",          tone: "Critical",   color: "#dc2626" },
  { key: "T+1",  label: "T+1",  desc: "Overdue notice",        tone: "Overdue",    color: "#7f1d1d" },
];

const PREVIEW_BODY: Record<string, string> = {
  "T-15": "This is a friendly reminder that your compliance filing is due in 15 days. Please start gathering the required documents at your earliest convenience.",
  "T-10": "Your compliance filing is due in 10 days. Please upload the required documents: Bank Statement, Sales Register, Purchase Register, and Expense Invoices.",
  "T-7":  "Your filing deadline is in 7 days. We have not yet received your documents. Please upload them immediately to avoid any delays.",
  "T-3":  "URGENT: Your filing deadline is in 3 days. Documents have not been received. Failure to upload by tomorrow may result in late fees and penalties.",
  "T-1":  "FINAL NOTICE: Your filing is due TOMORROW. If documents are not received today, we cannot guarantee timely filing. Penalties will apply.",
  "T+1":  "Your filing deadline has passed. Penalties are now accruing daily. Please upload documents immediately and contact us to discuss next steps.",
};

export default function RemindPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const router = useRouter();

  const [client, setClient] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [cadence, setCadence] = useState("T-3");
  const [email, setEmail] = useState(true);
  const [whatsapp, setWhatsapp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const c = MOCK_CLIENTS.find((x) => x.id === clientId);
    const t = MOCK_TASKS.filter((x) => x.client_id === clientId && x.status !== "filed");
    setClient(c ?? null);
    setTasks(t);
    if (t.length > 0) setSelectedTask(t[0].id);
  }, [clientId]);

  const selectedTaskData = tasks.find((t) => t.id === selectedTask);
  const selectedCadence = CADENCES.find((c) => c.key === cadence)!;

  async function handleSend() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setSent(true);
    setLoading(false);
  }

  if (!client) return (
    <div style={{ padding: 28, display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
      <div style={{ fontSize: 13, color: "#9ca3af" }}>Loading...</div>
    </div>
  );

  if (sent) return (
    <div style={{ padding: 28, maxWidth: 520, margin: "60px auto", textAlign: "center" }}>
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px", fontSize: 28,
      }}>✅</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Reminder Sent</h2>
      <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>
        Personalized {cadence} reminder sent to <strong>{client.email}</strong>
      </p>
      <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, textAlign: "left", marginBottom: 24 }}>
        {[
          "✅ Logged in immutable audit trail with IST timestamp",
          "✅ Message ID recorded for delivery proof",
          "✅ Task status updated to Waiting Docs",
          "✅ Liability Report updated automatically",
        ].map((item) => (
          <div key={item} style={{ fontSize: 12, color: "#374151", marginBottom: 8 }}>{item}</div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button onClick={() => setSent(false)} style={{
          border: "1px solid #e5e7eb", background: "#fff",
          borderRadius: 8, padding: "9px 18px", fontSize: 13, cursor: "pointer", color: "#374151",
        }}>
          Send Another
        </button>
        <Link href={`/dashboard/clients/${clientId}`} style={{
          background: "#4f46e5", color: "#fff",
          borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, textDecoration: "none",
        }}>
          Back to Client
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ padding: 28, maxWidth: 1000 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href={`/dashboard/clients/${clientId}`} style={{
          width: 32, height: 32, borderRadius: 8,
          background: "#fff", border: "1px solid #e5e7eb",
          display: "flex", alignItems: "center", justifyContent: "center",
          textDecoration: "none", fontSize: 16, color: "#374151",
        }}>←</Link>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Send Reminder</h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{client.name}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>

        {/* Left — config */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Task selector */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 14 }}>
              1. Select Compliance Task
            </div>
            {tasks.length === 0 ? (
              <p style={{ fontSize: 13, color: "#9ca3af" }}>No pending tasks for this client.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {tasks.map((task) => {
                  const days = Math.ceil((new Date(task.due_date).getTime() - Date.now()) / 86400000);
                  const isSelected = selectedTask === task.id;
                  return (
                    <label key={task.id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 14px", borderRadius: 8, cursor: "pointer",
                      border: `1px solid ${isSelected ? "#a5b4fc" : "#e5e7eb"}`,
                      background: isSelected ? "#f5f3ff" : "#fafafa",
                    }}>
                      <input
                        type="radio" name="task" value={task.id}
                        checked={isSelected}
                        onChange={() => setSelectedTask(task.id)}
                        style={{ accentColor: "#4f46e5" }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                          {formatComplianceType(task.compliance_type)}
                        </div>
                        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{task.period}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 12, color: "#374151" }}>{task.due_date}</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: days < 0 ? "#dc2626" : days <= 5 ? "#d97706" : "#9ca3af" }}>
                          {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cadence */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 14 }}>
              2. Choose Reminder Cadence
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {CADENCES.map((c) => {
                const isSelected = cadence === c.key;
                return (
                  <button key={c.key} type="button" onClick={() => setCadence(c.key)} style={{
                    padding: "10px 12px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                    border: `1px solid ${isSelected ? c.color : "#e5e7eb"}`,
                    background: isSelected ? c.color : "#fff",
                    color: isSelected ? "#fff" : "#374151",
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{c.label}</div>
                    <div style={{ fontSize: 10, marginTop: 2, opacity: isSelected ? 0.85 : 0.6 }}>{c.desc}</div>
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 10 }}>
              T-3 = 3 days before due · T-1 = Final warning · T+1 = Overdue notice
            </div>
          </div>

          {/* Channels */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 14 }}>
              3. Send Via
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { key: "email", icon: "📧", label: "Email", sub: client.email ?? "No email", active: email, toggle: () => setEmail(!email) },
                { key: "whatsapp", icon: "💬", label: "WhatsApp", sub: client.phone ?? "No phone", active: whatsapp, toggle: () => setWhatsapp(!whatsapp), disabled: !client.phone },
              ].map((ch) => (
                <button key={ch.key} type="button" onClick={ch.toggle} disabled={ch.disabled} style={{
                  flex: 1, padding: "12px 14px", borderRadius: 8, cursor: ch.disabled ? "not-allowed" : "pointer",
                  border: `1px solid ${ch.active ? "#a5b4fc" : "#e5e7eb"}`,
                  background: ch.active ? "#f5f3ff" : "#fafafa",
                  textAlign: "left", opacity: ch.disabled ? 0.4 : 1,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 16 }}>{ch.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{ch.label}</span>
                    {ch.active && <span style={{ marginLeft: "auto", fontSize: 11, color: "#4f46e5", fontWeight: 700 }}>✓</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{ch.sub}</div>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 12, padding: "10px 12px", background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
              <div style={{ fontSize: 11, color: "#166534" }}>
                🔒 <strong>1-to-1 only</strong> — This message is sent exclusively to {client.contact_name ?? client.name}. No CC, no BCC, no privacy breach.
              </div>
            </div>
          </div>
        </div>

        {/* Right — preview + send */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Preview */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ background: "#1e293b", padding: "12px 16px" }}>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Message Preview
              </div>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", marginBottom: 3 }}>TO</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{client.contact_name ?? client.name}</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>{client.email}</div>
              </div>
              <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", marginBottom: 3 }}>SUBJECT</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>
                  {cadence === "T+1" ? "⚠️ Overdue: " : cadence === "T-1" ? "🚨 Final Notice: " : "Action Required: "}
                  {selectedTaskData ? formatComplianceType(selectedTaskData.compliance_type) : "Compliance Reminder"}
                </div>
              </div>
              <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 12 }}>
                <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>BODY</div>
                <div style={{ background: "#f9fafb", borderRadius: 8, padding: 12, fontSize: 11, color: "#374151", lineHeight: 1.6 }}>
                  <p style={{ marginBottom: 8 }}>Dear {client.contact_name ?? client.name},</p>
                  <p style={{ marginBottom: 8 }}>{PREVIEW_BODY[cadence]}</p>
                  {selectedTaskData && (
                    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 10px", marginBottom: 8 }}>
                      <div><strong>Compliance:</strong> {formatComplianceType(selectedTaskData.compliance_type)}</div>
                      <div><strong>Due Date:</strong> {selectedTaskData.due_date}</div>
                      {client.pan && <div><strong>PAN:</strong> {client.pan}</div>}
                    </div>
                  )}
                  <p style={{ color: "#9ca3af", fontSize: 10 }}>
                    This is a confidential, personalized message sent only to you.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Audit note */}
          <div style={{ background: "#f5f3ff", border: "1px solid #e0e7ff", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#4338ca", marginBottom: 6 }}>🛡️ Audit Trail Protection</div>
            <div style={{ fontSize: 11, color: "#4f46e5", lineHeight: 1.5 }}>
              This send will be logged with timestamp, message ID, and delivery status in your immutable audit trail — usable as legal proof in ICAI proceedings.
            </div>
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={loading || !selectedTask || (!email && !whatsapp)}
            style={{
              background: loading ? "#a5b4fc" : "#4f46e5",
              color: "#fff", border: "none",
              borderRadius: 10, padding: "14px",
              fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading ? (
              <>
                <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Sending...
              </>
            ) : (
              `Send ${cadence} Reminder →`
            )}
          </button>

          {!client.email && !client.phone && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#991b1b" }}>
              ⚠️ No email or phone on file. Add contact details to send reminders.
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
