-- ============================================================
-- Aquimaq Log — Initial Schema Migration
-- Project: frota (hziovsgaqmrwthnlqobd)
-- Apply via: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Tractors (equipment assets)
create table if not exists public.tractors (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  plate           text,
  brand           text,
  model           text,
  purchase_value  numeric(12,2) not null default 0,
  residual_value  numeric(12,2) not null default 0,
  useful_life_hours integer not null default 5000,
  standard_hour_cost numeric(10,4) generated always as (
    case when useful_life_hours > 0
    then (purchase_value - residual_value) / useful_life_hours
    else 0 end
  ) stored,
  is_active       boolean not null default true,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Operators
create table if not exists public.operators (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  phone               text,
  document            text,
  default_hour_rate   numeric(10,2) not null default 0,
  is_active           boolean not null default true,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Clients
create table if not exists public.clients (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  document    text,
  phone       text,
  email       text,
  notes       text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Services
create table if not exists public.services (
  id                      uuid primary key default uuid_generate_v4(),
  client_id               uuid not null references public.clients(id),
  tractor_id              uuid not null references public.tractors(id),
  primary_operator_id     uuid references public.operators(id),
  service_date            date not null,
  contracted_hour_rate    numeric(10,2) not null default 0,
  expected_hours          numeric(8,2),
  status                  text not null default 'draft'
                          check (status in ('draft','in_progress','completed','cancelled')),
  notes                   text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- Service Worklogs (hourmeter entries)
create table if not exists public.service_worklogs (
  id                uuid primary key default uuid_generate_v4(),
  service_id        uuid not null references public.services(id) on delete cascade,
  tractor_id        uuid not null references public.tractors(id),
  operator_id       uuid references public.operators(id),
  work_date         date not null,
  start_hourmeter   numeric(10,2) not null,
  end_hourmeter     numeric(10,2) not null,
  worked_hours      numeric(8,2) generated always as (end_hourmeter - start_hourmeter) stored,
  notes             text,
  created_at        timestamptz not null default now(),
  constraint service_worklogs_hourmeter_check check (end_hourmeter > start_hourmeter)
);

-- Receivables (installments)
create table if not exists public.receivables (
  id                  uuid primary key default uuid_generate_v4(),
  service_id          uuid references public.services(id) on delete cascade,
  client_id           uuid not null references public.clients(id),
  installment_number  integer not null default 1,
  installment_count   integer not null default 1,
  original_amount     numeric(12,2) not null,
  fee_percent         numeric(5,2) not null default 0,
  final_amount        numeric(12,2) not null,
  paid_amount         numeric(12,2) not null default 0,
  due_date            date not null,
  status              text not null default 'pending'
                      check (status in ('pending','partially_paid','paid','overdue','cancelled')),
  description         text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Receivable payments
create table if not exists public.receivable_payments (
  id              uuid primary key default uuid_generate_v4(),
  receivable_id   uuid not null references public.receivables(id) on delete cascade,
  amount          numeric(12,2) not null,
  payment_date    date not null,
  payment_method  text,
  notes           text,
  created_at      timestamptz not null default now()
);

-- Machine costs
create table if not exists public.machine_costs (
  id              uuid primary key default uuid_generate_v4(),
  tractor_id      uuid not null references public.tractors(id),
  service_id      uuid references public.services(id),
  cost_date       date not null,
  cost_type       text not null
                  check (cost_type in ('fuel','oil','parts','maintenance','other')),
  amount          numeric(12,2) not null,
  description     text,
  supplier_name   text,
  created_at      timestamptz not null default now()
);

-- Operator ledger (financial advances/payments to operators)
create table if not exists public.operator_ledger (
  id              uuid primary key default uuid_generate_v4(),
  operator_id     uuid not null references public.operators(id),
  service_id      uuid references public.services(id),
  entry_type      text not null check (entry_type in ('advance','payment','credit')),
  amount          numeric(12,2) not null,
  entry_date      date not null,
  notes           text,
  created_at      timestamptz not null default now()
);

-- INDEXES
create index if not exists idx_services_client_id    on public.services(client_id);
create index if not exists idx_services_tractor_id   on public.services(tractor_id);
create index if not exists idx_services_status        on public.services(status);
create index if not exists idx_receivables_client_id  on public.receivables(client_id);
create index if not exists idx_receivables_status     on public.receivables(status);
create index if not exists idx_receivables_due_date   on public.receivables(due_date);
create index if not exists idx_worklogs_service_id    on public.service_worklogs(service_id);
create index if not exists idx_machine_costs_tractor  on public.machine_costs(tractor_id);

-- UPDATED_AT triggers
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create or replace trigger tractors_updated_at  before update on public.tractors  for each row execute function public.set_updated_at();
create or replace trigger operators_updated_at before update on public.operators for each row execute function public.set_updated_at();
create or replace trigger clients_updated_at   before update on public.clients   for each row execute function public.set_updated_at();
create or replace trigger services_updated_at  before update on public.services  for each row execute function public.set_updated_at();
create or replace trigger receivables_updated  before update on public.receivables for each row execute function public.set_updated_at();

-- PAYMENT TRIGGER: auto-update receivable.paid_amount + status
create or replace function public.update_receivable_on_payment()
returns trigger language plpgsql as $$
declare
  v_total_paid numeric(12,2);
  v_final_amount numeric(12,2);
  v_new_status text;
begin
  select coalesce(sum(amount),0) into v_total_paid
  from public.receivable_payments
  where receivable_id = new.receivable_id;

  select final_amount into v_final_amount
  from public.receivables
  where id = new.receivable_id;

  if v_total_paid <= 0 then
    v_new_status := 'pending';
  elsif v_total_paid < v_final_amount then
    v_new_status := 'partially_paid';
  else
    v_new_status := 'paid';
  end if;

  update public.receivables
  set paid_amount = v_total_paid, status = v_new_status, updated_at = now()
  where id = new.receivable_id;

  return new;
end;
$$;

create or replace trigger trg_receivable_payment
after insert or update on public.receivable_payments
for each row execute function public.update_receivable_on_payment();

-- VIEWS: Operator financial balance
create or replace view public.v_operator_financial_balance as
select
  o.id as operator_id,
  o.name as operator_name,
  coalesce(wl.total_hours, 0) as total_hours_worked,
  coalesce(wl.total_hours * o.default_hour_rate, 0) as total_earned,
  coalesce(ledger.total_advances, 0) as total_advances,
  coalesce(wl.total_hours * o.default_hour_rate, 0) - coalesce(ledger.total_advances, 0) as current_balance
from public.operators o
left join (
  select operator_id, sum(worked_hours) as total_hours
  from public.service_worklogs
  group by operator_id
) wl on wl.operator_id = o.id
left join (
  select operator_id, sum(amount) filter (where entry_type = 'advance') as total_advances
  from public.operator_ledger
  group by operator_id
) ledger on ledger.operator_id = o.id;

-- VIEWS: Tractor profitability
create or replace view public.v_tractor_profitability as
select
  t.id as tractor_id,
  t.name as tractor_name,
  coalesce(wl.total_hours, 0) as total_hours,
  coalesce(wl.total_hours * t.standard_hour_cost, 0) as depreciation_cost,
  coalesce(mc.operational_cost, 0) as operational_cost,
  coalesce(rev.gross_revenue, 0) as gross_revenue,
  coalesce(rev.gross_revenue, 0)
    - coalesce(wl.total_hours * t.standard_hour_cost, 0)
    - coalesce(mc.operational_cost, 0) as estimated_margin
from public.tractors t
left join (
  select tractor_id, sum(worked_hours) as total_hours
  from public.service_worklogs
  group by tractor_id
) wl on wl.tractor_id = t.id
left join (
  select tractor_id, sum(amount) as operational_cost
  from public.machine_costs
  group by tractor_id
) mc on mc.tractor_id = t.id
left join (
  select s.tractor_id, sum(r.final_amount) as gross_revenue
  from public.receivables r
  join public.services s on s.id = r.service_id
  group by s.tractor_id
) rev on rev.tractor_id = t.id;

-- ROW LEVEL SECURITY
alter table public.tractors        enable row level security;
alter table public.operators       enable row level security;
alter table public.clients         enable row level security;
alter table public.services        enable row level security;
alter table public.service_worklogs enable row level security;
alter table public.receivables     enable row level security;
alter table public.receivable_payments enable row level security;
alter table public.machine_costs   enable row level security;
alter table public.operator_ledger enable row level security;

-- Default: authenticated users have full access (single-tenant)
create policy "authenticated_full_access" on public.tractors         for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on public.operators        for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on public.clients          for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on public.services         for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on public.service_worklogs for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on public.receivables      for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on public.receivable_payments for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on public.machine_costs    for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on public.operator_ledger  for all to authenticated using (true) with check (true);

-- After running this migration:
-- Regenerate types with:
-- npx supabase gen types typescript --project-id hziovsgaqmrwthnlqobd > src/integrations/supabase/server-types.ts
