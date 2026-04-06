import type { Query } from '@tanstack/query-core'

/**
 * Limita o que vai para o localStorage: só listas/resumos estáveis.
 * Detalhes, rentabilidade, apontamentos e sub-chaves grandes não são persistidos
 * (menos JSON.parse no arranque e menos escrita na thread principal).
 */
export function shouldPersistQuery(query: Query): boolean {
  if (query.state.status !== 'success') return false

  const key = query.queryKey as unknown[]
  if (!Array.isArray(key) || key.length === 0) return false

  const root = key[0]
  if (typeof root !== 'string') return false

  const denyRoot = new Set([
    'profitability',
    'worklogs',
    'operator-ledger',
    'operator-ledger-rows',
    'receivable-payments',
    'documents',
    'domain-events',
    'financial-ledger',
  ])
  if (denyRoot.has(root)) return false

  if (root === 'receivables') {
    if (key[1] === 'service' || key[1] === 'client') return false
    return true
  }

  if (root === 'services' && key.length > 1) return false

  if (root === 'tractors') {
    if (key[1] === 'latest-hourmeters') return true
    if (key.length > 1) return false
    return true
  }

  if (root === 'trucks') return key[1] === 'list'

  if (root === 'machine-costs' && key.length > 1) return false

  if (['clients', 'operators', 'suppliers'].includes(root) && key.length > 1) return false

  const singleListRoots = new Set([
    'clients',
    'client-options',
    'operators',
    'operator-options',
    'suppliers',
    'supplier-options',
    'services',
    'machine-costs',
    'tractor-options',
  ])
  return singleListRoots.has(root) && key.length === 1
}
