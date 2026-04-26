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
type AdminClient = ReturnType<typeof createAdminClient>;
type ReminderJob = Database["public"]["Tables"]["reminder_jobs"]["Row"];

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest) {
  if (!process.env.CRON_SECRET) return true; // open in dev
  return (
    req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`
  );
}

function getIstDateKey(date = new Date()) {
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(date.getTime() + istOffset).toISOString().slice(0, 10);
}

/**
 * Acquire cron lock for today's date.
 * Returns true if this is the first execution today — safe to proceed.
 * Returns false if another execution already claimed this date (race condition).
 */
async function acquireCronLock(supabase: AdminClient): Promise<boolean> {
  const today = getIstDateKey();
  const { error } = await supabase.from("cron_executions").insert({
    execution_date: today,
    started_at: new Date().toISOString(),
    status: "running",
  });

  // If unique constraint violation (23505), another execution already claimed this date
  if (error) {
    if (error.code === "23505") return false;
    throw new Error(`Cron lock failed: ${error.message}`);
  }

  return true;
}

async function completeCronLock(
  supabase: AdminClient,
  summary: Record<string, unknown>
) {
  const today = getIstDateKey();
  await supabase
    .from("cron_executions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      summary: summary as unknown as Database["public"]["Tables"]["cron_executions"]["Update"]["summary"],
    })
    .eq("execution_date", today);
}

async function failCronLock(
  supabase: AdminClient,
  summary: Record<string, unknown>
) {
  const today = getIstDateKey();
  await supabase
    .from("cron_executions")
    .update({
      status: "failed",
      completed_at: new Date().toISOString(),
      summary: summary as unknown as Database["public"]["Tables"]["cron_executions"]["Update"]["summary"],
    })
    .eq("execution_date", today);
}

function jobTable(supabase: AdminClient) {
  return supabase.from("reminder_jobs");
}

async function getOrCreateReminderJob({
  supabase,
  task,
  cadence,
  channel,
}: {
  supabase: AdminClient;
  task: TaskRow;
  cadence: string;
  channel: string;
}): Promise<{ job: ReminderJob | null; shouldProcess: boolean }> {
  const scheduledFor = getIstDateKey();
  const insertPayload = {
    firm_id: task.firm_id,
    client_id: task.client_id,
    task_id: task.id,
    cadence,
    channel,
    scheduled_for: scheduledFor,
    status: "pending",
  };

  const { data, error } = await jobTable(supabase)
    .insert(insertPayload)
    .select("id, task_id, cadence, channel, status, attempts")
    .single();

  if (!error && data) {
    return { job: data as ReminderJob, shouldProcess: true };
  }

  if (error?.code !== "23505") {
    throw new Error(`Reminder job insert failed: ${error?.message ?? "unknown error"}`);
  }

  const { data: existing, error: selectError } = await jobTable(supabase)
    .select("id, task_id, cadence, channel, status, attempts")
    .eq("task_id", task.id)
    .eq("cadence", cadence)
    .eq("channel", channel)
    .single();

  if (selectError || !existing) {
    throw new Error(`Reminder job lookup failed: ${selectError?.message ?? "unknown error"}`);
  }

  const job = existing as ReminderJob;
  return { job, shouldProcess: job.status === "pending" || job.status === "failed" };
}

async function markJobProcessing(supabase: AdminClient, job: ReminderJob) {
  const { error } = await jobTable(supabase)
    .update({
      status: "processing",
      attempts: job.attempts + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", job.id)
    .in("status", ["pending", "failed"]);

  if (error) throw new Error(`Reminder job lock failed: ${error.message}`);
}

async function completeReminderJob(
  supabase: AdminClient,
  job: ReminderJob,
  result: Awaited<ReturnType<typeof sendTaskReminder>>
) {
  const emailResult = result.results.email;
  const { error } = await jobTable(supabase)
    .update({
      status: result.success ? "sent" : "failed",
      provider_message_id: emailResult?.message_id ?? null,
      last_error: result.success ? null : emailResult?.error ?? "Reminder dispatch failed",
      sent_at: result.success ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", job.id);

  if (error) throw new Error(`Reminder job completion failed: ${error.message}`);
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

  const summary = {
    tasks_checked:       0,
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

  try {
    // Load all non-filed tasks with their clients
    const { data: rawTasks, error: taskErr } = await supabase
      .from("compliance_tasks")
      .select("*, clients(*)")
      .not("status", "in", '("filed","docs_received","in_progress","review_ready")')
      .order("due_date");

    if (taskErr || !rawTasks) {
      throw new Error(taskErr?.message ?? "Failed to load tasks");
    }

    const tasks   = rawTasks as Array<TaskRow & { clients: ClientRow | null }>;
    const taskIds = tasks.map((t) => t.id);
    const firmIds = [...new Set(tasks.map((t) => t.firm_id))];
    summary.tasks_checked = tasks.length;

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

        for (const channel of eligible) {
          const { job, shouldProcess } = await getOrCreateReminderJob({
            supabase,
            task,
            cadence: rule.cadence,
            channel,
          });

          if (!job || !shouldProcess) {
            summary.skipped++;
            continue;
          }

          await markJobProcessing(supabase, job);
          summary.reminders_triggered++;

          const result = await sendTaskReminder({
            supabase,
            task,
            client,
            cadence:   rule.cadence,
            channels:  [channel],
            automated: true,
          });

          await completeReminderJob(supabase, job, result);

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
    }

    await completeCronLock(supabase, summary);
    return NextResponse.json({ success: true, ran_at: new Date().toISOString(), ...summary });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Cron execution failed";
    await failCronLock(supabase, { ...summary, error: message });
    return NextResponse.json(
      { success: false, error: message, code: "INTERNAL_ERROR", ...summary },
      { status: 500 }
    );
  }
}
