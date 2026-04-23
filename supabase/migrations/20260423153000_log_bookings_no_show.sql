-- No-show: reservas pendentes cujo período já passou — arquivadas do painel (status no_show),
-- mantendo o registo para auditoria. Não entram em conflitos de agenda (fora de pending/converted).

DO $migrate$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND t.relname = 'log_bookings'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%status%'
      AND pg_get_constraintdef(c.oid) LIKE '%pending%'
      AND pg_get_constraintdef(c.oid) LIKE '%converted%'
      AND pg_get_constraintdef(c.oid) LIKE '%completed%'
      AND pg_get_constraintdef(c.oid) LIKE '%cancelled%'
  LOOP
    EXECUTE format('ALTER TABLE public.log_bookings DROP CONSTRAINT %I', r.conname);
  END LOOP;
END$migrate$;

ALTER TABLE public.log_bookings
  ADD CONSTRAINT chk_log_bookings_status
  CHECK (status IN ('pending', 'converted', 'completed', 'cancelled', 'no_show'));

-- Reabertura manual (painel): evita que o RPC volte a marcar no_show na mesma hora.
ALTER TABLE public.log_bookings
  ADD COLUMN IF NOT EXISTS reopened_from_no_show_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN public.log_bookings.reopened_from_no_show_at IS
  'Preenchido ao repor uma reserva de no_show para pendente; o auto-arquivamento ignora pendentes reabertas após o fim do slot.';

-- Arquivar pendentes já vencidas (exceto reabertas pós-slot)
UPDATE public.log_bookings
SET status = 'no_show'
WHERE status = 'pending'
  AND deleted_at IS NULL
  AND end_date < NOW()
  AND (
    reopened_from_no_show_at IS NULL
    OR reopened_from_no_show_at < end_date
  );

CREATE OR REPLACE FUNCTION public.log_archive_expired_pending_bookings()
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
DECLARE
  n INTEGER;
BEGIN
  UPDATE public.log_bookings
  SET status = 'no_show'
  WHERE status = 'pending'
    AND deleted_at IS NULL
    AND end_date < NOW()
    AND (
      reopened_from_no_show_at IS NULL
      OR reopened_from_no_show_at < end_date
    );
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

REVOKE ALL ON FUNCTION public.log_archive_expired_pending_bookings() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.log_archive_expired_pending_bookings() FROM anon;
GRANT EXECUTE ON FUNCTION public.log_archive_expired_pending_bookings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_archive_expired_pending_bookings() TO service_role;

COMMENT ON FUNCTION public.log_archive_expired_pending_bookings() IS
  'Move reservas pending com end_date passado para status no_show (sem comparecimento / fora do painel).';

CREATE OR REPLACE FUNCTION public.log_convert_booking_to_service(
    p_booking_id UUID,
    p_operator_id UUID
) RETURNS UUID AS $$
DECLARE
    v_service_id UUID;
    v_booking log_bookings%ROWTYPE;
    v_resource log_resources%ROWTYPE;
    v_selected_pricing_mode TEXT;
    v_selected_rate NUMERIC(10,2);
BEGIN
    SELECT * INTO v_booking FROM log_bookings
    WHERE id = p_booking_id AND status = 'pending' AND deleted_at IS NULL
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reserva não encontrada ou não está mais pendente.';
    END IF;

    SELECT * INTO v_resource FROM log_resources WHERE id = v_booking.resource_id AND deleted_at IS NULL;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Recurso não encontrado.';
    END IF;

    UPDATE log_bookings SET status = 'converted', reopened_from_no_show_at = NULL WHERE id = p_booking_id;

    v_selected_pricing_mode := COALESCE(v_booking.pricing_mode, v_resource.billing_type);

    SELECT p.pricing_mode, p.rate
      INTO v_selected_pricing_mode, v_selected_rate
      FROM log_resource_pricing p
     WHERE p.resource_id = v_booking.resource_id
       AND p.pricing_mode = v_selected_pricing_mode
       AND p.is_active = TRUE
       AND p.deleted_at IS NULL
     LIMIT 1;

    IF v_selected_pricing_mode IS NULL OR v_selected_rate IS NULL THEN
      RAISE EXCEPTION 'Preço não configurado para a modalidade selecionada (%).', COALESCE(v_booking.pricing_mode, v_resource.billing_type);
    END IF;

    INSERT INTO log_services (
        booking_id, client_id, resource_id, operator_id,
        started_at, status,
        billing_type_snapshot, rate_snapshot
    ) VALUES (
        v_booking.id, v_booking.client_id, v_booking.resource_id, p_operator_id,
        NOW(), 'open',
        v_selected_pricing_mode, v_selected_rate
    ) RETURNING id INTO v_service_id;

    RETURN v_service_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER FUNCTION public.log_convert_booking_to_service(uuid, uuid)
  SET search_path = pg_catalog, public;
