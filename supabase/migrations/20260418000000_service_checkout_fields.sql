-- Migração: Campos de vistoria (checkout) na tabela services
-- Permite capturar foto e notas do estado do veículo antes do reboque

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS checkout_photo_path text,
  ADD COLUMN IF NOT EXISTS checkout_notes text;
