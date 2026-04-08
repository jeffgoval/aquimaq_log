export function normalizeClientName(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, ' ')
  if (!trimmed) return ''

  return trimmed
    .split(' ')
    .map((word) => {
      const w = word.trim()
      if (!w) return ''
      const lower = w.toLocaleLowerCase('pt-BR')
      return lower.charAt(0).toLocaleUpperCase('pt-BR') + lower.slice(1)
    })
    .filter(Boolean)
    .join(' ')
}

