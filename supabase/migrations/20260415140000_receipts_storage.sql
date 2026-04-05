-- Fotos de notas fiscais / recibos (Supabase Storage + referência na linha)

alter table public.machine_costs
  add column if not exists receipt_storage_path text null;

alter table public.services
  add column if not exists receipt_storage_path text null;

comment on column public.machine_costs.receipt_storage_path is 'Caminho no bucket receipts (ex.: machine-costs/{id}/arquivo.jpg).';
comment on column public.services.receipt_storage_path is 'Caminho no bucket receipts (ex.: services/{id}/arquivo.jpg).';

-- Bucket privado: leitura via signed URL no app
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'receipts',
  'receipts',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Idempotente se correres este bloco manualmente no SQL Editor
drop policy if exists "receipts_select_authenticated" on storage.objects;
drop policy if exists "receipts_insert_authenticated" on storage.objects;
drop policy if exists "receipts_update_authenticated" on storage.objects;
drop policy if exists "receipts_delete_authenticated" on storage.objects;

create policy "receipts_select_authenticated"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'receipts');

create policy "receipts_insert_authenticated"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'receipts');

create policy "receipts_update_authenticated"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'receipts')
  with check (bucket_id = 'receipts');

create policy "receipts_delete_authenticated"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'receipts');
