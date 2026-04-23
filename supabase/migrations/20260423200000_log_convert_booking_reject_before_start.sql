-- Só permite iniciar retirada a partir do início do período reservado (alinha com a UX do painel).

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

    IF v_booking.start_date > NOW() THEN
        RAISE EXCEPTION 'O horário de início da reserva ainda não foi atingido; não é possível iniciar a retirada.';
    END IF;

    IF v_booking.end_date < NOW() THEN
        RAISE EXCEPTION 'O período desta reserva já terminou; não é possível iniciar a retirada.';
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
