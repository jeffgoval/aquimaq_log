-- Rentabilidade por equipamento (log_resources) com filtro de período.
-- Receita: log_services.total_amount (status closed ou cancelled com pro-rata).
-- Custos: machine_costs.amount filtrados por resource_id.

create or replace function public.fn_resource_profitability_range(
  p_start date default null,
  p_end   date default null
)
returns table (
  resource_id      uuid,
  resource_name    text,
  resource_type    text,
  resource_status  text,
  billing_type     text,
  services_count   bigint,
  total_usage      numeric,
  total_revenue    numeric,
  machine_cost     numeric,
  net_margin       numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    r.id,
    r.name,
    r.type,
    r.status,
    r.billing_type,
    coalesce(svc.cnt, 0),
    coalesce(svc.usage_qty, 0),
    coalesce(svc.revenue,   0),
    coalesce(mc.cost,       0),
    coalesce(svc.revenue,   0) - coalesce(mc.cost, 0)
  from public.log_resources r
  left join (
    select
      ls.resource_id,
      count(*)                            as cnt,
      sum(coalesce(ls.usage_quantity, 0)) as usage_qty,
      sum(coalesce(ls.total_amount,   0)) as revenue
    from public.log_services ls
    where ls.status in ('closed', 'cancelled')
      and ls.deleted_at is null
      and (p_start is null or ls.started_at::date >= p_start)
      and (p_end   is null or ls.started_at::date <= p_end)
    group by ls.resource_id
  ) svc on svc.resource_id = r.id
  left join (
    select mc.resource_id, sum(mc.amount) as cost
    from public.machine_costs mc
    where mc.resource_id is not null
      and (p_start is null or mc.cost_date >= p_start)
      and (p_end   is null or mc.cost_date <= p_end)
    group by mc.resource_id
  ) mc on mc.resource_id = r.id
  where r.deleted_at is null
  order by coalesce(svc.revenue, 0) desc nulls last
$$;
comment on function public.fn_resource_profitability_range(date, date) is
  'Rentabilidade por equipamento (log_resources): receita dos log_services (closed/cancelled) e custos via machine_costs.resource_id.';
grant execute on function public.fn_resource_profitability_range(date, date) to authenticated;
grant execute on function public.fn_resource_profitability_range(date, date) to service_role;
