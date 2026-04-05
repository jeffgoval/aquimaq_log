-- Desconto em valor (R$) concedido pelo dono da operação sobre a faturação apurada por horas.

alter table public.services
  add column if not exists owner_discount_amount numeric(12,2) not null default 0;

comment on column public.services.owner_discount_amount is 'Desconto fixo em R$ sobre a faturação bruta (horas × taxa); não afeta o custo de mão de obra apontada.';
