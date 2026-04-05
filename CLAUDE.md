# Aquimaq Log — Instruções para Agentes

## Supabase

**PROJETO CORRETO:** `hziovsgaqmrwthnlqobd`
URL: `https://hziovsgaqmrwthnlqobd.supabase.co`

Antes de qualquer operação no Supabase (migrations, link, push):
1. Verificar que o project ref bate com o `.env.local` (`VITE_SUPABASE_URL`)
2. Usar sempre `npm run db:push` — nunca `supabase db push` direto
3. Se `supabase link` falhar por permissão, **parar e pedir ao usuário para logar** com `npx supabase login`

Nunca usar outro projeto disponível em `supabase projects list` como fallback.
