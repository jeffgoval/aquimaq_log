-- Enriquece v_tractor_profitability com:
--   operator_cost : custo real de mão de obra (horas × taxa padrão do operador)
--   net_margin    : margem completa (receita − depreciação − custos oper. − mão de obra)
--   revenue_per_hour : receita média por hora trabalhada
--   cost_per_hour    : custo total médio por hora (CPH — indicador padrão do setor)
--
-- Remove estimated_margin (que excluía mão de obra e era enganoso para precificação).

create or replace view public.v_tractor_profitability with (security_invoker = on) as
select
  t.id                                                    as tractor_id,
  t.name                                                  as tractor_name,
  coalesce(wl.total_hours, 0)                             as total_hours,
  coalesce(wl.total_hours * t.standard_hour_cost, 0)      as depreciation_cost,
  coalesce(mc.operational_cost, 0)                        as operational_cost,
  coalesce(op_cost.operator_cost, 0)                      as operator_cost,
  coalesce(rev.gross_revenue, 0)                          as gross_revenue,

  -- Receita por hora trabalhada
  case when coalesce(wl.total_hours, 0) > 0
    then coalesce(rev.gross_revenue, 0) / wl.total_hours
    else 0
  end                                                     as revenue_per_hour,

  -- CPH: custo total por hora (depreciação + operacional + mão de obra)
  case when coalesce(wl.total_hours, 0) > 0
    then (  coalesce(wl.total_hours * t.standard_hour_cost, 0)
          + coalesce(mc.operational_cost, 0)
          + coalesce(op_cost.operator_cost, 0)
         ) / wl.total_hours
    else 0
  end                                                     as cost_per_hour,

  -- Margem líquida real (todos os custos, incluindo operadores)
  coalesce(rev.gross_revenue, 0)
    - coalesce(wl.total_hours * t.standard_hour_cost, 0)
    - coalesce(mc.operational_cost, 0)
    - coalesce(op_cost.operator_cost, 0)                  as net_margin

from public.tractors t

-- Horas totais por trator (via horímetro)
left join (
  select tractor_id, sum(worked_hours) as total_hours
  from public.service_worklogs
  group by tractor_id
) wl on wl.tractor_id = t.id

-- Custos operacionais (combustível, peças, manutenção, etc.)
left join (
  select tractor_id, sum(amount) as operational_cost
  from public.machine_costs
  group by tractor_id
) mc on mc.tractor_id = t.id

-- Custo de mão de obra dos operadores (horas apontadas × taxa padrão)
left join (
  select
    sw.tractor_id,
    sum(sw.worked_hours * o.default_hour_rate) as operator_cost
  from public.service_worklogs sw
  join public.operators o on o.id = sw.operator_id
  where sw.operator_id is not null
  group by sw.tractor_id
) op_cost on op_cost.tractor_id = t.id

-- Receita bruta: somente parcelas não canceladas
left join (
  select s.tractor_id, sum(r.final_amount) as gross_revenue
  from public.receivables r
  join public.services s on s.id = r.service_id
  where r.status != 'cancelled'
  group by s.tractor_id
) rev on rev.tractor_id = t.id;
