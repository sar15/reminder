"use client";

import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { formatComplianceType, daysUntilDue } from "@/lib/utils";
import type { ComplianceTask } from "@/types";
import { SlideOver } from "@/components/shared/SlideOver";

// Only cadences the engine actually supports
const CADENCE_OPTIONS = [
  { key: "T-7", desc: "7 days before — first reminder" },
  { key: "T-3", desc: "3 days before — urgent warning" },
  { key: "T-1", desc: "1 day before — final notice"   },
] as const;

export function RemindSlideOver({ isOpen, onClose, clientId }: {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
}) {
  const [loading, setLoading]         = useState(false);
  const [tasks, setTasks]             = useState<ComplianceTask[]>([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [cadence, setCadence]         = useState<"T-7" | "T-3" | "T-1">("T-3");
  const [sent, setSent]               = useState(false);
  const [error, setError]             = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setSent(false);
    setError("");
    setLoading(true);
    fetch(`/api/clients/${clientId}/tasks`)
      .then(r => r.json())
      .then(data => {
        if (data.tasks) {
          const active = data.tasks.filter((t: ComplianceTask) => t.status !== "filed");
          setTasks(active);
          if (active.length > 0) setSelectedTask(active[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isOpen, clientId]);

  async function send() {
    if (!selectedTask) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reminders/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: selectedTask, cadence, channels: ["email"] }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSent(true);
      } else {
        setError(data.error ?? "Failed to send reminder. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <SlideOver isOpen={isOpen} onClose={onClose} title="Reminder Sent">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 0", textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#E3FCEF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <CheckCircle2 size={28} style={{ color: "#00875A" }} />
          </div>
          <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: 20, color: "#1A1A1A", marginBottom: 8, letterSpacing: "-0.02em" }}>
            Reminder sent
          </h3>
          <p style={{ fontSize: 13, color: "#9B9B9B", marginBottom: 32, maxWidth: 260 }}>
            Logged in the immutable audit trail with timestamp.
          </p>
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "12px",
              background: "#1A1A1A",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Close
          </button>
        </div>
      </SlideOver>
    );
  }

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="Send Reminder" description="Send a manual compliance notification via email.">
      {loading && tasks.length === 0 ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
          <div
            style={{
              width: 28,
              height: 28,
              border: "3px solid #EDEBE6",
              borderTopColor: "#2D5BFF",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
        </div>
      ) : tasks.length === 0 ? (
        <div style={{ padding: "32px 0", textAlign: "center", fontSize: 13, color: "#9B9B9B" }}>
          No active tasks to remind about.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Task selection */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#9B9B9B", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
              Select Task
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {tasks.map(t => {
                const days = daysUntilDue(t.due_date);
                const isSelected = selectedTask === t.id;
                return (
                  <label
                    key={t.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: isSelected ? "1px solid #2D5BFF" : "1px solid #E5E2DB",
                      background: isSelected ? "#EDF0FF" : "#fff",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() => setSelectedTask(t.id)}
                      style={{ accentColor: "#2D5BFF", width: 14, height: 14, flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A", marginBottom: 2 }}>
                        {formatComplianceType(t.compliance_type)}
                      </div>
                      <div style={{ fontSize: 11, color: "#9B9B9B" }}>
                        {t.period} · Due {t.due_date}
                        {days < 0 && <span style={{ color: "#DE350B", fontWeight: 700 }}> · {Math.abs(days)}d overdue</span>}
                        {days >= 0 && days <= 7 && <span style={{ color: "#FF8B00", fontWeight: 700 }}> · {days}d left</span>}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Cadence selection */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#9B9B9B", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
              Reminder Type
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {CADENCE_OPTIONS.map(({ key, desc }) => {
                const isSelected = cadence === key;
                return (
                  <button
                    key={key}
                    onClick={() => setCadence(key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "11px 14px",
                      borderRadius: 10,
                      border: isSelected ? "1px solid #2D5BFF" : "1px solid #E5E2DB",
                      background: isSelected ? "#EDF0FF" : "#fff",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "monospace",
                        color: isSelected ? "#2D5BFF" : "#6B6B6B",
                        background: isSelected ? "rgba(45,91,255,0.1)" : "#F3F1EC",
                        padding: "2px 8px",
                        borderRadius: 5,
                        flexShrink: 0,
                      }}
                    >
                      {key}
                    </span>
                    <span style={{ fontSize: 12, color: isSelected ? "#2D5BFF" : "#6B6B6B" }}>{desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "#FFEBE6", border: "1px solid #FFBDAD", borderRadius: 8, fontSize: 12, color: "#DE350B" }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, paddingTop: 8, borderTop: "1px solid #EDEBE6" }}>
            <button
              onClick={onClose}
              style={{
                padding: "11px 18px",
                background: "transparent",
                border: "1px solid #E5E2DB",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 600,
                color: "#6B6B6B",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Cancel
            </button>
            <button
              onClick={send}
              disabled={loading || !selectedTask}
              style={{
                flex: 1,
                padding: "11px",
                background: "#1A1A1A",
                border: "none",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                cursor: loading || !selectedTask ? "not-allowed" : "pointer",
                opacity: loading || !selectedTask ? 0.5 : 1,
                fontFamily: "'DM Sans', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {loading && (
                <span
                  style={{
                    width: 12,
                    height: 12,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    display: "inline-block",
                  }}
                />
              )}
              {loading ? "Sending…" : "Send Reminder"}
            </button>
          </div>
        </div>
      )}
    </SlideOver>
  );
}
