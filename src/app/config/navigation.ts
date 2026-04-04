import {
  LayoutDashboard,
  Tractor,
  Users,
  Building2,
  ClipboardList,
  DollarSign,
  Wrench,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { ROUTES } from '@/shared/constants/routes'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  children?: NavItem[]
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Tratores', href: ROUTES.TRACTORS, icon: Tractor },
  { label: 'Operadores', href: ROUTES.OPERATORS, icon: Users },
  { label: 'Clientes', href: ROUTES.CLIENTS, icon: Building2 },
  { label: 'Serviços', href: ROUTES.SERVICES, icon: ClipboardList },
  { label: 'Financeiro', href: ROUTES.RECEIVABLES, icon: DollarSign },
  { label: 'Custos', href: ROUTES.MACHINE_COSTS, icon: Wrench },
  { label: 'Rentabilidade', href: ROUTES.PROFITABILITY, icon: TrendingUp },
]
