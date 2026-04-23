-- 7.6 Trigger updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- 7.4 Controle de Acesso (Adaptado para Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE,
    status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ DEFAULT NULL
);
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TABLE IF NOT EXISTS roles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL UNIQUE,
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ DEFAULT NULL
);
DROP TRIGGER IF EXISTS trg_roles_updated_at ON roles;
CREATE TRIGGER trg_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TABLE IF NOT EXISTS permissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            TEXT NOT NULL UNIQUE,
    module          TEXT NOT NULL,
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id   UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);
CREATE TABLE IF NOT EXISTS user_roles (
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);
-- 7.1 Resources -> log_resources
CREATE TABLE IF NOT EXISTS log_resources (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    type            TEXT NOT NULL CHECK (type IN ('tractor','truck','equipment')),
    billing_type    TEXT NOT NULL CHECK (billing_type IN ('daily','hourly','fixed')),
    rate            NUMERIC(10,2) NOT NULL CHECK (rate >= 0),
    brand           TEXT,
    model           TEXT,
    status          TEXT NOT NULL DEFAULT 'available'
                    CHECK (status IN ('available','maintenance','inactive')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID REFERENCES profiles(id),
    deleted_at      TIMESTAMPTZ DEFAULT NULL
);
DROP TRIGGER IF EXISTS trg_log_resources_updated_at ON log_resources;
CREATE TRIGGER trg_log_resources_updated_at
    BEFORE UPDATE ON log_resources
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- 7.2 Bookings -> log_bookings
CREATE TABLE IF NOT EXISTS log_bookings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID NOT NULL REFERENCES clients(id),
    resource_id     UUID NOT NULL REFERENCES log_resources(id),
    start_date      TIMESTAMPTZ NOT NULL,
    end_date        TIMESTAMPTZ NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','converted','completed','cancelled')),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID REFERENCES profiles(id),
    deleted_at      TIMESTAMPTZ DEFAULT NULL,
    CONSTRAINT chk_log_booking_dates CHECK (end_date > start_date)
);
DROP TRIGGER IF EXISTS trg_log_bookings_updated_at ON log_bookings;
CREATE TRIGGER trg_log_bookings_updated_at
    BEFORE UPDATE ON log_bookings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- 7.3 Services -> log_services
CREATE TABLE IF NOT EXISTS log_services (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id              UUID UNIQUE NOT NULL REFERENCES log_bookings(id),
    client_id               UUID NOT NULL REFERENCES clients(id),
    resource_id             UUID NOT NULL REFERENCES log_resources(id),
    operator_id             UUID REFERENCES profiles(id),
    started_at              TIMESTAMPTZ NOT NULL,
    in_progress_at          TIMESTAMPTZ,
    ended_at                TIMESTAMPTZ,
    status                  TEXT NOT NULL DEFAULT 'open'
                            CHECK (status IN ('open','in_progress','closed','cancelled')),
    billing_type_snapshot   TEXT NOT NULL CHECK (billing_type_snapshot IN ('daily','hourly','fixed')),
    rate_snapshot           NUMERIC(10,2) NOT NULL CHECK (rate_snapshot >= 0),
    usage_quantity          NUMERIC(10,2),
    total_amount            NUMERIC(10,2),
    is_pro_rata             BOOLEAN NOT NULL DEFAULT FALSE,
    notes                   TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by              UUID REFERENCES profiles(id),
    deleted_at              TIMESTAMPTZ DEFAULT NULL
);
DROP TRIGGER IF EXISTS trg_log_services_updated_at ON log_services;
CREATE TRIGGER trg_log_services_updated_at
    BEFORE UPDATE ON log_services
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- 7.5 Índices Críticos
CREATE INDEX IF NOT EXISTS idx_log_bookings_resource_dates
    ON log_bookings(resource_id, start_date, end_date)
    WHERE deleted_at IS NULL AND status NOT IN ('cancelled');
CREATE INDEX IF NOT EXISTS idx_log_services_resource_dates
    ON log_services(resource_id, started_at, ended_at)
    WHERE deleted_at IS NULL AND status NOT IN ('cancelled','closed');
CREATE INDEX IF NOT EXISTS idx_log_services_operator ON log_services(operator_id);
CREATE INDEX IF NOT EXISTS idx_log_resources_active    ON log_resources(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_log_bookings_active     ON log_bookings(id)  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_log_services_active     ON log_services(id)  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_active         ON profiles(id)      WHERE deleted_at IS NULL;
-- 12. Seed de Permissões
INSERT INTO permissions (code, module, description) VALUES
  ('calendar.view',               'calendar', 'Visualizar calendário'),
  ('bookings.view',               'bookings', 'Visualizar reservas'),
  ('bookings.create',             'bookings', 'Criar reservas'),
  ('bookings.update',             'bookings', 'Editar reservas'),
  ('bookings.cancel',             'bookings', 'Cancelar reservas'),
  ('bookings.convert_to_service', 'bookings', 'Converter reserva em serviço'),
  ('services.view',               'services', 'Visualizar serviços'),
  ('services.update_status',      'services', 'Atualizar status do serviço'),
  ('services.close',              'services', 'Encerrar serviço'),
  ('users.manage',                'users',    'Gerenciar usuários'),
  ('settings.manage',             'settings', 'Gerenciar configurações'),
  ('financial.view',              'financial','Visualizar financeiro')
ON CONFLICT (code) DO NOTHING;
INSERT INTO roles (name, description) VALUES ('scheduler', 'Scheduler Role') ON CONFLICT (name) DO NOTHING;
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'scheduler'
  AND p.code IN (
    'calendar.view',
    'bookings.view', 'bookings.create', 'bookings.update',
    'bookings.cancel', 'bookings.convert_to_service',
    'services.view', 'services.update_status', 'services.close'
  )
ON CONFLICT DO NOTHING;
