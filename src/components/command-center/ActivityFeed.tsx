"use client";

import type { AuditLog, Client } from "@/types";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface ActivityFeedProps {
  logs: AuditLog[];
  clients: Client[];
}

const ACTION_META: Record<string, { label: string; dot: string }> = {
  reminder_sent:  { label: "Reminder sent",       dot: "#2D5BFF" },
  doc_uploaded:   { label: "Documents uploaded",  dot: "#00875A" },
  filed:          { label: "Filed",               dot: "#00875A" },
  escalated:      { label: "Escalated",           dot: "#DE350B" },
  opened:         { label: "Email opened",        dot: "#6554C0" },
  reminder_failed:{ label: "Reminder failed",     dot: "#DE350B" },
  task_created:   { label: "Task created",        dot: "#9B9B9B" },
};

export function ActivityFeed({ logs, clients }: ActivityFeedProps) {
  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)
    .map(log => ({ ...log, client: clients.find(c => c.id === log.client_id) }))
    .filter(log => log.client);

  return (
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
      <div
        style={{
          padding: "20px 22px 14px",
          borderBottom: "1px solid #EDEBE6",
          flexShrink: 0,
        }}
      >
        <h2
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontWeight: 400,
            fontSize: 16,
            color: "#1A1A1A",
            letterSpacing: "-0.02em",
          }}
        >
          Activity
        </h2>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 22px" }} className="custom-scrollbar">
        {recentLogs.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 12, color: "#9B9B9B" }}>
            No recent activity.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {recentLogs.map((log, i) => {
              const meta = ACTION_META[log.action] ?? { label: log.action.replace(/_/g, " "), dot: "#9B9B9B" };
              return (
                <div
                  key={log.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: i < recentLogs.length - 1 ? "1px solid #EDEBE6" : "none",
                  }}
                >
                  {/* Dot */}
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: meta.dot,
                      flexShrink: 0,
                      marginTop: 5,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: "#3D3D3D", marginBottom: 2 }}>
                      {meta.label}{" "}
                      <Link
                        href={`/dashboard/clients/${log.client_id}`}
                        style={{ color: "#1A1A1A", fontWeight: 600, textDecoration: "none" }}
                      >
                        {log.client!.name}
                      </Link>
                    </div>
                    <div style={{ fontSize: 10, color: "#C5C2BB" }}>
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
