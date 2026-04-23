
-- 1. Atualiza constraint em log_resources (billing_type)
ALTER TABLE public.log_resources
  DROP CONSTRAINT chk_log_resources_billing_type;

ALTER TABLE public.log_resources
  ADD CONSTRAINT chk_log_resources_billing_type
  CHECK (billing_type = ANY (ARRAY[
    'daily'::text,
    'hourly'::text,
    'fixed'::text,
    'km'::text,
    'equipment_15d'::text,
    'equipment_30d'::text
  ]));

-- 2. Atualiza constraint em log_resource_pricing (pricing_mode)
ALTER TABLE public.log_resource_pricing
  DROP CONSTRAINT log_resource_pricing_pricing_mode_check;

ALTER TABLE public.log_resource_pricing
  ADD CONSTRAINT log_resource_pricing_pricing_mode_check
  CHECK (pricing_mode = ANY (ARRAY[
    'hourly'::text,
    'daily'::text,
    'fixed'::text,
    'km'::text,
    'equipment_15d'::text,
    'equipment_30d'::text
  ]));
;
