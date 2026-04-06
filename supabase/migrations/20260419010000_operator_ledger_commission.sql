-- Migração: Suporte a comissões no ledger do operador
-- Adiciona tipo 'commission' e campo commission_percent para guincho

-- 1. Remover constraint antiga e recriar incluindo 'commission'
ALTER TABLE public.operator_ledger
  DROP CONSTRAINT IF EXISTS operator_ledger_entry_type_check;

ALTER TABLE public.operator_ledger
  ADD CONSTRAINT operator_ledger_entry_type_check
  CHECK (entry_type IN ('advance', 'payment', 'credit', 'commission'));

-- 2. Percentual da comissão (ex.: 10.00 = 10%)
ALTER TABLE public.operator_ledger
  ADD COLUMN IF NOT EXISTS commission_percent numeric(5,2);
