-- Splinter 0011: search_path imutável em funções
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.update_receivable_on_payment()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_total_paid numeric(12,2);
  v_final_amount numeric(12,2);
  v_new_status text;
begin
  select coalesce(sum(amount),0) into v_total_paid
  from public.receivable_payments
  where receivable_id = new.receivable_id;

  select final_amount into v_final_amount
  from public.receivables
  where id = new.receivable_id;

  if v_total_paid <= 0 then
    v_new_status := 'pending';
  elsif v_total_paid < v_final_amount then
    v_new_status := 'partially_paid';
  else
    v_new_status := 'paid';
  end if;

  update public.receivables
  set paid_amount = v_total_paid, status = v_new_status, updated_at = now()
  where id = new.receivable_id;

  return new;
end;
$$;

-- Splinter 0024: substituir FOR ALL + true por políticas separadas (escritas com auth.uid())
do $$
declare
  t text;
  tables text[] := array[
    'tractors',
    'operators',
    'clients',
    'services',
    'service_worklogs',
    'receivables',
    'receivable_payments',
    'machine_costs',
    'operator_ledger'
  ];
begin
  foreach t in array tables
  loop
    execute format('drop policy if exists "authenticated_full_access" on public.%I', t);
    execute format('drop policy if exists "authenticated_select" on public.%I', t);
    execute format('drop policy if exists "authenticated_insert" on public.%I', t);
    execute format('drop policy if exists "authenticated_update" on public.%I', t);
    execute format('drop policy if exists "authenticated_delete" on public.%I', t);

    execute format(
      'create policy "authenticated_select" on public.%I for select to authenticated using (true)',
      t
    );
    execute format(
      'create policy "authenticated_insert" on public.%I for insert to authenticated with check ((select auth.uid()) is not null)',
      t
    );
    execute format(
      'create policy "authenticated_update" on public.%I for update to authenticated using ((select auth.uid()) is not null) with check ((select auth.uid()) is not null)',
      t
    );
    execute format(
      'create policy "authenticated_delete" on public.%I for delete to authenticated using ((select auth.uid()) is not null)',
      t
    );
  end loop;
end;
$$;
