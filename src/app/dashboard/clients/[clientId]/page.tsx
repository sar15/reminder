import { getAuthenticatedUser } from "@/lib/auth";
import { getClient, getTasksForClient, getAuditLogsForClient } from "@/lib/data";
import { daysUntilDue, getPenaltyPerDay } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { TaskTable } from "@/components/client-detail/TaskTable";
import { AuditTimeline } from "@/components/client-detail/AuditTimeline";
import { FiledReturns } from "@/components/client-detail/FiledReturns";
import { PenaltyBanner } from "@/components/client-detail/PenaltyBanner";
import { ClientActions } from "@/components/client-detail/ClientActions";

export default async function ClientDetailPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const auth = await getAuthenticatedUser();
  const firmId = auth?.firmId;

  const [client, tasks, logs] = await Promise.all([
    getClient(clientId, firmId),
    getTasksForClient(clientId, firmId),
    getAuditLogsForClient(clientId, firmId),
  ]);

  if (!client) notFound();

  const active = tasks.filter(t => t.status !== "filed");
  const penalty = active
    .filter(t => daysUntilDue(t.due_date) < 0)
    .reduce((s, t) => s + getPenaltyPerDay(t.compliance_type) * Math.abs(daysUntilDue(t.due_date)), 0);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 40px 48px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 36, gap: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <Link
            href="/dashboard/clients"
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              border: "1px solid #E5E2DB",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9B9B9B",
              flexShrink: 0,
              marginTop: 4,
              transition: "all 0.15s",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={15} />
          </Link>
          <div>
            <h1
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontWeight: 400,
                fontSize: 28,
                color: "#1A1A1A",
                letterSpacing: "-0.03em",
                marginBottom: 8,
              }}
            >
              {client.name}
            </h1>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              {client.pan && (
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#6B6B6B",
                    background: "#F3F1EC",
                    border: "1px solid #E5E2DB",
                    borderRadius: 6,
                    padding: "3px 8px",
                  }}
                >
                  PAN: {client.pan}
                </span>
              )}
              {client.gstin && (
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#6B6B6B",
                    background: "#F3F1EC",
                    border: "1px solid #E5E2DB",
                    borderRadius: 6,
                    padding: "3px 8px",
                  }}
                >
                  GSTIN: {client.gstin}
                </span>
              )}
              {client.email && (
                <span style={{ fontSize: 12, color: "#9B9B9B" }}>{client.email}</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <a
            href={`/api/reports/${clientId}/pdf`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 16px",
              background: "#fff",
              border: "1px solid #E5E2DB",
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 600,
              color: "#6B6B6B",
              textDecoration: "none",
              transition: "all 0.15s",
            }}
          >
            <Download size={14} /> PDF Report
          </a>
          <ClientActions clientId={clientId} />
        </div>
      </div>

      <PenaltyBanner amount={penalty} />

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
        {/* Left — tasks */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <TaskTable tasks={tasks} />
          <FiledReturns tasks={tasks} />
        </div>

        {/* Right — audit + compliances */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <AuditTimeline logs={logs} />

          {/* Configured compliances */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #E5E2DB",
              borderRadius: 16,
              padding: "20px 22px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            }}
          >
            <h3
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontWeight: 400,
                fontSize: 15,
                color: "#1A1A1A",
                letterSpacing: "-0.02em",
                marginBottom: 14,
              }}
            >
              Configured Compliances
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {client.compliance_types.map(t => (
                <span
                  key={t}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#6B6B6B",
                    background: "#F3F1EC",
                    border: "1px solid #E5E2DB",
                    borderRadius: 6,
                    padding: "4px 9px",
                  }}
                >
                  {t.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
