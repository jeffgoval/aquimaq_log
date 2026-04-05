-- Marca como 'overdue' todas as parcelas não pagas com vencimento anterior a hoje.
-- Função idempotente; pode ser chamada repetidamente sem efeitos colaterais.
create or replace function public.mark_overdue_receivables()
returns void
language sql
security definer
set search_path = public
as $$
  update public.receivables
  set status = 'overdue', updated_at = now()
  where status in ('pending', 'partially_paid')
    and due_date < current_date;
$$;
