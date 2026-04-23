-- ====================================================================================
-- Equipment pricing modes (hourly, daily, 15d, 30d)
-- ====================================================================================

-- 1) Booking may carry selected pricing mode (mainly for equipment).
ALTER TABLE public.log_bookings
ADD COLUMN IF NOT EXISTS pricing_mode TEXT;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_log_bookings_pricing_mode'
      AND conrelid = 'public.log_bookings'::regclass
  ) THEN
    ALTER TABLE public.log_bookings
    ADD CONSTRAINT chk_log_bookings_pricing_mode
    CHECK (
      pricing_mode IS NULL
      OR pricing_mode IN ('hourly', 'daily', 'fixed', 'equipment_15d', 'equipment_30d')
    );
  END IF;
END $$;
-- 2) Expand resource billing types to support package modes.
DO $$
DECLARE
  v_constraint_name text;
BEGIN
  SELECT conname INTO v_constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.log_resources'::regclass
    AND pg_get_constraintdef(oid) ILIKE '%billing_type%'
  LIMIT 1;

  IF v_constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.log_resources DROP CONSTRAINT %I', v_constraint_name);
  END IF;
END $$;
ALTER TABLE public.log_resources
ADD CONSTRAINT chk_log_resources_billing_type
CHECK (billing_type IN ('daily', 'hourly', 'fixed', 'equipment_15d', 'equipment_30d'));
-- 3) Service snapshot must accept selected package mode too.
DO $$
DECLARE
  v_constraint_name text;
BEGIN
  SELECT conname INTO v_constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.log_services'::regclass
    AND pg_get_constraintdef(oid) ILIKE '%billing_type_snapshot%'
  LIMIT 1;

  IF v_constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.log_services DROP CONSTRAINT %I', v_constraint_name);
  END IF;
END $$;
ALTER TABLE public.log_services
ADD CONSTRAINT chk_log_services_billing_type_snapshot
CHECK (billing_type_snapshot IN ('daily', 'hourly', 'fixed', 'equipment_15d', 'equipment_30d'));
-- 4) Pricing table by mode (source-of-truth for selectable prices).
CREATE TABLE IF NOT EXISTS public.log_resource_pricing (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id   UUID NOT NULL REFERENCES public.log_resources(id),
  pricing_mode  TEXT NOT NULL
               CHECK (pricing_mode IN ('hourly', 'daily', 'fixed', 'equipment_15d', 'equipment_30d')),
  rate          NUMERIC(10,2) NOT NULL CHECK (rate >= 0),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by    UUID REFERENCES public.profiles(id),
  deleted_at    TIMESTAMPTZ DEFAULT NULL
);
DROP TRIGGER IF EXISTS trg_log_resource_pricing_updated_at ON public.log_resource_pricing;
CREATE TRIGGER trg_log_resource_pricing_updated_at
BEFORE UPDATE ON public.log_resource_pricing
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE UNIQUE INDEX IF NOT EXISTS idx_log_resource_pricing_unique_active_mode
  ON public.log_resource_pricing(resource_id, pricing_mode)
  WHERE deleted_at IS NULL AND is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_log_resource_pricing_resource
  ON public.log_resource_pricing(resource_id)
  WHERE deleted_at IS NULL;
-- 5) Backfill with current pricing model to keep old resources working.
INSERT INTO public.log_resource_pricing (resource_id, pricing_mode, rate, is_active, created_at, updated_at)
SELECT
  r.id,
  r.billing_type,
  r.rate,
  TRUE,
  NOW(),
  NOW()
FROM public.log_resources r
WHERE r.deleted_at IS NULL
ON CONFLICT DO NOTHING;
