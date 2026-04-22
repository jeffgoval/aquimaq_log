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
