/**
 * Liability Report PDF Generator
 * Uses @react-pdf/renderer to produce a court-admissible PDF.
 *
 * Legal basis: Section 65B of the Indian Evidence Act, 1872
 * Format: ICAI-aligned professional document with firm letterhead,
 * audit trail, and legal disclaimer.
 */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { AuditLog, Client, ComplianceTask } from "@/types";
import { formatComplianceType } from "@/lib/utils";

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#1a1a1a",
    backgroundColor: "#ffffff",
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 48,
  },

  // Header
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#1d4ed8",
    paddingBottom: 12,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  firmName: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#1d4ed8" },
  firmSub: { fontSize: 8, color: "#6b7280", marginTop: 2 },
  reportTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#111827", textAlign: "right" },
  reportMeta: { fontSize: 8, color: "#6b7280", textAlign: "right", marginTop: 2 },

  // Section
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 4,
    marginBottom: 8,
  },

  // Info grid
  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  infoItem: { width: "30%", marginBottom: 6 },
  infoLabel: { fontSize: 7, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  infoValue: { fontSize: 9, color: "#111827", fontFamily: "Helvetica-Bold" },

  // Stats row
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  statBox: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    padding: 10,
    alignItems: "center",
  },
  statNum: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#1d4ed8" },
  statLabel: { fontSize: 7, color: "#6b7280", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 },

  // Table
  table: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 4, overflow: "hidden" },
  tableHeader: { flexDirection: "row", backgroundColor: "#f9fafb", borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  tableRowLast: { flexDirection: "row" },
  th: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, padding: 6 },
  td: { fontSize: 8, color: "#374151", padding: 6 },

  // Timeline
  timelineItem: {
    flexDirection: "row",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    flexShrink: 0,
  },
  timelineDotText: { fontSize: 8, color: "#1d4ed8" },
  timelineContent: { flex: 1 },
  timelineAction: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#1d4ed8" },
  timelineMeta: { fontSize: 7, color: "#6b7280", marginTop: 1 },
  timelineTime: { fontSize: 7, color: "#9ca3af", textAlign: "right", flexShrink: 0 },

  // Conclusion
  conclusionBox: {
    backgroundColor: "#1e293b",
    borderRadius: 6,
    padding: 14,
    marginBottom: 16,
  },
  conclusionTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#f1f5f9", marginBottom: 6 },
  conclusionText: { fontSize: 8, color: "#94a3b8", lineHeight: 1.6 },
  conclusionHighlight: { color: "#f1f5f9", fontFamily: "Helvetica-Bold" },

  // Disclaimer
  disclaimerBox: {
    backgroundColor: "#fefce8",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 4,
    padding: 10,
    marginBottom: 16,
  },
  disclaimerTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#92400e", marginBottom: 4 },
  disclaimerText: { fontSize: 7, color: "#78350f", lineHeight: 1.5 },

  // Footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 7, color: "#9ca3af" },

  // Badge
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
  },
});

// ── Action labels ─────────────────────────────────────────────
const ACTION_LABELS: Record<string, { label: string; icon: string }> = {
  reminder_sent:  { label: "Reminder Sent",       icon: "→" },
  delivered:      { label: "Delivered",            icon: "✓" },
  opened:         { label: "Opened by Client",     icon: "👁" },
  doc_uploaded:   { label: "Documents Uploaded",   icon: "↑" },
  filed:          { label: "Return Filed",         icon: "✓" },
  escalated:      { label: "Escalated",            icon: "!" },
  reminder_failed:{ label: "Reminder Failed",      icon: "✗" },
  task_created:   { label: "Task Created",         icon: "+" },
};

// ── Props ─────────────────────────────────────────────────────
interface LiabilityReportProps {
  client: Client;
  tasks: ComplianceTask[];
  logs: AuditLog[];
  firmName: string;
  firmEmail: string;
  generatedAt: string; // ISO string
}

// ── Document ──────────────────────────────────────────────────
export function LiabilityReportDocument({
  client,
  tasks,
  logs,
  firmName,
  firmEmail,
  generatedAt,
}: LiabilityReportProps) {
  const sent     = logs.filter(l => l.action === "reminder_sent").length;
  const opened   = logs.filter(l => l.action === "opened").length;
  const uploaded = logs.filter(l => l.action === "doc_uploaded").length;
  const filed    = logs.filter(l => l.action === "filed").length;

  const generatedDate = new Date(generatedAt).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const firstLog = logs[0];
  const lastLog  = logs[logs.length - 1];

  return (
    <Document
      title={`Liability Report — ${client.name}`}
      author={firmName}
      subject="CA Compliance Liability Report — Section 65B Evidence"
      creator="DeadlineShield"
    >
      <Page size="A4" style={styles.page}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.firmName}>{firmName}</Text>
              <Text style={styles.firmSub}>Chartered Accountants · {firmEmail}</Text>
            </View>
            <View>
              <Text style={styles.reportTitle}>COMPLIANCE LIABILITY REPORT</Text>
              <Text style={styles.reportMeta}>Generated: {generatedDate} IST</Text>
              <Text style={styles.reportMeta}>Ref: DSR-{client.id.slice(0, 8).toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* ── Legal notice ── */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerTitle}>⚖️ Court-Admissible Electronic Evidence — Section 65B, Indian Evidence Act 1872</Text>
          <Text style={styles.disclaimerText}>
            This report is generated from an immutable, append-only audit log maintained by {firmName} using DeadlineShield.
            All timestamps are in Indian Standard Time (IST). This document constitutes electronic evidence under Section 65B
            of the Indian Evidence Act, 1872, and may be presented in ICAI disciplinary proceedings, consumer court, or civil disputes.
            The CA firm&apos;s advisory duty was fulfilled as evidenced by the communication log below.
          </Text>
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          {[
            { n: sent,     label: "Reminders Sent"  },
            { n: opened,   label: "Client Opens"    },
            { n: uploaded, label: "Docs Uploaded"   },
            { n: filed,    label: "Returns Filed"   },
          ].map(s => (
            <View key={s.label} style={styles.statBox}>
              <Text style={styles.statNum}>{s.n}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Client info ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Information</Text>
          <View style={styles.infoGrid}>
            {[
              { label: "Business Name",  value: client.name },
              { label: "PAN",            value: client.pan ?? "—" },
              { label: "GSTIN",          value: client.gstin ?? "—" },
              { label: "Contact Person", value: client.contact_name ?? "—" },
              { label: "Email",          value: client.email ?? "—" },
              { label: "Phone",          value: client.phone ?? "—" },
            ].map(({ label, value }) => (
              <View key={label} style={styles.infoItem}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Tasks ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compliance Tasks ({tasks.length})</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 2 }]}>Compliance</Text>
              <Text style={[styles.th, { flex: 1 }]}>Period</Text>
              <Text style={[styles.th, { flex: 1 }]}>Due Date</Text>
              <Text style={[styles.th, { flex: 1 }]}>Status</Text>
            </View>
            {tasks.map((t, i) => (
              <View key={t.id} style={i < tasks.length - 1 ? styles.tableRow : styles.tableRowLast}>
                <Text style={[styles.td, { flex: 2 }]}>{formatComplianceType(t.compliance_type)}</Text>
                <Text style={[styles.td, { flex: 1 }]}>{t.period}</Text>
                <Text style={[styles.td, { flex: 1 }]}>{t.due_date}</Text>
                <Text style={[styles.td, { flex: 1 }]}>{t.status.replace(/_/g, " ")}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Audit trail ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Communication Audit Trail ({logs.length} events · Immutable)</Text>
          {logs.length === 0 ? (
            <Text style={{ fontSize: 8, color: "#9ca3af" }}>No communication logged yet.</Text>
          ) : (
            logs.map((log, i) => {
              const cfg = ACTION_LABELS[log.action] ?? { label: log.action, icon: "•" };
              const meta = log.metadata as Record<string, unknown> | null;
              const ts = new Date(log.timestamp).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                day: "numeric", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              });
              return (
                <View key={log.id} style={[styles.timelineItem, i === logs.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                  <View style={styles.timelineDot}>
                    <Text style={styles.timelineDotText}>{cfg.icon}</Text>
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineAction}>{cfg.label}</Text>
                    <Text style={styles.timelineMeta}>
                      {log.channel ? `via ${log.channel}` : "System"}
                      {log.message_id ? ` · Ref: ${log.message_id}` : ""}
                      {meta?.cadence ? ` · Cadence: ${meta.cadence}` : ""}
                    </Text>
                  </View>
                  <Text style={styles.timelineTime}>{ts} IST</Text>
                </View>
              );
            })
          )}
        </View>

        {/* ── Legal conclusion ── */}
        {logs.length > 0 && (
          <View style={styles.conclusionBox}>
            <Text style={styles.conclusionTitle}>🛡️ Legal Conclusion — Advisory Duty Fulfilled</Text>
            <Text style={styles.conclusionText}>
              Based on the immutable audit trail above,{" "}
              <Text style={styles.conclusionHighlight}>{sent} reminder{sent !== 1 ? "s were" : " was"} sent</Text>
              {" "}to{" "}
              <Text style={styles.conclusionHighlight}>{client.name}</Text>
              {firstLog && lastLog ? (
                <Text>
                  {" "}between{" "}
                  <Text style={styles.conclusionHighlight}>
                    {new Date(firstLog.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
                  </Text>
                  {" "}and{" "}
                  <Text style={styles.conclusionHighlight}>
                    {new Date(lastLog.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </Text>.
                </Text>
              ) : "."}
              {uploaded > 0
                ? ` Client uploaded ${uploaded} document${uploaded !== 1 ? "s" : ""}.`
                : " Client has not uploaded any documents as of this report date."}
              {" "}
              <Text style={styles.conclusionHighlight}>
                Any penalties or late fees incurred are attributable to client delay in providing required documents,
                not to any negligence or omission by {firmName}.
              </Text>
              {" "}This report may be submitted to ICAI Disciplinary Directorate, consumer courts, or civil tribunals
              as evidence of due diligence under the Chartered Accountants Act, 1949.
            </Text>
          </View>
        )}

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {firmName} · Generated by DeadlineShield · {generatedDate} IST
          </Text>
          <Text style={styles.footerText}>
            Ref: DSR-{client.id.slice(0, 8).toUpperCase()} · Section 65B Evidence Act
          </Text>
        </View>

      </Page>
    </Document>
  );
}
