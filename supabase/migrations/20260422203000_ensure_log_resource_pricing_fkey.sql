-- PostgREST só infere embeds (log_resources -> log_resource_pricing) com FK explícita
-- no catálogo. Garante constraint nomeada se a tabela existir sem relação (ex.: deploy parcial).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class child ON child.oid = c.conrelid
    JOIN pg_class parent ON parent.oid = c.confrelid
    WHERE child.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      AND parent.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      AND child.relname = 'log_resource_pricing'
      AND parent.relname = 'log_resources'
      AND c.contype = 'f'
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'log_resource_pricing'
    ) THEN
      ALTER TABLE public.log_resource_pricing
        ADD CONSTRAINT log_resource_pricing_resource_id_fkey
        FOREIGN KEY (resource_id) REFERENCES public.log_resources (id);
    END IF;
  END IF;
END $$;
