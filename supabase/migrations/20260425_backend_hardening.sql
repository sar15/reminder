-- ╔════════════════════════════════════════════════════════════════╗
-- ║  Migration: Backend Production Hardening                      ║
-- ║  Creates cron_executions table for idempotent cron jobs       ║
-- ║  Adds task insert API support                                 ║
-- ╚════════════════════════════════════════════════════════════════╝

-- ── Cron idempotency table ────────────────────────────────────
-- One row per date. Unique constraint prevents parallel duplicate runs.
CREATE TABLE IF NOT EXISTS cron_executions (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  execution_date  date NOT NULL,
  started_at      timestamptz NOT NULL DEFAULT now(),
  completed_at    timestamptz,
  status          text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  summary         jsonb,
  CONSTRAINT uq_cron_execution_date UNIQUE (execution_date)
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_cron_exec_date ON cron_executions(execution_date DESC);

-- RLS: Only service role can access (cron runs server-side)
ALTER TABLE cron_executions ENABLE ROW LEVEL SECURITY;

-- No public policies — this table is only accessed via service_role key
-- which bypasses RLS. This is intentional for a server-only table.

-- ── Add 'reminder_failed' as valid audit action ───────────────
-- The audit_log.action column may have a CHECK constraint — 
-- update it if needed. If not constrained, this is a no-op.
DO $$
BEGIN
  -- Check if the constraint exists before trying to drop/recreate
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'audit_log_action_check' 
    AND conrelid = 'audit_log'::regclass
  ) THEN
    ALTER TABLE audit_log DROP CONSTRAINT audit_log_action_check;
    ALTER TABLE audit_log ADD CONSTRAINT audit_log_action_check
      CHECK (action IN (
        'reminder_sent', 'reminder_failed', 'status_changed',
        'document_uploaded', 'magic_link_generated', 'task_created',
        'client_created', 'report_generated'
      ));
  END IF;
END $$;
