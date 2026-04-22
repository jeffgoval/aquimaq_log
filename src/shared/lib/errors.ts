import type { PostgrestError } from '@supabase/supabase-js'

const CODE_MESSAGES: Record<string, string> = {
  '23505': 'Este registro já existe (violação de unicidade)',
  '23503': 'Referência inválida — registro relacionado não encontrado',
  '23514': 'Os dados não atendem às restrições definidas',
  '42501': 'Permissão negada',
  'PGRST116': 'Nenhum resultado encontrado',
}

function isPostgrestError(err: unknown): err is PostgrestError {
  return typeof err === 'object' && err !== null && 'code' in err && 'message' in err
}

/** PostgREST sem a tabela no remoto (migration não aplicada ou cache desatualizado). */
export function isLogResourcePricingUnavailable(error: unknown): boolean {
  if (!isPostgrestError(error)) return false
  const blob = `${error.message ?? ''} ${error.details ?? ''} ${error.hint ?? ''}`.toLowerCase()
  return (
    blob.includes('log_resource_pricing')
    && (blob.includes('schema cache') || blob.includes('could not find the table'))
  )
}

/** Evita pedidos repetidos à API e toasts a cada gravação quando a tabela não existe no projeto remoto. */
export type LogResourcePricingRemoteState = 'unknown' | 'ok' | 'absent'

let logResourcePricingRemote: LogResourcePricingRemoteState = 'unknown'

export function getLogResourcePricingRemoteState(): LogResourcePricingRemoteState {
  return logResourcePricingRemote
}

export function markLogResourcePricingRemoteOk(): void {
  logResourcePricingRemote = 'ok'
}

export function markLogResourcePricingRemoteAbsent(): void {
  logResourcePricingRemote = 'absent'
}

let pricingTableDevWarned = false

/** Um único aviso em dev por sessão de bundle (evita spam na consola). */
export function warnLogResourcePricingMissingOnce(message: string): void {
  if (!import.meta.env.DEV || pricingTableDevWarned) return
  pricingTableDevWarned = true
  console.warn('[log_resource_pricing]', message)
}

const PRICING_TABLE_MESSAGE =
  'Tabela log_resource_pricing indisponível neste projeto Supabase. Depois de aplicar migrations no remoto, recarregue a página (F5).'

export function parseSupabaseError(error: unknown): string {
  if (!error) return 'Erro desconhecido'
  if (isPostgrestError(error)) {
    if (isLogResourcePricingUnavailable(error)) return PRICING_TABLE_MESSAGE
    return CODE_MESSAGES[error.code] ?? error.message ?? 'Erro inesperado'
  }
  if (error instanceof Error) return error.message
  return 'Erro inesperado'
}

export function isNotFoundError(error: unknown): boolean {
  return isPostgrestError(error) && error.code === 'PGRST116'
}
