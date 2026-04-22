import {
  LayoutDashboard,
  Users,
  Building2,
  Store,
  ClipboardList,
  DollarSign,
  Wrench,
  TrendingUp,
  UserCircle,
  CalendarCheck,
  Boxes,
  type LucideIcon,
} from 'lucide-react'
import { ROUTES } from '@/shared/constants/routes'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  children?: NavItem[]
  sectionLabel?: string
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Operadores', href: ROUTES.OPERATORS, icon: Users },
  { label: 'Clientes', href: ROUTES.CLIENTS, icon: Building2 },
  { label: 'Fornecedores', href: ROUTES.SUPPLIERS, icon: Store },
  { label: 'Recursos', href: ROUTES.RESOURCES, icon: Boxes },
  { label: 'Reservas', href: ROUTES.BOOKINGS_CALENDAR, icon: CalendarCheck },
  { label: 'Serviços', href: ROUTES.SERVICES, icon: ClipboardList },
  { label: 'Financeiro', href: ROUTES.RECEIVABLES, icon: DollarSign },
  { label: 'Custos', href: ROUTES.MACHINE_COSTS, icon: Wrench },
  { label: 'Rentabilidade', href: ROUTES.PROFITABILITY, icon: TrendingUp },
  { label: 'Minha conta', href: ROUTES.ACCOUNT, icon: UserCircle },
]

/** Barra inferior mobile (4 atalhos) — deriva de NAV_ITEMS para não duplicar rotas. */
const MOBILE_BOTTOM_HREFS: readonly string[] = [
  ROUTES.DASHBOARD,
  ROUTES.BOOKINGS_CALENDAR,
  ROUTES.SERVICES,
  ROUTES.RECEIVABLES,
]

export const MOBILE_BOTTOM_NAV: NavItem[] = MOBILE_BOTTOM_HREFS.map((href) => {
  const item = NAV_ITEMS.find((i) => i.href === href)
  if (!item) {
    throw new Error(`NAV_ITEMS: falta rota em MOBILE_BOTTOM_HREFS: ${href}`)
  }
  return item
})
