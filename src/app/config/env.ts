import { z } from 'zod'

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success && import.meta.env.PROD) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors)
  throw new Error('Invalid environment variables')
}

/**
 * Em desenvolvimento, variáveis em falta não devem derrubar a app (tela branca antes do React).
 * Usamos placeholders só para o módulo do cliente Supabase carregar; a UI mostra instruções.
 */
export const envConfigMessage: string | null = parsed.success
  ? null
  : 'Crie o ficheiro .env.local na raiz do projeto com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (veja .env.example).'

export const env: z.infer<typeof envSchema> = parsed.success
  ? parsed.data
  : {
      VITE_SUPABASE_URL: 'https://placeholder.invalid',
      VITE_SUPABASE_ANON_KEY: 'dev-placeholder-missing-env',
    }
