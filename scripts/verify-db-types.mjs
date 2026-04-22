/**
 * Guard leve: garante que server-types.ts contém colunas/tabelas críticas do módulo log.
 * Não substitui `npm run db:types` (fonte de verdade continua a ser o schema remoto).
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const typesPath = join(__dirname, '..', 'src', 'integrations', 'supabase', 'server-types.ts')

const required = [
  'log_resource_pricing',
  'pricing_mode',
  'log_bookings',
  'log_resources',
]

const content = readFileSync(typesPath, 'utf8')
const missing = required.filter((token) => !content.includes(token))

if (missing.length > 0) {
  console.error('[verify-db-types] Faltam tokens em server-types.ts:', missing.join(', '))
  console.error('[verify-db-types] Corre após login: npm run db:types')
  process.exit(1)
}

console.log('[verify-db-types] OK — tokens críticos presentes em server-types.ts')
