-- Enable RLS on all tables
alter table firms enable row level security;
alter table users enable row level security;
alter table clients enable row level security;
alter table compliance_tasks enable row level security;
alter table audit_log enable row level security;
alter table documents enable row level security;
alter table reminder_templates enable row level security;
alter table client_magic_links enable row level security;

-- Helper: get current user's firm_id
create or replace function get_my_firm_id()
returns uuid language sql stable security definer as $$
  select firm_id from users where id = auth.uid() limit 1;
$$;

-- FIRMS: users can only see their own firm
create policy "firms_own" on firms
  for all using (id = get_my_firm_id());

-- USERS: users can see others in same firm
create policy "users_same_firm" on users
  for all using (firm_id = get_my_firm_id());

-- CLIENTS: firm isolation
create policy "clients_firm" on clients
  for all using (firm_id = get_my_firm_id());

-- COMPLIANCE TASKS: firm isolation
create policy "tasks_firm" on compliance_tasks
  for all using (firm_id = get_my_firm_id());

-- AUDIT LOG: firm isolation, insert only (no update/delete via RLS)
create policy "audit_select" on audit_log
  for select using (firm_id = get_my_firm_id());
create policy "audit_insert" on audit_log
  for insert with check (firm_id = get_my_firm_id());

-- DOCUMENTS: firm isolation
create policy "docs_firm" on documents
  for all using (firm_id = get_my_firm_id());

-- REMINDER TEMPLATES: firm isolation
create policy "templates_firm" on reminder_templates
  for all using (firm_id = get_my_firm_id());

-- CLIENT MAGIC LINKS: firm isolation
create policy "magic_links_firm" on client_magic_links
  for all using (firm_id = get_my_firm_id());

-- COMPLIANCE CALENDAR: public read (no firm isolation needed)
create policy "calendar_read" on compliance_calendar
  for select using (true);;
