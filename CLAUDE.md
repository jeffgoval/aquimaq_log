# Aquimaq Log — Instruções para Agentes

## Supabase

**PROJETO CORRETO:** `hziovsgaqmrwthnlqobd`
URL: `https://hziovsgaqmrwthnlqobd.supabase.co`

Antes de qualquer operação no Supabase (migrations, link, push):
1. Verificar que o project ref bate com o `.env.local` (`VITE_SUPABASE_URL`)
2. Usar sempre `npm run db:push` — nunca `supabase db push` direto
3. Se `supabase link` falhar por permissão, **parar e pedir ao usuário para logar** com `npx supabase login`

Nunca usar outro projeto disponível em `supabase projects list` como fallback.

### Após alterar schema ou RPCs

1. `npm run db:push` (com login válido).
2. `npm run db:types` para regenerar `src/integrations/supabase/server-types.ts` — o CI corre `npm run verify:db-types` e falha se faltarem tokens críticos (`log_resource_pricing`, `pricing_mode`, etc.).
3. Funções `SECURITY DEFINER` devem manter `SET search_path = pg_catalog, public` e `REVOKE ... FROM PUBLIC` / `GRANT` explícitos às roles necessárias (ver migrations `*_harden_log_module_security.sql`).
