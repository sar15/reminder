/**
 * GET /api/reminders/run
 * Daily cron job — checks all pending tasks and fires T-7, T-3, T-1 reminders.
 * Called by Vercel Cron at 3 AM IST (21:30 UTC).
 * Protected by CRON_SECRET env var.
 *
 * IDEMPOTENCY: Uses cron_executions table with a unique date constraint.
 * If Vercel fires this twice in parallel, only one execution proceeds.
 * The other gets a unique constraint violation and exits safely.
 */
import { NextRequest, NextResponse } from "next/server";
import {
  getEligibleChannels,
  sendTaskReminder,
  shouldSendCadence,
} from "@/lib/reminder-dispatch";
import {
  DEFAULT_REMINDER_RULES,
  normalizeReminderRules,
} from "@/lib/reminder-rules";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type TaskRow    = Database["public"]["Tables"]["compliance_tasks"]["Row"];
type ClientRow  = Database["public"]["Tables"]["clients"]["Row"];
type AuditRow   = Database["public"]["Tables"]["audit_log"]["Row"];
type RuleRow    = Database["public"]["Tables"]["reminder_rules"]["Row"];

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest) {
  if (!process.env.CRON_SECRET) return true; // open in dev
  return (
    req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`
  );
}

/**
 * Acquire cron lock for today's date.
 * Returns true if this is the first execution today — safe to proceed.
 * Returns false if another execution already claimed this date (race condition).
 */
async function acquireCronLock(supabase: ReturnType<typeof createAdminClient>): Promise<boolean> {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const { error } = await supabase.from("cron_executions").insert({
    execution_date: today,
    started_at: new Date().toISOString(),
    status: "running",
  });

  // If unique constraint violation (23505), another execution already claimed this date
  if (error) {
    if (error.code === "23505") return false;
    // Non-constraint error — log but allow execution (fail-open for reliability)
    console.error("[Cron Lock] Unexpected error:", error.message);
    return true;
  }

  return true;
}

async function completeCronLock(
  supabase: ReturnType<typeof createAdminClient>,
  summary: Record<string, unknown>
) {
  const today = new Date().toISOString().slice(0, 10);
  await supabase
    .from("cron_executions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      summary: summary as unknown as Database["public"]["Tables"]["cron_executions"]["Update"]["summary"],
    })
    .eq("execution_date", today);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const supabase = createAdminClient();

  // ── Idempotency guard ─────────────────────────────────────
  const lockAcquired = await acquireCronLock(supabase);
  if (!lockAcquired) {
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: "Cron already executed for today",
      ran_at: new Date().toISOString(),
    });
  }

  // Load all non-filed tasks with their clients
  const { data: rawTasks, error: taskErr } = await supabase
    .from("compliance_tasks")
    .select("*, clients(*)")
    .not("status", "in", '("filed","docs_received","in_progress","review_ready")')
    .order("due_date");

  if (taskErr || !rawTasks) {
    return NextResponse.json(
      { success: false, error: taskErr?.message ?? "Failed to load tasks", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }

  const tasks   = rawTasks as Array<TaskRow & { clients: ClientRow | null }>;
  const taskIds = tasks.map((t) => t.id);
  const firmIds = [...new Set(tasks.map((t) => t.firm_id))];

  // Load existing reminder logs (dedup check)
  const { data: logs } = taskIds.length
    ? await supabase
        .from("audit_log")
        .select("task_id, channel, metadata")
        .in("task_id", taskIds)
        .eq("action", "reminder_sent")
    : { data: [] as Pick<AuditRow, "task_id" | "channel" | "metadata">[] };

  // Load per-firm reminder rules
  const { data: ruleRows } = firmIds.length
    ? await supabase
        .from("reminder_rules")
        .select("*")
        .in("firm_id", firmIds)
    : { data: [] as RuleRow[] };

  const ruleMap = new Map<string, ReturnType<typeof normalizeReminderRules>>();
  for (const firmId of firmIds) {
    const firmRules = (ruleRows ?? [])
      .filter((r) => r.firm_id === firmId)
      .map((r) => ({
        cadence:     r.cadence as (typeof DEFAULT_REMINDER_RULES)[number]["cadence"],
        offset_days: r.offset_days,
        channels:    r.channels as (typeof DEFAULT_REMINDER_RULES)[number]["channels"],
        enabled:     r.enabled,
      }));
    ruleMap.set(
      firmId,
      firmRules.length ? normalizeReminderRules(firmRules) : DEFAULT_REMINDER_RULES
    );
  }

  const summary = {
    tasks_checked:       tasks.length,
    reminders_triggered: 0,
    sent:                0,
    skipped:             0,
    failed:              0,
    details: [] as Array<{
      task_id: string;
      client:  string;
      cadence: string;
      success: boolean;
    }>,
  };

  for (const task of tasks) {
    const client = task.clients;
    if (!client) continue;

    const rules = ruleMap.get(task.firm_id) ?? DEFAULT_REMINDER_RULES;

    for (const rule of rules) {
      if (!rule.enabled) continue;
      if (!shouldSendCadence(task, rule.offset_days)) continue;

      const eligible = getEligibleChannels({
        channels:     rule.channels,
        client,
        existingLogs: logs ?? [],
        taskId:       task.id,
        cadence:      rule.cadence,
      });

      if (eligible.length === 0) {
        summary.skipped++;
        continue;
      }

      summary.reminders_triggered++;

      const result = await sendTaskReminder({
        supabase,
        task,
        client,
        cadence:   rule.cadence,
        channels:  eligible,
        automated: true,
      });

      summary.details.push({
        task_id: task.id,
        client:  client.name,
        cadence: rule.cadence,
        success: result.success,
      });
      // Cap details at 50 entries to keep cron_executions.summary JSONB bounded
      if (summary.details.length > 50) summary.details.length = 50;

      result.success ? summary.sent++ : summary.failed++;
    }
  }

  // Mark today's execution as completed
  await completeCronLock(supabase, summary);

  return NextResponse.json({ success: true, ran_at: new Date().toISOString(), ...summary });
}
