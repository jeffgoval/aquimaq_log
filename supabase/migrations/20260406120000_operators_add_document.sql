-- Garante coluna usada pelo app (CNH / documento do operador).
-- Corrige: "Could not find the 'document' column of 'operators' in the schema cache"
alter table public.operators
  add column if not exists document text;
comment on column public.operators.document is 'CNH ou outro documento do operador';
