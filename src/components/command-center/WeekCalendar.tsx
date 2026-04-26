"use client";

import { useMemo } from "react";
import type { ComplianceTask } from "@/types";
import { format, addDays } from "date-fns";

export function WeekCalendar({ tasks }: { tasks: ComplianceTask[] }) {
  const activeTasks = tasks.filter(t => t.status !== "filed");

  const weekDays = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dueTasks = activeTasks.filter(t => t.due_date === dateStr);
      return { date, isToday: i === 0, dueCount: dueTasks.length };
    });
  }, [activeTasks]);

  const totalDue = weekDays.reduce((acc, d) => acc + d.dueCount, 0);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E5E2DB",
        borderRadius: 16,
        padding: "20px 22px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
        <h2
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontWeight: 400,
            fontSize: 16,
            color: "#1A1A1A",
            letterSpacing: "-0.02em",
          }}
        >
          This Week
        </h2>
        <span style={{ fontSize: 11, color: "#9B9B9B" }}>
          {totalDue} deadline{totalDue !== 1 ? "s" : ""}
        </span>
      </div>

      <div style={{ display: "flex", gap: 6, flex: 1, alignItems: "center" }}>
        {weekDays.map((day, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: day.isToday ? "#2D5BFF" : "#C5C2BB",
              }}
            >
              {format(day.date, "EEE")}
            </span>
            <div
              style={{
                width: "100%",
                aspectRatio: "1",
                maxHeight: 36,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 600,
                position: "relative",
                background: day.isToday ? "#1A1A1A" : day.dueCount > 0 ? "#FFF3E0" : "transparent",
                color: day.isToday ? "#fff" : day.dueCount > 0 ? "#FF8B00" : "#9B9B9B",
                border: day.isToday ? "none" : day.dueCount > 0 ? "1px solid #FFD591" : "1px solid transparent",
              }}
            >
              {format(day.date, "d")}
              {day.dueCount > 0 && !day.isToday && (
                <span
                  style={{
                    position: "absolute",
                    top: -3,
                    right: -3,
                    width: 13,
                    height: 13,
                    borderRadius: "50%",
                    background: "#FF8B00",
                    color: "#fff",
                    fontSize: 7,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1.5px solid #FAF9F7",
                  }}
                >
                  {day.dueCount}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
