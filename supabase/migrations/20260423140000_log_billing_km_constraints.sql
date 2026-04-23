-- Cobrança por km (guincho): alinhar CHECK constraints com o schema da app (resource.schema + UI).

-- log_resources.billing_type
ALTER TABLE public.log_resources DROP CONSTRAINT IF EXISTS chk_log_resources_billing_type;

ALTER TABLE public.log_resources
  ADD CONSTRAINT chk_log_resources_billing_type
  CHECK (billing_type IN ('daily', 'hourly', 'fixed', 'km', 'equipment_15d', 'equipment_30d'));

-- log_resource_pricing.pricing_mode (nome padrão do Postgres + possíveis variantes)
ALTER TABLE public.log_resource_pricing DROP CONSTRAINT IF EXISTS log_resource_pricing_pricing_mode_check;

DO $$
DECLARE
  v_constraint_name text;
BEGIN
  LOOP
    SELECT c.conname INTO v_constraint_name
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND t.relname = 'log_resource_pricing'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) ILIKE '%pricing_mode%'
    LIMIT 1;

    EXIT WHEN NOT FOUND;
    EXECUTE format('ALTER TABLE public.log_resource_pricing DROP CONSTRAINT %I', v_constraint_name);
  END LOOP;
END $$;

ALTER TABLE public.log_resource_pricing
  ADD CONSTRAINT log_resource_pricing_pricing_mode_check
  CHECK (pricing_mode IN ('hourly', 'daily', 'fixed', 'km', 'equipment_15d', 'equipment_30d'));

-- log_bookings.pricing_mode (reservas podem referenciar a modalidade escolhida)
ALTER TABLE public.log_bookings DROP CONSTRAINT IF EXISTS chk_log_bookings_pricing_mode;

ALTER TABLE public.log_bookings
  ADD CONSTRAINT chk_log_bookings_pricing_mode
  CHECK (
    pricing_mode IS NULL
    OR pricing_mode IN ('hourly', 'daily', 'fixed', 'km', 'equipment_15d', 'equipment_30d')
  );

-- log_services.billing_type_snapshot
ALTER TABLE public.log_services DROP CONSTRAINT IF EXISTS chk_log_services_billing_type_snapshot;

ALTER TABLE public.log_services
  ADD CONSTRAINT chk_log_services_billing_type_snapshot
  CHECK (billing_type_snapshot IN ('daily', 'hourly', 'fixed', 'km', 'equipment_15d', 'equipment_30d'));

COMMENT ON CONSTRAINT chk_log_resources_billing_type ON public.log_resources IS
  'Modalidades de cobrança permitidas no cadastro do recurso (inclui km para guincho).';
