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

export function parseSupabaseError(error: unknown): string {
  if (!error) return 'Erro desconhecido'
  if (isPostgrestError(error)) {
    return CODE_MESSAGES[error.code] ?? error.message ?? 'Erro inesperado'
  }
  if (error instanceof Error) return error.message
  return 'Erro inesperado'
}

export function isNotFoundError(error: unknown): boolean {
  return isPostgrestError(error) && error.code === 'PGRST116'
}
