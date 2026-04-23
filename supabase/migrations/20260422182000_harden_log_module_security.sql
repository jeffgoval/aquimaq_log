-- ====================================================================================
-- Hardening: SECURITY DEFINER search_path, EXECUTE grants, booking validation
-- ====================================================================================

-- 1) search_path fixo — mitiga search_path hijacking em funções sensíveis
ALTER FUNCTION public.log_convert_booking_to_service(uuid, uuid)
  SET search_path = pg_catalog, public;
ALTER FUNCTION public.log_close_service(uuid, boolean)
  SET search_path = pg_catalog, public;
ALTER FUNCTION public.log_check_availability(uuid, timestamptz, timestamptz, uuid)
  SET search_path = pg_catalog, public;
ALTER FUNCTION public.log_prevent_overbooking()
  SET search_path = pg_catalog, public;
-- 2) RPCs / funções expostas: não expor em PUBLIC; apenas roles usuais do app Supabase
REVOKE ALL ON FUNCTION public.log_check_availability(uuid, timestamptz, timestamptz, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.log_check_availability(uuid, timestamptz, timestamptz, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.log_check_availability(uuid, timestamptz, timestamptz, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_check_availability(uuid, timestamptz, timestamptz, uuid) TO service_role;
-- Trigger-only: sem EXECUTE para clientes (o motor de triggers continua a invocar)
REVOKE ALL ON FUNCTION public.log_prevent_overbooking() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.log_prevent_overbooking() FROM anon;
REVOKE ALL ON FUNCTION public.log_convert_booking_to_service(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.log_convert_booking_to_service(uuid, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.log_convert_booking_to_service(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_convert_booking_to_service(uuid, uuid) TO service_role;
REVOKE ALL ON FUNCTION public.log_close_service(uuid, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.log_close_service(uuid, boolean) FROM anon;
GRANT EXECUTE ON FUNCTION public.log_close_service(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_close_service(uuid, boolean) TO service_role;
-- 3) Validação no banco: equipamento exige pricing_mode e modalidade ativa na tabela de preços
CREATE OR REPLACE FUNCTION public.log_validate_booking_equipment_pricing()
RETURNS TRIGGER AS $$
DECLARE
  v_type TEXT;
BEGIN
  IF NEW.deleted_at IS NOT NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.status NOT IN ('pending', 'converted') THEN
    RETURN NEW;
  END IF;

  SELECT r.type INTO v_type
  FROM public.log_resources r
  WHERE r.id = NEW.resource_id
    AND r.deleted_at IS NULL;

  IF v_type = 'equipment' THEN
    IF NEW.pricing_mode IS NULL THEN
      RAISE EXCEPTION 'Reserva de equipamento exige pricing_mode (modalidade de cobrança).';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.log_resource_pricing p
      WHERE p.resource_id = NEW.resource_id
        AND p.pricing_mode = NEW.pricing_mode
        AND p.is_active = TRUE
        AND p.deleted_at IS NULL
    ) THEN
      RAISE EXCEPTION 'Modalidade de cobrança inválida ou inativa para este equipamento (%).', NEW.pricing_mode;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = pg_catalog, public;
DROP TRIGGER IF EXISTS trg_log_bookings_validate_equipment_pricing ON public.log_bookings;
CREATE TRIGGER trg_log_bookings_validate_equipment_pricing
  BEFORE INSERT OR UPDATE ON public.log_bookings
  FOR EACH ROW
  WHEN (NEW.deleted_at IS NULL AND NEW.status IN ('pending', 'converted'))
  EXECUTE FUNCTION public.log_validate_booking_equipment_pricing();
REVOKE ALL ON FUNCTION public.log_validate_booking_equipment_pricing() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.log_validate_booking_equipment_pricing() FROM anon;
COMMENT ON TABLE public.log_resource_pricing IS
  'Preços por modalidade (fonte para reserva de equipamento). log_resources.billing_type/rate permanece referência legada/default para trator/guincho.';
