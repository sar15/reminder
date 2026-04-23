-- Missing FK indexes flagged by performance advisor
create index idx_users_firm_id on users(firm_id);
create index idx_audit_performed_by on audit_log(performed_by);
create index idx_magic_links_firm_id on client_magic_links(firm_id);
create index idx_tasks_assigned_to on compliance_tasks(assigned_to);
create index idx_documents_firm_id on documents(firm_id);
create index idx_templates_firm_id on reminder_templates(firm_id);;
