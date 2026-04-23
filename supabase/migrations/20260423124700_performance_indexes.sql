-- Indexes for common query patterns
create index idx_clients_firm_id on clients(firm_id);
create index idx_clients_status on clients(firm_id, status);
create index idx_tasks_client_id on compliance_tasks(client_id);
create index idx_tasks_firm_id on compliance_tasks(firm_id);
create index idx_tasks_due_date on compliance_tasks(firm_id, due_date);
create index idx_tasks_status on compliance_tasks(firm_id, status);
create index idx_audit_client on audit_log(client_id);
create index idx_audit_task on audit_log(task_id);
create index idx_audit_firm on audit_log(firm_id);
create index idx_audit_timestamp on audit_log(timestamp desc);
create index idx_magic_links_token on client_magic_links(token);
create index idx_magic_links_client on client_magic_links(client_id);
create index idx_docs_task on documents(task_id);
create index idx_docs_client on documents(client_id);

-- Auto-update updated_at on compliance_tasks
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_updated_at
  before update on compliance_tasks
  for each row execute function update_updated_at();;
