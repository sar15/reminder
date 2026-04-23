-- Fix 1: Enable RLS on compliance_calendar
alter table compliance_calendar enable row level security;

-- Fix 2: Set search_path on all functions
create or replace function get_my_firm_id()
returns uuid language sql stable security definer
set search_path = public as $$
  select firm_id from users where id = auth.uid() limit 1;
$$;

create or replace function update_updated_at()
returns trigger language plpgsql
set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
declare
  new_firm_id uuid;
begin
  insert into firms (name, email)
  values (
    coalesce(new.raw_user_meta_data->>'firm_name', 'My CA Firm'),
    new.email
  )
  returning id into new_firm_id;

  insert into users (id, firm_id, email, full_name, role)
  values (
    new.id,
    new_firm_id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'partner'
  );

  return new;
end;
$$;;
