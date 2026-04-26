"use client";

import { useMemo } from "react";
import type { ComplianceTask } from "@/types";
import { daysUntilDue, getPenaltyPerDay } from "@/lib/utils";

export function KPIStrip({ tasks }: { tasks: ComplianceTask[] }) {
  const activeTasks = tasks.filter(t => t.status !== "filed");

  const stats = useMemo(() => {
    let overdueCount = 0;
    let dueSoonCount = 0;
    let penalty = 0;
    for (const t of activeTasks) {
      const days = daysUntilDue(t.due_date);
      if (days < 0) {
        overdueCount++;
        penalty += getPenaltyPerDay(t.compliance_type) * Math.abs(days);
      } else if (days <= 7) {
        dueSoonCount++;
      }
    }
    return {
      overdue: overdueCount,
      dueSoon: dueSoonCount,
      onTrack: activeTasks.length - overdueCount - dueSoonCount,
      penalty,
    };
  }, [activeTasks]);

  const cards = [
    {
      label: "Overdue",
      value: stats.overdue,
      sub: "Needs attention now",
      accent: "#DE350B",
      accentBg: "#FFEBE6",
    },
    {
      label: "Due this week",
      value: stats.dueSoon,
      sub: "Within 7 days",
      accent: "#FF8B00",
      accentBg: "#FFF3E0",
    },
    {
      label: "On track",
      value: stats.onTrack,
      sub: "No action needed",
      accent: "#00875A",
      accentBg: "#E3FCEF",
    },
    {
      label: "Est. penalty",
      value: `₹${stats.penalty.toLocaleString("en-IN")}`,
      sub: "Accruing daily",
      accent: "#DE350B",
      accentBg: "#FFEBE6",
      isRupee: true,
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
      {cards.map(({ label, value, sub, accent, accentBg }) => (
        <div
          key={label}
          style={{
            background: "#fff",
            border: "1px solid #E5E2DB",
            borderRadius: 16,
            padding: "28px 24px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            transition: "box-shadow 0.2s, transform 0.2s",
            cursor: "default",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)";
            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 2px rgba(0,0,0,0.03)";
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          }}
        >
          {/* Accent bar */}
          <div
            style={{
              width: 28,
              height: 3,
              borderRadius: 2,
              background: accent,
              marginBottom: 20,
              opacity: 0.7,
            }}
          />
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#1A1A1A",
              letterSpacing: "-0.04em",
              lineHeight: 1,
              marginBottom: 8,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {value}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#3D3D3D", marginBottom: 3 }}>
            {label}
          </div>
          <div style={{ fontSize: 11, color: "#9B9B9B" }}>{sub}</div>
        </div>
      ))}
    </div>
  );
}
