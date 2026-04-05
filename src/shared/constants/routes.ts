export const ROUTES = {
  // Auth
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Dashboard
  DASHBOARD: '/',

  // Tractors
  TRACTORS: '/tratores',
  TRACTOR_NEW: '/tratores/novo',
  TRACTOR_DETAIL: (id: string) => `/tratores/${id}`,
  TRACTOR_EDIT: (id: string) => `/tratores/${id}/editar`,

  // Operators
  OPERATORS: '/operadores',
  OPERATOR_NEW: '/operadores/novo',
  OPERATOR_DETAIL: (id: string) => `/operadores/${id}`,
  OPERATOR_EDIT: (id: string) => `/operadores/${id}/editar`,

  // Clients
  CLIENTS: '/clientes',
  CLIENT_NEW: '/clientes/novo',
  CLIENT_DETAIL: (id: string) => `/clientes/${id}`,
  CLIENT_EDIT: (id: string) => `/clientes/${id}/editar`,

  // Suppliers (fornecedores)
  SUPPLIERS: '/fornecedores',
  SUPPLIER_NEW: '/fornecedores/novo',
  SUPPLIER_DETAIL: (id: string) => `/fornecedores/${id}`,
  SUPPLIER_EDIT: (id: string) => `/fornecedores/${id}/editar`,

  // Services
  SERVICES: '/servicos',
  SERVICE_NEW: '/servicos/novo',
  SERVICE_DETAIL: (id: string) => `/servicos/${id}`,
  SERVICE_EDIT: (id: string) => `/servicos/${id}/editar`,

  // Receivables
  RECEIVABLES: '/financeiro/receber',

  // Machine Costs
  MACHINE_COSTS: '/custos',

  // Profitability
  PROFITABILITY: '/rentabilidade',

  // Account
  ACCOUNT: '/conta',
} as const
