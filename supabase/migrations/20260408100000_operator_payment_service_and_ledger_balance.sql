-- Pagamento ao operador por serviço (sem data fixa no negócio) + saldo global considerando pagamentos no ledger

alter table public.services
  add column if not exists operator_payment_status text not null default 'pending'
    check (operator_payment_status in ('pending', 'paid'));
alter table public.services
  add column if not exists operator_payment_date date null;
comment on column public.services.operator_payment_status is 'Se o dono já pagou o operador por este serviço.';
comment on column public.services.operator_payment_date is 'Data em que pagou (status pago) ou data prevista/lembrete (pendente).';
-- Saldo operador: ganho (horas × taxa padrão) − adiantamentos (vale) − pagamentos registados no ledger
-- DROP necessário: CREATE OR REPLACE não permite inserir coluna a meio da lista de colunas da vista.
drop view if exists public.v_operator_financial_balance;
create view public.v_operator_financial_balance with (security_invoker = on) as
select
  o.id as operator_id,
  o.name as operator_name,
  coalesce(wl.total_hours, 0) as total_hours_worked,
  coalesce(wl.total_hours * o.default_hour_rate, 0) as total_earned,
  coalesce(ledger.total_advances, 0) as total_advances,
  coalesce(ledger.total_payments, 0) as total_payments,
  coalesce(wl.total_hours * o.default_hour_rate, 0)
    - coalesce(ledger.total_advances, 0)
    - coalesce(ledger.total_payments, 0) as current_balance
from public.operators o
left join (
  select operator_id, sum(worked_hours) as total_hours
  from public.service_worklogs
  group by operator_id
) wl on wl.operator_id = o.id
left join (
  select
    operator_id,
    sum(amount) filter (where entry_type = 'advance') as total_advances,
    sum(amount) filter (where entry_type = 'payment') as total_payments
  from public.operator_ledger
  group by operator_id
) ledger on ledger.operator_id = o.id;
