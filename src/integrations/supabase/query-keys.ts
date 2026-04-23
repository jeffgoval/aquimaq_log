export const queryKeys = {
  tractors: ['tractors'] as const,
  tractorOptions: ['tractor-options'] as const,
  tractorById: (id: string) => ['tractors', id] as const,
  tractorLatestHourmeters: ['tractors', 'latest-hourmeters'] as const,
  tractorLatestHourmeter: (tractorId: string) => ['tractors', 'latest-hourmeter', tractorId] as const,
  operators: ['operators'] as const,
  operatorOptions: ['operator-options'] as const,
  operatorLedger: (operatorId: string) => ['operator-ledger', operatorId] as const,
  operatorLedgerRows: (operatorId: string) => ['operator-ledger-rows', operatorId] as const,
  clients: ['clients'] as const,
  clientOptions: ['client-options'] as const,
  services: ['services'] as const,
  serviceDetails: (serviceId: string) => ['services', serviceId] as const,
  worklogs: ['worklogs'] as const,
  worklogsByService: (serviceId: string) => ['worklogs', 'service', serviceId] as const,
  receivables: ['receivables'] as const,
  receivablesByService: (serviceId: string) => ['receivables', 'service', serviceId] as const,
  receivablesByClient: (clientId: string) => ['receivables', 'client', clientId] as const,
  receivablePayments: (receivableId: string) => ['receivable-payments', receivableId] as const,
  machineCosts: ['machine-costs'] as const,
  suppliers: ['suppliers'] as const,
  supplierOptions: ['supplier-options'] as const,
  machineCostsByTractor: (tractorId: string) => ['machine-costs', 'tractor', tractorId] as const,
  profitabilityTractors: (from: string | null, to: string | null) =>
    ['profitability', 'tractors', from, to] as const,
  profitabilityTrucks: (from: string | null, to: string | null) =>
    ['profitability', 'trucks', from, to] as const,
  profitabilityClients: (from: string | null, to: string | null) =>
    ['profitability', 'clients', from, to] as const,
  profitabilityFleetSpend: (from: string | null, to: string | null) =>
    ['profitability', 'fleet-spend-by-category', from, to] as const,
  profitabilityResources: (from: string | null, to: string | null) =>
    ['profitability', 'resources', from, to] as const,
  financialLedger: ['financial-ledger'] as const,
  documents: ['documents'] as const,
  domainEvents: ['domain-events'] as const,
} as const
