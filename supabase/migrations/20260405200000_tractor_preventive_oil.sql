-- Manutenção preventiva: intervalo e referência de horímetro para troca de óleo
alter table public.tractors
  add column if not exists oil_change_interval_hours integer,
  add column if not exists oil_change_last_done_hourmeter numeric(10,2);

comment on column public.tractors.oil_change_interval_hours is 'Periodicidade da troca de óleo em horas (ex.: 250). Null = sem alerta.';
comment on column public.tractors.oil_change_last_done_hourmeter is 'Leitura do horímetro na última troca de óleo. Null = não configurado.';

alter table public.tractors
  drop constraint if exists tractors_oil_change_interval_hours_check;

alter table public.tractors
  add constraint tractors_oil_change_interval_hours_check
  check (oil_change_interval_hours is null or oil_change_interval_hours >= 1);

alter table public.tractors
  drop constraint if exists tractors_oil_change_last_done_hourmeter_check;

alter table public.tractors
  add constraint tractors_oil_change_last_done_hourmeter_check
  check (oil_change_last_done_hourmeter is null or oil_change_last_done_hourmeter >= 0);

-- Horímetro atual por trator (última leitura final registada nos apontamentos)
create or replace view public.v_tractor_latest_hourmeter
with (security_invoker = on) as
select
  tractor_id,
  max(end_hourmeter)::numeric(10,2) as latest_hourmeter
from public.service_worklogs
group by tractor_id;

comment on view public.v_tractor_latest_hourmeter is 'Maior horímetro final por trator, para alertas de manutenção preventiva.';
