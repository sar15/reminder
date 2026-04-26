"use client";

import { useState } from "react";
import Link from "next/link";
import { formatComplianceType, daysUntilDue, getRiskLevel } from "@/lib/utils";
import type { Client, ComplianceTask } from "@/types";
import { Bell, Download, ChevronRight } from "lucide-react";
import { RemindSlideOver } from "@/components/remind/RemindSlideOver";

interface ClientRowProps {
  client: Client;
  tasks: ComplianceTask[];
}

export function ClientRow({ client, tasks }: ClientRowProps) {
  const [remindOpen, setRemindOpen] = useState(false);

  const activeTasks = tasks.filter(t => t.status !== "filed");
  const risk = getRiskLevel(activeTasks);

  const nextTask = [...activeTasks]
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];
  const nextDueIn = nextTask ? daysUntilDue(nextTask.due_date) : null;

  const riskAccent = risk === "red" ? "#DE350B" : risk === "yellow" ? "#FF8B00" : "#00875A";
  const riskBg     = risk === "red" ? "#FFEBE6" : risk === "yellow" ? "#FFF3E0" : "#E3FCEF";
  const riskLabel  = risk === "red" ? "Critical" : risk === "yellow" ? "Attention" : "On Track";

  return (
    <>
      <div
        style={{
          background: "#fff",
          border: "1px solid #E5E2DB",
          borderRadius: 14,
          padding: "18px 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          transition: "box-shadow 0.15s, transform 0.15s",
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 2px rgba(0,0,0,0.03)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        }}
      >
        {/* Left — identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0, flex: 1 }}>
          {/* Risk dot */}
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: riskAccent,
              flexShrink: 0,
            }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <Link
                href={`/dashboard/clients/${client.id}`}
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1A1A1A",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {client.name}
              </Link>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  padding: "2px 7px",
                  borderRadius: 100,
                  background: riskBg,
                  color: riskAccent,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.05em",
                  flexShrink: 0,
                }}
              >
                {riskLabel}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {client.pan && (
                <span style={{ fontSize: 10, fontFamily: "monospace", color: "#9B9B9B", background: "#F3F1EC", border: "1px solid #E5E2DB", borderRadius: 4, padding: "1px 6px" }}>
                  {client.pan}
                </span>
              )}
              {client.email && (
                <span style={{ fontSize: 11, color: "#9B9B9B" }}>{client.email}</span>
              )}
              <span style={{ fontSize: 11, color: "#C5C2BB" }}>· {activeTasks.length} active</span>
            </div>
          </div>
        </div>

        {/* Middle — next due */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          {nextTask ? (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#3D3D3D", marginBottom: 2 }}>
                {formatComplianceType(nextTask.compliance_type)}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: nextDueIn! < 0 ? "#DE350B" : nextDueIn! <= 5 ? "#FF8B00" : "#9B9B9B",
                }}
              >
                {nextDueIn! < 0 ? `${Math.abs(nextDueIn!)}d overdue` : `${nextDueIn}d left`}
              </div>
            </>
          ) : (
            <span style={{ fontSize: 11, color: "#00875A", fontWeight: 600 }}>All clear</span>
          )}
        </div>

        {/* Right — actions */}
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button
            onClick={() => setRemindOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 12px",
              background: "transparent",
              border: "1px solid #E5E2DB",
              borderRadius: 7,
              fontSize: 11,
              fontWeight: 600,
              color: "#6B6B6B",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "#EDF0FF";
              (e.currentTarget as HTMLElement).style.color = "#2D5BFF";
              (e.currentTarget as HTMLElement).style.borderColor = "#C0CCFF";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "#6B6B6B";
              (e.currentTarget as HTMLElement).style.borderColor = "#E5E2DB";
            }}
          >
            <Bell size={12} /> Remind
          </button>
          <a
            href={`/api/reports/${client.id}/pdf`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 12px",
              background: "transparent",
              border: "1px solid #E5E2DB",
              borderRadius: 7,
              fontSize: 11,
              fontWeight: 600,
              color: "#6B6B6B",
              textDecoration: "none",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "#F3F1EC";
              (e.currentTarget as HTMLElement).style.color = "#1A1A1A";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "#6B6B6B";
            }}
          >
            <Download size={12} /> PDF
          </a>
          <Link
            href={`/dashboard/clients/${client.id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "6px 8px",
              background: "#F3F1EC",
              border: "1px solid #E5E2DB",
              borderRadius: 7,
              color: "#9B9B9B",
              textDecoration: "none",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "#E5E2DB";
              (e.currentTarget as HTMLElement).style.color = "#1A1A1A";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "#F3F1EC";
              (e.currentTarget as HTMLElement).style.color = "#9B9B9B";
            }}
          >
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      <RemindSlideOver isOpen={remindOpen} onClose={() => setRemindOpen(false)} clientId={client.id} />
    </>
  );
}
