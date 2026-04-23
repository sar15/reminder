-- ============================================================
-- CA Compliance Shield — Supabase PostgreSQL Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- FIRMS — CA firm accounts
-- ============================================================
create table firms (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  partner_name text,
  email text unique not null,
  phone text,
  plan text not null default 'starter', -- starter | growth | professional | enterprise
  client_limit int not null default 5,
  created_at timestamptz not null default now()
);

-- ============================================================
-- USERS — Staff with role-based access
-- ============================================================
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  firm_id uuid references firms(id) on delete cascade,
  email text unique not null,
  full_name text,
  role text not null default 'junior', -- partner | senior | junior
  created_at timestamptz not null default now()
);

-- ============================================================
-- CLIENTS — Business entities managed by the CA firm
-- ============================================================
create table clients (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid references firms(id) on delete cascade not null,
  name text not null,
  contact_name text,
  email text,
  phone text,
  pan text,
  gstin text,
  cin text,
  compliance_types text[] not null default '{}', -- ['GST','TDS','ITR','ROC','PF']
  preferred_language text not null default 'en', -- en | hi | gu | mr | ta
  status text not null default 'active', -- active | inactive
  created_at timestamptz not null default now()
);

-- ============================================================
-- COMPLIANCE_TASKS — Individual compliance event per client per period
-- ============================================================
create table compliance_tasks (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id) on delete cascade not null,
  firm_id uuid references firms(id) on delete cascade not null,
  compliance_type text not null, -- GSTR1 | GSTR3B | TDS_PAYMENT | TDS_RETURN | ITR | AOC4 | MGT7 | PF | ESI | ADVANCE_TAX
  period text not null, -- e.g. "2026-03" or "FY2025-26"
  due_date date not null,
  status text not null default 'pending', -- pending | waiting_docs | docs_received | in_progress | review_ready | filed | overdue
  assigned_to uuid references users(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- AUDIT_LOG — IMMUTABLE: every communication event
-- No UPDATE or DELETE allowed — append only
-- ============================================================
create table audit_log (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references compliance_tasks(id) on delete cascade not null,
  firm_id uuid references firms(id) on delete cascade not null,
  client_id uuid references clients(id) on delete cascade not null,
  action text not null, -- reminder_sent | delivered | opened | doc_uploaded | filed | escalated
  channel text, -- email | whatsapp | sms
  message_id text, -- provider message ID for delivery tracking
  metadata jsonb, -- extra data: template used, file name, etc.
  performed_by uuid references users(id),
  timestamp timestamptz not null default now()
);

-- Prevent any updates or deletes on audit_log
create or replace rule audit_log_no_update as on update to audit_log do instead nothing;
create or replace rule audit_log_no_delete as on delete to audit_log do instead nothing;

-- ============================================================
-- DOCUMENTS — Client-uploaded files
-- ============================================================
create table documents (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references compliance_tasks(id) on delete cascade not null,
  client_id uuid references clients(id) on delete cascade not null,
  firm_id uuid references firms(id) on delete cascade not null,
  file_name text not null,
  file_path text not null, -- Supabase Storage path
  file_size int,
  uploaded_by_client boolean not null default true,
  uploaded_at timestamptz not null default now()
);

-- ============================================================
-- REMINDER_TEMPLATES — Customizable per firm per language
-- ============================================================
create table reminder_templates (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid references firms(id) on delete cascade,
  cadence text not null, -- T-10 | T-7 | T-3 | T-1 | T0 | T+1 | T+3
  channel text not null, -- email | whatsapp
  language text not null default 'en',
  subject text, -- email subject
  body text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- COMPLIANCE_CALENDAR — Master calendar with auto-update tracking
-- ============================================================
create table compliance_calendar (
  id uuid primary key default uuid_generate_v4(),
  compliance_type text not null,
  frequency text not null, -- monthly | quarterly | annual | half-yearly
  standard_due_date text not null, -- e.g. "11th of month" or "31st July"
  updated_due_date date, -- when govt extends
  source_notification text, -- link to CBDT/CBIC circular
  is_extended boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CLIENT MAGIC LINKS — For client portal access (no login needed)
-- ============================================================
create table client_magic_links (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id) on delete cascade not null,
  firm_id uuid references firms(id) on delete cascade not null,
  token text unique not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table firms enable row level security;
alter table users enable row level security;
alter table clients enable row level security;
alter table compliance_tasks enable row level security;
alter table audit_log enable row level security;
alter table documents enable row level security;
alter table reminder_templates enable row level security;

-- Users can only see their own firm's data
create policy "firm_isolation" on clients
  for all using (
    firm_id = (select firm_id from users where id = auth.uid())
  );

create policy "firm_isolation" on compliance_tasks
  for all using (
    firm_id = (select firm_id from users where id = auth.uid())
  );

create policy "firm_isolation" on audit_log
  for select using (
    firm_id = (select firm_id from users where id = auth.uid())
  );

-- audit_log: only insert allowed (no update/delete via RLS either)
create policy "audit_log_insert" on audit_log
  for insert with check (
    firm_id = (select firm_id from users where id = auth.uid())
  );

-- ============================================================
-- SEED: Default compliance calendar
-- ============================================================
insert into compliance_calendar (compliance_type, frequency, standard_due_date) values
  ('GSTR1', 'monthly', '11th of month'),
  ('GSTR1_QUARTERLY', 'quarterly', '13th of month after quarter'),
  ('GSTR3B', 'monthly', '20th of month'),
  ('GSTR3B_QUARTERLY', 'quarterly', '22nd-24th of month after quarter'),
  ('GSTR9', 'annual', '31st December'),
  ('TDS_PAYMENT', 'monthly', '7th of month'),
  ('TDS_RETURN_24Q', 'quarterly', '31st of month after quarter'),
  ('TDS_RETURN_26Q', 'quarterly', '31st of month after quarter'),
  ('ADVANCE_TAX', 'quarterly', '15th Jun/Sep/Dec/Mar'),
  ('ITR_NON_AUDIT', 'annual', '31st July'),
  ('ITR_AUDIT', 'annual', '31st October'),
  ('TAX_AUDIT_3CD', 'annual', '30th September'),
  ('AOC4', 'annual', 'October-November'),
  ('MGT7', 'annual', 'October-November'),
  ('DIR3_KYC', 'annual', '30th September'),
  ('MSME1', 'half-yearly', '30th April / 31st October'),
  ('PF', 'monthly', '15th of month'),
  ('ESI', 'monthly', '15th of month'),
  ('LLP_FORM11', 'annual', '30th May');
