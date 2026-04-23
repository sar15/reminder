-- Auto-create firm + user record when someone signs up via Supabase Auth
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  new_firm_id uuid;
begin
  -- Create a firm for this user
  insert into firms (name, email)
  values (
    coalesce(new.raw_user_meta_data->>'firm_name', 'My CA Firm'),
    new.email
  )
  returning id into new_firm_id;

  -- Create user record linked to firm
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
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();;
