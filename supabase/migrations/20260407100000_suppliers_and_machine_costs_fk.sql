-- Cadastro de fornecedores e ligação a custos de máquina
create table if not exists public.suppliers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address     text,
  phone       text,
  cnpj        text,
  is_active   boolean not null default true,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_suppliers_name on public.suppliers (name);

create or replace trigger suppliers_updated_at
  before update on public.suppliers
  for each row execute function public.set_updated_at();

alter table public.machine_costs
  add column if not exists supplier_id uuid references public.suppliers (id) on delete set null;

create index if not exists idx_machine_costs_supplier on public.machine_costs (supplier_id);

comment on table public.suppliers is 'Fornecedores (combustível, peças, oficina, etc.)';
comment on column public.machine_costs.supplier_id is 'Fornecedor cadastrado; supplier_name permanece para legado / texto livre';

alter table public.suppliers enable row level security;

drop policy if exists "authenticated_select" on public.suppliers;
drop policy if exists "authenticated_insert" on public.suppliers;
drop policy if exists "authenticated_update" on public.suppliers;
drop policy if exists "authenticated_delete" on public.suppliers;

create policy "authenticated_select" on public.suppliers for select to authenticated using (true);
create policy "authenticated_insert" on public.suppliers for insert to authenticated with check ((select auth.uid()) is not null);
create policy "authenticated_update" on public.suppliers for update to authenticated using ((select auth.uid()) is not null) with check ((select auth.uid()) is not null);
create policy "authenticated_delete" on public.suppliers for delete to authenticated using ((select auth.uid()) is not null);

create or replace trigger trg_audit_suppliers
  after insert or update or delete on public.suppliers
  for each row execute function public.audit_row_change();
