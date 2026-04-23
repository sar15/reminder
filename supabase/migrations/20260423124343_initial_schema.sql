-- Enable UUID
create extension if not exists "uuid-ossp";

-- FIRMS
create table firms (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  partner_name text,
  email text unique not null,
  phone text,
  plan text not null default 'starter',
  client_limit int not null default 5,
  created_at timestamptz not null default now()
);

-- USERS
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  firm_id uuid references firms(id) on delete cascade,
  email text unique not null,
  full_name text,
  role text not null default 'junior',
  created_at timestamptz not null default now()
);

-- CLIENTS
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
  compliance_types text[] not null default '{}',
  preferred_language text not null default 'en',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

-- COMPLIANCE TASKS
create table compliance_tasks (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id) on delete cascade not null,
  firm_id uuid references firms(id) on delete cascade not null,
  compliance_type text not null,
  period text not null,
  due_date date not null,
  status text not null default 'pending',
  assigned_to uuid references users(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- AUDIT LOG (append-only)
create table audit_log (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references compliance_tasks(id) on delete cascade not null,
  firm_id uuid references firms(id) on delete cascade not null,
  client_id uuid references clients(id) on delete cascade not null,
  action text not null,
  channel text,
  message_id text,
  metadata jsonb,
  performed_by uuid references users(id),
  timestamp timestamptz not null default now()
);

-- Prevent updates/deletes on audit_log
create or replace rule audit_log_no_update as on update to audit_log do instead nothing;
create or replace rule audit_log_no_delete as on delete to audit_log do instead nothing;

-- DOCUMENTS
create table documents (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references compliance_tasks(id) on delete cascade not null,
  client_id uuid references clients(id) on delete cascade not null,
  firm_id uuid references firms(id) on delete cascade not null,
  file_name text not null,
  file_path text not null,
  file_size int,
  uploaded_by_client boolean not null default true,
  uploaded_at timestamptz not null default now()
);

-- REMINDER TEMPLATES
create table reminder_templates (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid references firms(id) on delete cascade,
  cadence text not null,
  channel text not null,
  language text not null default 'en',
  subject text,
  body text not null,
  created_at timestamptz not null default now()
);

-- COMPLIANCE CALENDAR
create table compliance_calendar (
  id uuid primary key default uuid_generate_v4(),
  compliance_type text not null,
  frequency text not null,
  standard_due_date text not null,
  updated_due_date date,
  source_notification text,
  is_extended boolean not null default false,
  updated_at timestamptz not null default now()
);

-- CLIENT MAGIC LINKS
create table client_magic_links (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id) on delete cascade not null,
  firm_id uuid references firms(id) on delete cascade not null,
  token text unique not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);;
