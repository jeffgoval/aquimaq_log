-- Rentabilidade com filtro de período (RPC) + rentabilidade por guincho (caminhão).
-- Regras de período:
--   Receita e apontamentos (horas/km): filtro por services.service_date.
--   Custos de máquina: filtro por machine_costs.cost_date.
--   p_start / p_end NULL = sem limite nesse extremo (visão acumulada, compatível com as views antigas).

-- ── Tratores ───────────────────────────────────────────────────────────────

create or replace function public.fn_tractor_profitability_range(
  p_start date default null,
  p_end date default null
)
returns table (
  tractor_id uuid,
  tractor_name text,
  purchase_value numeric,
  residual_value numeric,
  useful_life_hours integer,
  total_hours numeric,
  depreciation_cost numeric,
  operational_cost numeric,
  operator_cost numeric,
  gross_revenue numeric,
  revenue_per_hour numeric,
  cost_per_hour numeric,
  net_margin numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    t.id,
    t.name,
    t.purchase_value,
    t.residual_value,
    t.useful_life_hours,
    coalesce(wl.total_hours, 0)::numeric,
    coalesce(wl.total_hours * t.standard_hour_cost, 0)::numeric,
    coalesce(mc.operational_cost, 0)::numeric,
    coalesce(op_cost.operator_cost, 0)::numeric,
    coalesce(rev.gross_revenue, 0)::numeric,
    case when coalesce(wl.total_hours, 0) > 0
      then coalesce(rev.gross_revenue, 0) / wl.total_hours
      else 0::numeric
    end::numeric,
    case when coalesce(wl.total_hours, 0) > 0
      then (
        coalesce(wl.total_hours * t.standard_hour_cost, 0)
        + coalesce(mc.operational_cost, 0)
        + coalesce(op_cost.operator_cost, 0)
      ) / wl.total_hours
      else 0::numeric
    end::numeric,
    (
      coalesce(rev.gross_revenue, 0)
      - coalesce(wl.total_hours * t.standard_hour_cost, 0)
      - coalesce(mc.operational_cost, 0)
      - coalesce(op_cost.operator_cost, 0)
    )::numeric
  from public.tractors t
  left join (
    select sw.tractor_id, sum(sw.worked_hours) as total_hours
    from public.service_worklogs sw
    join public.services s on s.id = sw.service_id
    where sw.tractor_id is not null
      and (p_start is null or s.service_date >= p_start)
      and (p_end is null or s.service_date <= p_end)
    group by sw.tractor_id
  ) wl on wl.tractor_id = t.id
  left join (
    select mc.tractor_id, sum(mc.amount) as operational_cost
    from public.machine_costs mc
    where mc.tractor_id is not null
      and (p_start is null or mc.cost_date >= p_start)
      and (p_end is null or mc.cost_date <= p_end)
    group by mc.tractor_id
  ) mc on mc.tractor_id = t.id
  left join (
    select
      sw.tractor_id,
      sum(sw.worked_hours * o.default_hour_rate) as operator_cost
    from public.service_worklogs sw
    join public.operators o on o.id = sw.operator_id
    join public.services s on s.id = sw.service_id
    where sw.operator_id is not null
      and sw.tractor_id is not null
      and (p_start is null or s.service_date >= p_start)
      and (p_end is null or s.service_date <= p_end)
    group by sw.tractor_id
  ) op_cost on op_cost.tractor_id = t.id
  left join (
    select s.tractor_id, sum(r.final_amount) as gross_revenue
    from public.receivables r
    join public.services s on s.id = r.service_id
    where r.status <> 'cancelled'
      and s.tractor_id is not null
      and (p_start is null or s.service_date >= p_start)
      and (p_end is null or s.service_date <= p_end)
    group by s.tractor_id
  ) rev on rev.tractor_id = t.id;
$$;
comment on function public.fn_tractor_profitability_range(date, date) is
  'Rentabilidade por trator; período por data do serviço (receita/apont.) e data do custo (machine_costs).';
-- ── Guinchos ───────────────────────────────────────────────────────────────

create or replace function public.fn_truck_profitability_range(
  p_start date default null,
  p_end date default null
)
returns table (
  truck_id uuid,
  truck_name text,
  purchase_value numeric,
  residual_value numeric,
  useful_life_km numeric,
  fuel_cost_per_km numeric,
  total_km numeric,
  depreciation_cost numeric,
  operational_cost numeric,
  operator_cost numeric,
  gross_revenue numeric,
  revenue_per_km numeric,
  cost_per_km numeric,
  net_margin numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    t.id,
    t.name,
    t.purchase_value,
    t.residual_value,
    t.useful_life_km,
    t.fuel_cost_per_km,
    coalesce(wl.total_km, 0)::numeric,
    case
      when coalesce(t.useful_life_km, 0) > 0
      then coalesce(wl.total_km, 0) * (t.purchase_value - t.residual_value) / t.useful_life_km
      else 0::numeric
    end::numeric as depreciation_cost,
    coalesce(mc.operational_cost, 0)::numeric,
    coalesce(op_cost.operator_cost, 0)::numeric,
    coalesce(rev.gross_revenue, 0)::numeric,
    case when coalesce(wl.total_km, 0) > 0
      then coalesce(rev.gross_revenue, 0) / wl.total_km
      else 0::numeric
    end::numeric,
    case when coalesce(wl.total_km, 0) > 0
      then (
        case
          when coalesce(t.useful_life_km, 0) > 0
          then coalesce(wl.total_km, 0) * (t.purchase_value - t.residual_value) / t.useful_life_km
          else 0::numeric
        end
        + coalesce(mc.operational_cost, 0)
        + coalesce(op_cost.operator_cost, 0)
      ) / wl.total_km
      else 0::numeric
    end::numeric,
    (
      coalesce(rev.gross_revenue, 0)
      - case
          when coalesce(t.useful_life_km, 0) > 0
          then coalesce(wl.total_km, 0) * (t.purchase_value - t.residual_value) / t.useful_life_km
          else 0::numeric
        end
      - coalesce(mc.operational_cost, 0)
      - coalesce(op_cost.operator_cost, 0)
    )::numeric
  from public.trucks t
  left join (
    select sw.truck_id, sum(coalesce(sw.worked_km, 0)) as total_km
    from public.service_worklogs sw
    join public.services s on s.id = sw.service_id
    where sw.truck_id is not null
      and (p_start is null or s.service_date >= p_start)
      and (p_end is null or s.service_date <= p_end)
    group by sw.truck_id
  ) wl on wl.truck_id = t.id
  left join (
    select mc.truck_id, sum(mc.amount) as operational_cost
    from public.machine_costs mc
    where mc.truck_id is not null
      and (p_start is null or mc.cost_date >= p_start)
      and (p_end is null or mc.cost_date <= p_end)
    group by mc.truck_id
  ) mc on mc.truck_id = t.id
  left join (
    select
      sw.truck_id,
      sum(sw.worked_hours * o.default_hour_rate) as operator_cost
    from public.service_worklogs sw
    join public.operators o on o.id = sw.operator_id
    join public.services s on s.id = sw.service_id
    where sw.operator_id is not null
      and sw.truck_id is not null
      and (p_start is null or s.service_date >= p_start)
      and (p_end is null or s.service_date <= p_end)
    group by sw.truck_id
  ) op_cost on op_cost.truck_id = t.id
  left join (
    select s.truck_id, sum(r.final_amount) as gross_revenue
    from public.receivables r
    join public.services s on s.id = r.service_id
    where r.status <> 'cancelled'
      and s.truck_id is not null
      and (p_start is null or s.service_date >= p_start)
      and (p_end is null or s.service_date <= p_end)
    group by s.truck_id
  ) rev on rev.truck_id = t.id;
$$;
comment on function public.fn_truck_profitability_range(date, date) is
  'Rentabilidade por guincho: depreciação = km × (compra−residual)/vida útil km; custos via machine_costs.';
-- ── Gastos agregados frota ─────────────────────────────────────────────────

create or replace function public.fn_fleet_spend_by_category_range(
  p_start date default null,
  p_end date default null
)
returns table (
  spend_diesel numeric,
  spend_maintenance numeric,
  spend_operator numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    coalesce((
      select sum(mc.amount)
      from public.machine_costs mc
      where mc.cost_type = 'fuel'
        and (p_start is null or mc.cost_date >= p_start)
        and (p_end is null or mc.cost_date <= p_end)
    ), 0)::numeric(14, 2),
    coalesce((
      select sum(mc.amount)
      from public.machine_costs mc
      where mc.cost_type in ('oil', 'parts', 'maintenance', 'other')
        and (p_start is null or mc.cost_date >= p_start)
        and (p_end is null or mc.cost_date <= p_end)
    ), 0)::numeric(14, 2),
    coalesce((
      select sum(sw.worked_hours * o.default_hour_rate)
      from public.service_worklogs sw
      join public.operators o on o.id = sw.operator_id
      join public.services s on s.id = sw.service_id
      where sw.operator_id is not null
        and (p_start is null or s.service_date >= p_start)
        and (p_end is null or s.service_date <= p_end)
    ), 0)::numeric(14, 2);
$$;
-- ── Receita por cliente (parcelas dos serviços no período) ─────────────────

create or replace function public.fn_client_revenue_range(
  p_start date default null,
  p_end date default null
)
returns table (
  client_id uuid,
  client_name text,
  service_count bigint,
  total_billed numeric,
  total_received numeric,
  total_pending numeric,
  total_overdue numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    c.id,
    c.name,
    count(distinct s.id) filter (where s.id is not null),
    coalesce(
      sum(r.final_amount) filter (where r.status is distinct from 'cancelled'),
      0
    )::numeric,
    coalesce(
      sum(r.paid_amount) filter (where r.status is distinct from 'cancelled'),
      0
    )::numeric,
    coalesce(
      sum(r.final_amount - r.paid_amount)
        filter (where r.status in ('pending', 'partially_paid', 'overdue')),
      0
    )::numeric,
    coalesce(
      sum(r.final_amount - r.paid_amount) filter (where r.status = 'overdue'),
      0
    )::numeric
  from public.clients c
  left join public.services s
    on s.client_id = c.id
    and (p_start is null or s.service_date >= p_start)
    and (p_end is null or s.service_date <= p_end)
  left join public.receivables r on r.service_id = s.id
  group by c.id, c.name;
$$;
comment on function public.fn_client_revenue_range(date, date) is
  'Faturamento/recebimentos por cliente apenas para serviços cuja data está no período.';
grant execute on function public.fn_tractor_profitability_range(date, date) to authenticated;
grant execute on function public.fn_truck_profitability_range(date, date) to authenticated;
grant execute on function public.fn_fleet_spend_by_category_range(date, date) to authenticated;
grant execute on function public.fn_client_revenue_range(date, date) to authenticated;
