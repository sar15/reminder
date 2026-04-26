"use client";

import { useState } from "react";
import Link from "next/link";
import { formatComplianceType, daysUntilDue } from "@/lib/utils";
import type { ComplianceTask, Client } from "@/types";
import { RemindSlideOver } from "@/components/remind/RemindSlideOver";

interface ActionListProps {
  tasks: ComplianceTask[];
  clients: Client[];
}

export function ActionList({ tasks, clients }: ActionListProps) {
  const [remindOpen, setRemindOpen] = useState(false);
  const [remindClientId, setRemindClientId] = useState<string | null>(null);

  const urgentTasks = tasks
    .filter(t => t.status !== "filed")
    .map(t => ({ ...t, client: clients.find(c => c.id === t.client_id), days: daysUntilDue(t.due_date) }))
    .filter(t => t.client)
    .sort((a, b) => a.days - b.days)
    .slice(0, 10);

  return (
    <>
      <div
        style={{
          background: "#fff",
          border: "1px solid #E5E2DB",
          borderRadius: 16,
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid #EDEBE6",
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontWeight: 400,
                fontSize: 18,
                color: "#1A1A1A",
                letterSpacing: "-0.02em",
                marginBottom: 2,
              }}
            >
              Urgent Actions
            </h2>
            <p style={{ fontSize: 12, color: "#9B9B9B" }}>
              {urgentTasks.filter(t => t.days < 0).length} overdue · {urgentTasks.filter(t => t.days >= 0 && t.days <= 3).length} critical
            </p>
          </div>
          <Link
            href="/dashboard/clients"
            style={{ fontSize: 12, color: "#2D5BFF", fontWeight: 500, textDecoration: "none" }}
          >
            All clients →
          </Link>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto" }} className="custom-scrollbar">
          {urgentTasks.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                padding: 48,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", marginBottom: 4 }}>All caught up</p>
              <p style={{ fontSize: 12, color: "#9B9B9B" }}>No urgent tasks require attention.</p>
            </div>
          ) : (
            urgentTasks.map((task, i) => {
              const isOverdue = task.days < 0;
              const isUrgent = task.days >= 0 && task.days <= 3;
              const accent = isOverdue ? "#DE350B" : isUrgent ? "#FF8B00" : "#9B9B9B";

              return (
                <div
                  key={task.id}
                  style={{
                    padding: "14px 24px",
                    borderBottom: i < urgentTasks.length - 1 ? "1px solid #EDEBE6" : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    transition: "background 0.15s",
                    cursor: "default",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#FAFAF8"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0, flex: 1 }}>
                    {/* Left accent line */}
                    <div
                      style={{
                        width: 3,
                        height: 32,
                        borderRadius: 2,
                        background: accent,
                        flexShrink: 0,
                        opacity: 0.6,
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <Link
                          href={`/dashboard/clients/${task.client_id}`}
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#1A1A1A",
                            textDecoration: "none",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {task.client!.name}
                        </Link>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: accent,
                            whiteSpace: "nowrap",
                            letterSpacing: "0.02em",
                          }}
                        >
                          {isOverdue ? `${Math.abs(task.days)}d overdue` : `${task.days}d left`}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "#9B9B9B" }}>
                        {formatComplianceType(task.compliance_type)} · {task.period}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => { setRemindClientId(task.client_id); setRemindOpen(true); }}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 7,
                      border: "1px solid #E5E2DB",
                      background: "transparent",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#6B6B6B",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.15s",
                      fontFamily: "'DM Sans', sans-serif",
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
                    Remind
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {remindClientId && (
        <RemindSlideOver
          isOpen={remindOpen}
          onClose={() => { setRemindOpen(false); setTimeout(() => setRemindClientId(null), 300); }}
          clientId={remindClientId}
        />
      )}
    </>
  );
}
