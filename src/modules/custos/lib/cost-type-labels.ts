/** Textos completos (formulários, detalhe). */
export const COST_TYPE_LABELS = {
  fuel: '⛽ Combustível',
  oil: '🛢️ Óleo',
  parts: '🔧 Peças',
  maintenance: '🔩 Manutenção',
  other: '📋 Outro',
} as const

/** Versão curta para badges em cartões (mais espaço para o nome do veículo no mobile). */
export const COST_TYPE_BADGE_LABELS = {
  fuel: '⛽ Comb.',
  oil: '🛢️ Óleo',
  parts: '🔧 Peças',
  maintenance: '🔩 Manut.',
  other: '📋 Outro',
} as const

export type CostTypeLabelKey = keyof typeof COST_TYPE_LABELS
