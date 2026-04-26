-- Allow firm/client-level audit events that are not tied to a specific task,
-- such as client magic-link generation.
ALTER TABLE audit_log
  ALTER COLUMN task_id DROP NOT NULL;
