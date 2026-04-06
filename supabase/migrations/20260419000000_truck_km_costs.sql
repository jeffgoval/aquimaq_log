-- Migração: Campos de custo por KM para caminhões/guinchos
-- useful_life_km: vida útil em km (para calcular depreciação/km)
-- fuel_cost_per_km: custo de combustível por km rodado

ALTER TABLE public.trucks
  ADD COLUMN IF NOT EXISTS useful_life_km numeric(10,0) NOT NULL DEFAULT 500000,
  ADD COLUMN IF NOT EXISTS fuel_cost_per_km numeric(10,4) NOT NULL DEFAULT 0;
