#!/usr/bin/env node
/**
 * Encerra um registo em log_services via RPC `log_close_service`.
 * Usa service role (não commitar a key). Lê `.env.local` ou `.env` na raiz do repo.
 *
 * Uso:
 *   node scripts/close-log-service.mjs <service_uuid>
 *   node scripts/close-log-service.mjs <service_uuid> --cancel
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function loadDotEnv() {
  for (const name of ['.env.local', '.env']) {
    const p = resolve(root, name)
    if (!existsSync(p)) continue
    for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      let val = trimmed.slice(eq + 1).trim()
      if (
        (val.startsWith('"') && val.endsWith('"'))
        || (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      if (process.env[key] === undefined) process.env[key] = val
    }
  }
}

loadDotEnv()

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const serviceId = process.argv[2]
const isCancel = process.argv.includes('--cancel')

if (!url || !serviceKey) {
  console.error(
    'Faltam variáveis: SUPABASE_URL (ou VITE_SUPABASE_URL) e SUPABASE_SERVICE_ROLE_KEY no .env.local',
  )
  process.exit(1)
}
if (!serviceId || serviceId.startsWith('-')) {
  console.error('Uso: node scripts/close-log-service.mjs <service_uuid> [--cancel]')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const { error } = await supabase.rpc('log_close_service', {
  p_service_id: serviceId,
  p_is_cancel: isCancel,
})

if (error) {
  console.error(error.message, error)
  process.exit(1)
}

console.log(isCancel ? 'Serviço cancelado (pro rata).' : 'Serviço encerrado (devolução).')
