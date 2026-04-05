-- Migração: Suporte para Guincho / Logística
-- Criação de tabela separada para caminhões e adaptação polimórfica das tabelas relacionadas

-- 1. Criação da Tabela `trucks` (Caminhões/Guinchos)
create table if not exists public.trucks (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  plate           text,
  brand           text,
  model           text,
  purchase_value  numeric(12,2) not null default 0,
  residual_value  numeric(12,2) not null default 0,
  current_odometer numeric(12,2) not null default 0,
  is_active       boolean not null default true,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- RLS & Policies para trucks
alter table public.trucks enable row level security;
create policy "authenticated_select" on public.trucks for select to authenticated using (true);
create policy "authenticated_insert" on public.trucks for insert to authenticated with check ((select auth.uid()) is not null);
create policy "authenticated_update" on public.trucks for update to authenticated using ((select auth.uid()) is not null) with check ((select auth.uid()) is not null);
create policy "authenticated_delete" on public.trucks for delete to authenticated using ((select auth.uid()) is not null);

-- Atualização do Trigger updated_at para trucks
create trigger trucks_updated_at before update on public.trucks for each row execute function public.set_updated_at();

-- 2. Atualização Polimórfica: services
alter table public.services 
  alter column tractor_id drop not null,
  add column truck_id uuid references public.trucks(id),
  add column towed_vehicle_plate text,
  add column towed_vehicle_brand text,
  add column towed_vehicle_model text,
  add column origin_location text,
  add column destination_location text,
  add column charge_type text not null default 'por_hora' check (charge_type in ('valor_fixo','por_km','por_hora'));

-- Garantir que serviço esteja referenciado a 1 e apenas 1 veículo
alter table public.services
  add constraint services_vehicle_check 
  check ((tractor_id is not null and truck_id is null) or (tractor_id is null and truck_id is not null));

create index if not exists idx_services_truck_id on public.services(truck_id);

-- 3. Atualização Polimórfica: service_worklogs
alter table public.service_worklogs drop constraint if exists service_worklogs_hourmeter_check;

alter table public.service_worklogs 
  alter column tractor_id drop not null,
  add column truck_id uuid references public.trucks(id),
  alter column start_hourmeter drop not null,
  alter column end_hourmeter drop not null,
  add column start_odometer numeric(10,2),
  add column end_odometer numeric(10,2),
  add column worked_km numeric(10,2) generated always as (end_odometer - start_odometer) stored;

-- Garantir 1 e apenas 1 veículo
alter table public.service_worklogs
  add constraint service_worklogs_vehicle_check 
  check ((tractor_id is not null and truck_id is null) or (tractor_id is null and truck_id is not null));

-- Regras reestruturadas para os horímetros/odômetros (podem ser nulos agora, mas continuam exigindo lógica progressiva se presentes)
alter table public.service_worklogs
  add constraint service_worklogs_hourmeter_check
  check (
    (start_hourmeter is null and end_hourmeter is null) or 
    (start_hourmeter is not null and end_hourmeter is not null and end_hourmeter >= start_hourmeter)
  );

alter table public.service_worklogs
  add constraint service_worklogs_odometer_check
  check (
    (start_odometer is null and end_odometer is null) or 
    (start_odometer is not null and end_odometer is not null and end_odometer >= start_odometer)
  );

-- 4. Atualização Polimórfica: machine_costs
alter table public.machine_costs
  alter column tractor_id drop not null,
  add column truck_id uuid references public.trucks(id);

alter table public.machine_costs
  add constraint machine_costs_vehicle_check 
  check ((tractor_id is not null and truck_id is null) or (tractor_id is null and truck_id is not null));

create index if not exists idx_machine_costs_truck_id on public.machine_costs(truck_id);
