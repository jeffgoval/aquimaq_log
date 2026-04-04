-- Histórico de alterações por utilizador (auth.uid() na sessão Supabase)
create table if not exists public.audit_log (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users (id) on delete set null,
  action      text not null check (action in ('insert', 'update', 'delete')),
  table_name  text not null,
  record_id   text not null,
  old_row     jsonb,
  new_row     jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_audit_log_created_at on public.audit_log (created_at desc);
create index if not exists idx_audit_log_user_id on public.audit_log (user_id);
create index if not exists idx_audit_log_table_record on public.audit_log (table_name, record_id);

comment on table public.audit_log is 'Auditoria: quem alterou o quê (via PostgREST com JWT).';

-- SECURITY DEFINER: insere mesmo com RLS; auth.uid() continua a refletir o utilizador da sessão
create or replace function public.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_old jsonb;
  v_new jsonb;
begin
  v_uid := auth.uid();

  if tg_op in ('UPDATE', 'DELETE') and old is not null then
    v_old := row_to_json(old)::jsonb;
  end if;
  if tg_op in ('INSERT', 'UPDATE') and new is not null then
    v_new := row_to_json(new)::jsonb;
  end if;

  insert into public.audit_log (user_id, action, table_name, record_id, old_row, new_row)
  values (
    v_uid,
    lower(tg_op),
    tg_table_name::text,
    case
      when tg_op = 'DELETE' then old.id::text
      else new.id::text
    end,
    v_old,
    v_new
  );

  return coalesce(new, old);
end;
$$;

alter table public.audit_log enable row level security;

create policy "authenticated_select_audit_log"
  on public.audit_log
  for select
  to authenticated
  using (true);

-- Um trigger por tabela (evita auditar a própria audit_log)
create or replace trigger trg_audit_tractors
  after insert or update or delete on public.tractors
  for each row execute function public.audit_row_change();

create or replace trigger trg_audit_operators
  after insert or update or delete on public.operators
  for each row execute function public.audit_row_change();

create or replace trigger trg_audit_clients
  after insert or update or delete on public.clients
  for each row execute function public.audit_row_change();

create or replace trigger trg_audit_services
  after insert or update or delete on public.services
  for each row execute function public.audit_row_change();

create or replace trigger trg_audit_service_worklogs
  after insert or update or delete on public.service_worklogs
  for each row execute function public.audit_row_change();

create or replace trigger trg_audit_receivables
  after insert or update or delete on public.receivables
  for each row execute function public.audit_row_change();

create or replace trigger trg_audit_receivable_payments
  after insert or update or delete on public.receivable_payments
  for each row execute function public.audit_row_change();

create or replace trigger trg_audit_machine_costs
  after insert or update or delete on public.machine_costs
  for each row execute function public.audit_row_change();

create or replace trigger trg_audit_operator_ledger
  after insert or update or delete on public.operator_ledger
  for each row execute function public.audit_row_change();
