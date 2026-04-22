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

  // Trucks
  TRUCKS: '/guinchos',
  TRUCK_NEW: '/guinchos/novo',
  TRUCK_DETAIL: (id: string) => `/guinchos/${id}`,
  TRUCK_EDIT: (id: string) => `/guinchos/${id}/editar`,

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

  // Resources
  RESOURCES: '/recursos',
  RESOURCE_NEW: '/recursos/novo',
  RESOURCE_DETAIL: (id: string) => `/recursos/${id}`,
  RESOURCE_EDIT: (id: string) => `/recursos/${id}/editar`,

  // Reservas
  BOOKINGS_CALENDAR: '/reservas',
  BOOKINGS_LIST: '/reservas/lista',
  BOOKING_NEW: '/reservas/nova',
  BOOKING_DETAIL: (id: string) => `/reservas/${id}`,

  // Account
  ACCOUNT: '/conta',
} as const
