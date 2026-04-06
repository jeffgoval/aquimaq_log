-- Permite verificação automatizada pós-deploy (script com SUPABASE_SERVICE_ROLE_KEY).
-- authenticated já tinha EXECUTE na migração anterior.

grant execute on function public.fn_tractor_profitability_range(date, date) to service_role;
grant execute on function public.fn_truck_profitability_range(date, date) to service_role;
grant execute on function public.fn_fleet_spend_by_category_range(date, date) to service_role;
grant execute on function public.fn_client_revenue_range(date, date) to service_role;
