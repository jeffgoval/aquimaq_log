-- Nova view: concentração de receita por cliente.
-- Agrega faturamento, recebimentos, pendências e inadimplência por cliente.
-- Usado na seção "Análise por Cliente" da página de Rentabilidade.

create or replace view public.v_client_revenue with (security_invoker = on) as
select
  c.id                                                                          as client_id,
  c.name                                                                        as client_name,

  -- Número de serviços distintos prestados ao cliente
  count(distinct s.id)                                                          as service_count,

  -- Total faturado (excluindo parcelas canceladas)
  coalesce(
    sum(r.final_amount) filter (where r.status != 'cancelled'), 0
  )                                                                             as total_billed,

  -- Total efetivamente recebido
  coalesce(
    sum(r.paid_amount) filter (where r.status != 'cancelled'), 0
  )                                                                             as total_received,

  -- Saldo ainda em aberto (pendente, parcial ou vencido)
  coalesce(
    sum(r.final_amount - r.paid_amount)
      filter (where r.status in ('pending', 'partially_paid', 'overdue')), 0
  )                                                                             as total_pending,

  -- Valor vencido (parcelas com status overdue)
  coalesce(
    sum(r.final_amount - r.paid_amount) filter (where r.status = 'overdue'), 0
  )                                                                             as total_overdue

from public.clients c
left join public.services s on s.client_id = c.id
left join public.receivables r on r.client_id = c.id
group by c.id, c.name;
