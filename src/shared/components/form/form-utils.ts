import type { FieldError, FieldErrors, FieldPath, FieldValues } from 'react-hook-form'

/** Resolve mensagem de erro para campos simples ou aninhados (ex.: `items.0.name`). */
export const getFieldError = <T extends FieldValues>(
  errors: FieldErrors<T>,
  path: FieldPath<T>
): string | undefined => {
  const keys = String(path).split('.')
  let current: unknown = errors
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }
  if (current && typeof current === 'object' && 'message' in current) {
    const m = (current as FieldError).message
    return m !== undefined && m !== '' ? String(m) : undefined
  }
  return undefined
}
