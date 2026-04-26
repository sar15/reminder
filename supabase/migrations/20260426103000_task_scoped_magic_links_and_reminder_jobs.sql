-- Task-scoped, hashed upload links and durable reminder jobs.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE client_magic_links
  ADD COLUMN IF NOT EXISTS task_id uuid REFERENCES compliance_tasks(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS token_hash text,
  ADD COLUMN IF NOT EXISTS used_at timestamptz;

UPDATE client_magic_links
SET token_hash = encode(digest(token, 'sha256'), 'hex')
WHERE token_hash IS NULL;

UPDATE client_magic_links
SET token = token_hash;

ALTER TABLE client_magic_links
  ALTER COLUMN token_hash SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_magic_links_token_hash
  ON client_magic_links(token_hash);

CREATE INDEX IF NOT EXISTS idx_magic_links_task_id
  ON client_magic_links(task_id);

CREATE TABLE IF NOT EXISTS reminder_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id uuid REFERENCES firms(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  task_id uuid REFERENCES compliance_tasks(id) ON DELETE CASCADE NOT NULL,
  cadence text NOT NULL,
  channel text NOT NULL DEFAULT 'email',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'skipped')),
  scheduled_for date NOT NULL,
  attempts int NOT NULL DEFAULT 0,
  last_error text,
  provider_message_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  UNIQUE (task_id, cadence, channel)
);

CREATE INDEX IF NOT EXISTS idx_reminder_jobs_due
  ON reminder_jobs(status, scheduled_for);

CREATE INDEX IF NOT EXISTS idx_reminder_jobs_firm_id
  ON reminder_jobs(firm_id);

ALTER TABLE reminder_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reminder_jobs_firm_select" ON reminder_jobs
  FOR SELECT USING (firm_id = get_my_firm_id());
