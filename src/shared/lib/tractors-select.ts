/** Substrings no nome do trator que sobem ao topo do select (mais usado no dia a dia). */
const PRIORITY_SUBSTRINGS = ['carretadeira', 'carredadeira'] as const

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function priorityIndex(name: string): number {
  const n = norm(name)
  for (let i = 0; i < PRIORITY_SUBSTRINGS.length; i++) {
    if (n.includes(PRIORITY_SUBSTRINGS[i])) return i
  }
  return PRIORITY_SUBSTRINGS.length
}

/** Ordena para o dropdown: prioridade primeiro, depois nome (pt-BR). */
export function sortTractorsForSelect<T extends { id: string; name: string }>(list: T[] | undefined): T[] {
  if (!list?.length) return []
  return [...list].sort((a, b) => {
    const pa = priorityIndex(a.name)
    const pb = priorityIndex(b.name)
    if (pa !== pb) return pa - pb
    return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
  })
}

/** ID do primeiro trator que casa com a prioridade; vazio se nenhum. */
export function getPreferredTractorId(list: { id: string; name: string }[] | undefined): string {
  if (!list?.length) return ''
  const sorted = sortTractorsForSelect(list)
  const first = sorted[0]
  if (!first) return ''
  return priorityIndex(first.name) < PRIORITY_SUBSTRINGS.length ? first.id : ''
}
