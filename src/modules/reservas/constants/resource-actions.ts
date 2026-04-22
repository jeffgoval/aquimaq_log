export type ResourceType = 'tractor' | 'truck' | 'equipment'

export interface ResourceActions {
  requiresOperatorOnPickup: boolean
  canStartOperation: boolean
  canReturn: boolean
}

export const RESOURCE_ACTIONS_MAP: Record<ResourceType, ResourceActions> = {
  tractor: {
    requiresOperatorOnPickup: true,
    canStartOperation: true,
    canReturn: true,
  },
  truck: {
    requiresOperatorOnPickup: false,
    canStartOperation: false,
    // Guincho: sem fase “operação” separada, mas deve poder encerrar normalmente (devolução).
    canReturn: true,
  },
  equipment: {
    requiresOperatorOnPickup: false,
    canStartOperation: false,
    canReturn: true,
  },
}

export const getActionsByResourceType = (resourceType?: string): ResourceActions => {
  if (!resourceType || !(resourceType in RESOURCE_ACTIONS_MAP)) {
    return RESOURCE_ACTIONS_MAP.equipment
  }

  return RESOURCE_ACTIONS_MAP[resourceType as ResourceType]
}
