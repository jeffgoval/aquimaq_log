-- Reconstrói v_tractor_profitability excluindo receivables canceladas do cálculo
-- de receita bruta. Sem este filtro, parcelas com status 'cancelled' inflacionavam
-- gross_revenue e estimated_margin.

create or replace view public.v_tractor_profitability with (security_invoker = on) as
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
  where r.status != 'cancelled'
  group by s.tractor_id
) rev on rev.tractor_id = t.id;
