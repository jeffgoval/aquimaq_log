-- Corrige update_receivable_on_payment para não repor 'pending' quando
-- a parcela já passou da data de vencimento (due_date < current_date).
-- Antes: qualquer pagamento zerado voltava sempre a 'pending'.
-- Depois: se v_total_paid <= 0 e due_date < current_date → 'overdue'.

create or replace function public.update_receivable_on_payment()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_total_paid   numeric(12,2);
  v_final_amount numeric(12,2);
  v_due_date     date;
  v_new_status   text;
begin
  select coalesce(sum(amount), 0) into v_total_paid
  from public.receivable_payments
  where receivable_id = new.receivable_id;

  select final_amount, due_date into v_final_amount, v_due_date
  from public.receivables
  where id = new.receivable_id;

  if v_total_paid <= 0 then
    -- Ainda sem pagamento: manter overdue se já venceu, senão pending
    if v_due_date < current_date then
      v_new_status := 'overdue';
    else
      v_new_status := 'pending';
    end if;
  elsif v_total_paid < v_final_amount then
    -- Pagamento parcial: overdue se venceu, senão partially_paid
    if v_due_date < current_date then
      v_new_status := 'overdue';
    else
      v_new_status := 'partially_paid';
    end if;
  else
    v_new_status := 'paid';
  end if;

  update public.receivables
  set paid_amount = v_total_paid, status = v_new_status, updated_at = now()
  where id = new.receivable_id;

  return new;
end;
$$;
