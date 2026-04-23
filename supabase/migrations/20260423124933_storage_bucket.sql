-- Storage bucket for client documents
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'client-documents',
  'client-documents',
  false,
  52428800,
  array['image/jpeg','image/png','image/webp','application/pdf','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/csv']
);

-- RLS for storage: firm members can access their own firm's documents
create policy "storage_firm_access" on storage.objects
  for all using (
    bucket_id = 'client-documents'
    and (storage.foldername(name))[1] = get_my_firm_id()::text
  );

-- Magic link access: clients can upload to their own folder via signed URL
create policy "storage_client_upload" on storage.objects
  for insert with check (
    bucket_id = 'client-documents'
  );;
