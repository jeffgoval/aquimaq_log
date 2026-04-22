-- ====================================================================================
-- 1. CHECAGEM DE CONFLITOS E INDISPONIBILIDADE (PRD Item 8)
-- ====================================================================================
CREATE OR REPLACE FUNCTION log_check_availability(
    p_resource_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ,
    p_exclude_booking_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_conflict_count INT;
    v_resource_status TEXT;
BEGIN
    -- 1. Validar se o recurso está em manutenção ou inativo
    SELECT status INTO v_resource_status FROM log_resources WHERE id = p_resource_id AND deleted_at IS NULL;
    IF v_resource_status != 'available' THEN
        RETURN FALSE;
    END IF;

    -- 2. Validar sobreposição com Reservas ativas (pending ou converted)
    SELECT COUNT(*) INTO v_conflict_count
    FROM log_bookings
    WHERE resource_id = p_resource_id
      AND deleted_at IS NULL
      AND status IN ('pending', 'converted')
      AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id)
      AND (p_start_date < end_date) AND (p_end_date > start_date);
      
    IF v_conflict_count > 0 THEN
        RETURN FALSE;
    END IF;

    -- 3. Validar sobreposição com Serviços em andamento
    SELECT COUNT(*) INTO v_conflict_count
    FROM log_services
    WHERE resource_id = p_resource_id
      AND deleted_at IS NULL
      AND status IN ('open', 'in_progress')
      -- Se o serviço está em aberto/progresso, consideramos que vai até "o infinito" até ser fechado
      AND (p_start_date < COALESCE(ended_at, 'infinity'::TIMESTAMPTZ)) AND (p_end_date > started_at);

    IF v_conflict_count > 0 THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Trigger para bloquear overbooking garantido pelo banco (Never trust the client)
CREATE OR REPLACE FUNCTION log_prevent_overbooking()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT log_check_availability(NEW.resource_id, NEW.start_date, NEW.end_date, NEW.id) THEN
        RAISE EXCEPTION 'Recurso indisponível: Conflito de agenda ou em manutenção.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_overbooking
    BEFORE INSERT OR UPDATE ON log_bookings
    FOR EACH ROW
    WHEN (NEW.status IN ('pending', 'converted') AND NEW.deleted_at IS NULL)
    EXECUTE FUNCTION log_prevent_overbooking();


-- ====================================================================================
-- 2. TRANSAÇÃO ATÔMICA: CONVERSÃO DE RESERVA EM SERVIÇO (PRD Item 7.7)
-- ====================================================================================
CREATE OR REPLACE FUNCTION log_convert_booking_to_service(
    p_booking_id UUID,
    p_operator_id UUID
) RETURNS UUID AS $$
DECLARE
    v_service_id UUID;
    v_booking log_bookings%ROWTYPE;
    v_resource log_resources%ROWTYPE;
BEGIN
    -- 1. Travar a reserva para garantir atomicidade
    SELECT * INTO v_booking FROM log_bookings 
    WHERE id = p_booking_id AND status = 'pending' AND deleted_at IS NULL
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reserva não encontrada ou não está mais pendente.';
    END IF;

    -- 2. Carregar o snapshot do recurso
    SELECT * INTO v_resource FROM log_resources WHERE id = v_booking.resource_id AND deleted_at IS NULL;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Recurso não encontrado.';
    END IF;

    -- 3. Atualizar status da reserva
    UPDATE log_bookings SET status = 'converted' WHERE id = p_booking_id;

    -- 4. Criar o serviço carregando as regras atômicas
    INSERT INTO log_services (
        booking_id, client_id, resource_id, operator_id,
        started_at, status,
        billing_type_snapshot, rate_snapshot
    ) VALUES (
        v_booking.id, v_booking.client_id, v_booking.resource_id, p_operator_id,
        NOW(), 'open',
        v_resource.billing_type, v_resource.rate
    ) RETURNING id INTO v_service_id;

    RETURN v_service_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ====================================================================================
-- 3. ENGINE DE CÁLCULO: FECHAMENTO OU CANCELAMENTO PRO RATA (PRD Item 9)
-- ====================================================================================
CREATE OR REPLACE FUNCTION log_close_service(
    p_service_id UUID,
    p_is_cancel BOOLEAN DEFAULT FALSE
) RETURNS VOID AS $$
DECLARE
    v_service log_services%ROWTYPE;
    v_total_amount NUMERIC(10,2);
    v_usage_quantity NUMERIC(10,2);
    v_duration_seconds NUMERIC;
BEGIN
    -- 1. Travar serviço para evitar corrida
    SELECT * INTO v_service FROM log_services 
    WHERE id = p_service_id AND status IN ('open', 'in_progress') AND deleted_at IS NULL
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Serviço não encontrado ou já encerrado.';
    END IF;

    -- Tempo decorrido em segundos
    v_duration_seconds := EXTRACT(EPOCH FROM (NOW() - v_service.started_at));

    IF p_is_cancel THEN
        -- CANCELAMENTO (PRO RATA)
        IF v_service.billing_type_snapshot = 'daily' THEN
            v_usage_quantity := CEIL(v_duration_seconds / 86400);
            v_total_amount := v_service.rate_snapshot * v_usage_quantity;
        ELSIF v_service.billing_type_snapshot = 'hourly' THEN
            v_usage_quantity := CEIL(v_duration_seconds / 3600);
            v_total_amount := v_service.rate_snapshot * v_usage_quantity;
        ELSIF v_service.billing_type_snapshot = 'fixed' THEN
            v_usage_quantity := 0;
            v_total_amount := 0; -- Cancelamento de valor fixo não gera cobrança por padrão
        END IF;

        UPDATE log_services SET 
            status = 'cancelled',
            ended_at = NOW(),
            usage_quantity = v_usage_quantity,
            total_amount = v_total_amount,
            is_pro_rata = TRUE
        WHERE id = p_service_id;

        UPDATE log_bookings SET status = 'cancelled' WHERE id = v_service.booking_id;
    ELSE
        -- FECHAMENTO NORMAL
        IF v_service.billing_type_snapshot = 'daily' THEN
            v_usage_quantity := CEIL(v_duration_seconds / 86400);
            v_total_amount := v_service.rate_snapshot * v_usage_quantity;
        ELSIF v_service.billing_type_snapshot = 'hourly' THEN
            v_usage_quantity := CEIL(v_duration_seconds / 3600);
            v_total_amount := v_service.rate_snapshot * v_usage_quantity;
        ELSIF v_service.billing_type_snapshot = 'fixed' THEN
            v_usage_quantity := 1;
            v_total_amount := v_service.rate_snapshot;
        END IF;

        UPDATE log_services SET 
            status = 'closed',
            ended_at = NOW(),
            usage_quantity = v_usage_quantity,
            total_amount = v_total_amount
        WHERE id = p_service_id;

        UPDATE log_bookings SET status = 'completed' WHERE id = v_service.booking_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
