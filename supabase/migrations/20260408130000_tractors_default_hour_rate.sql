-- Adiciona valor hora padrão ao trator para pré-preencher novos serviços.
alter table public.tractors
  add column if not exists default_hour_rate numeric(10,2) not null default 0;
