-- Normaliza nomes de clientes existentes (Title Case simples).
-- Nota: initcap() segue regras do Postgres e pode capitalizar preposições ("Da", "De") também.
update clients c
set name = initcap(lower(regexp_replace(trim(c.name), '\s+', ' ', 'g')))
where c.name is not null
  and c.name <> initcap(lower(regexp_replace(trim(c.name), '\s+', ' ', 'g')));

