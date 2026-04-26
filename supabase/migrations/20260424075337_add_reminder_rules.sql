create table if not exists reminder_rules (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid references firms(id) on delete cascade not null,
  cadence text not null,
  offset_days int not null,
  channels text[] not null default '{}',
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (firm_id, cadence)
);

create index if not exists idx_reminder_rules_firm_id on reminder_rules(firm_id);

alter table reminder_rules enable row level security;

create policy "reminder_rules_firm_select" on reminder_rules
  for select using (true);

create policy "reminder_rules_firm_insert" on reminder_rules
  for insert with check (true);

create policy "reminder_rules_firm_update" on reminder_rules
  for update using (true);

create policy "reminder_rules_firm_delete" on reminder_rules
  for delete using (true);;
