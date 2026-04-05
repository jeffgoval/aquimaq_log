create table if not exists client_error_logs (
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

alter table client_error_logs enable row level security;

-- Usuário autenticado pode registrar apenas seus próprios erros
create policy "authenticated users can log errors"
  on client_error_logs for insert
  to authenticated
  with check (user_id = auth.uid());

-- Erros antes do login (tela de auth) também precisam ser registrados
create policy "anon users can log errors"
  on client_error_logs for insert
  to anon
  with check (user_id is null);

-- Apenas service_role lê os logs (dashboard/suporte)
-- Nenhuma policy de select para authenticated/anon por segurança
