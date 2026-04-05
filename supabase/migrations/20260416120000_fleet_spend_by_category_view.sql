-- Gastos da frota agregados por categoria (dashboard de rentabilidade).
-- Alinhado à lógica de v_tractor_profitability: operador = horas × taxa padrão;
-- diesel = combustível; manutenção = óleo, peças, manutenção e outros custos de máquina.
-- Exclui custos de máquina cancelados (não representam saída efetiva).

create or replace view public.v_fleet_spend_by_category
with (security_invoker = on) as
select
  coalesce((
    select sum(mc.amount)
    from public.machine_costs mc
    where mc.cost_type = 'fuel'
  ), 0)::numeric(14, 2) as spend_diesel,
  coalesce((
    select sum(mc.amount)
    from public.machine_costs mc
    where mc.cost_type in ('oil', 'parts', 'maintenance', 'other')
  ), 0)::numeric(14, 2) as spend_maintenance,
  coalesce((
    select sum(sw.worked_hours * o.default_hour_rate)
    from public.service_worklogs sw
    join public.operators o on o.id = sw.operator_id
    where sw.operator_id is not null
  ), 0)::numeric(14, 2) as spend_operator;

comment on view public.v_fleet_spend_by_category is
  'Soma única: diesel (fuel), manutenção/peças/óleo/outros (machine_costs), mão de obra (apontamentos).';
