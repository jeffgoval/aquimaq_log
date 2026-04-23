-- Logs de erro do browser (PostgREST). Schema explícito + grants para anon/authenticated insert.
create table if not exists public.client_error_logs (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        references auth.users(id) on delete set null,
  error_message    text        not null,
  error_stack      text,
  component_stack  text,
  page_url         text,
  user_agent       text,
  app_version      text,
  created_at       timestamptz not null default now()
);
comment on table public.client_error_logs is 'Erros capturados no browser (insert anon/authenticated). Leitura via service_role.';
alter table public.client_error_logs enable row level security;
drop policy if exists "authenticated users can log errors" on public.client_error_logs;
create policy "authenticated users can log errors"
  on public.client_error_logs for insert
  to authenticated
  with check (user_id = (select auth.uid()));
drop policy if exists "anon users can log errors" on public.client_error_logs;
create policy "anon users can log errors"
  on public.client_error_logs for insert
  to anon
  with check (user_id is null);
grant insert on table public.client_error_logs to anon, authenticated;
grant select, insert, update, delete on table public.client_error_logs to service_role;
