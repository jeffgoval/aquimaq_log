import { lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { AppRouteShell } from './scroll-to-top'
import { ProtectedRoute } from './protected-route'
import { AppLayout } from '@/app/layouts/app-layout'
import { AuthLayout } from '@/app/layouts/auth-layout'
import { ROUTES } from '@/shared/constants/routes'

// Lazy-loaded pages
const LoginPage               = lazy(() => import('@/modules/auth/pages/login-page').then(m => ({ default: m.LoginPage })))
const ForgotPasswordPage      = lazy(() => import('@/modules/auth/pages/forgot-password-page').then(m => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage       = lazy(() => import('@/modules/auth/pages/reset-password-page').then(m => ({ default: m.ResetPasswordPage })))
const AccountSettingsPage     = lazy(() => import('@/modules/conta/pages/account-settings-page').then(m => ({ default: m.AccountSettingsPage })))
const DashboardPage           = lazy(() => import('@/modules/dashboard/pages/dashboard-page').then(m => ({ default: m.DashboardPage })))
const TractorCreatePage       = lazy(() => import('@/modules/tratores/pages/tractor-create-page').then(m => ({ default: m.TractorCreatePage })))
const TractorDetailPage       = lazy(() => import('@/modules/tratores/pages/tractor-detail-page').then(m => ({ default: m.TractorDetailPage })))
const TractorEditPage         = lazy(() => import('@/modules/tratores/pages/tractor-edit-page').then(m => ({ default: m.TractorEditPage })))
const TruckCreatePage         = lazy(() => import('@/modules/caminhoes/pages/truck-create-page').then(m => ({ default: m.TruckCreatePage })))
const TruckDetailPage         = lazy(() => import('@/modules/caminhoes/pages/truck-detail-page').then(m => ({ default: m.TruckDetailPage })))
const TruckEditPage           = lazy(() => import('@/modules/caminhoes/pages/truck-edit-page').then(m => ({ default: m.TruckEditPage })))
const OperatorListPage        = lazy(() => import('@/modules/operadores/pages/operator-list-page').then(m => ({ default: m.OperatorListPage })))
const OperatorCreatePage      = lazy(() => import('@/modules/operadores/pages/operator-create-page').then(m => ({ default: m.OperatorCreatePage })))
const OperatorDetailPage      = lazy(() => import('@/modules/operadores/pages/operator-detail-page').then(m => ({ default: m.OperatorDetailPage })))
const OperatorEditPage        = lazy(() => import('@/modules/operadores/pages/operator-edit-page').then(m => ({ default: m.OperatorEditPage })))
const ClientListPage          = lazy(() => import('@/modules/clientes/pages/client-list-page').then(m => ({ default: m.ClientListPage })))
const ClientCreatePage        = lazy(() => import('@/modules/clientes/pages/client-create-page').then(m => ({ default: m.ClientCreatePage })))
const ClientDetailPage        = lazy(() => import('@/modules/clientes/pages/client-detail-page').then(m => ({ default: m.ClientDetailPage })))
const ClientEditPage          = lazy(() => import('@/modules/clientes/pages/client-edit-page').then(m => ({ default: m.ClientEditPage })))
const SupplierListPage        = lazy(() => import('@/modules/fornecedores/pages/supplier-list-page').then(m => ({ default: m.SupplierListPage })))
const SupplierCreatePage      = lazy(() => import('@/modules/fornecedores/pages/supplier-create-page').then(m => ({ default: m.SupplierCreatePage })))
const SupplierDetailPage      = lazy(() => import('@/modules/fornecedores/pages/supplier-detail-page').then(m => ({ default: m.SupplierDetailPage })))
const SupplierEditPage        = lazy(() => import('@/modules/fornecedores/pages/supplier-edit-page').then(m => ({ default: m.SupplierEditPage })))
const ServiceListPage         = lazy(() => import('@/modules/servicos/pages/service-list-page').then(m => ({ default: m.ServiceListPage })))
const ServiceCreatePage       = lazy(() => import('@/modules/servicos/pages/service-create-page').then(m => ({ default: m.ServiceCreatePage })))
const ServiceDetailPage       = lazy(() => import('@/modules/servicos/pages/service-detail-page').then(m => ({ default: m.ServiceDetailPage })))
const ServiceEditPage         = lazy(() => import('@/modules/servicos/pages/service-edit-page').then(m => ({ default: m.ServiceEditPage })))
const ReceivableListPage      = lazy(() => import('@/modules/financeiro/pages/receivable-list-page').then(m => ({ default: m.ReceivableListPage })))
const MachineCostListPage     = lazy(() => import('@/modules/custos/pages/machine-cost-list-page').then(m => ({ default: m.MachineCostListPage })))
const ProfitabilityPage       = lazy(() => import('@/modules/rentabilidade/pages/profitability-page').then(m => ({ default: m.ProfitabilityPage })))
const ResourceListPage        = lazy(() => import('@/modules/recursos/pages/resource-list-page').then(m => ({ default: m.ResourceListPage })))
const ResourceCreatePage      = lazy(() => import('@/modules/recursos/pages/resource-create-page').then(m => ({ default: m.ResourceCreatePage })))
const ResourceDetailPage      = lazy(() => import('@/modules/recursos/pages/resource-detail-page').then(m => ({ default: m.ResourceDetailPage })))
const ResourceEditPage        = lazy(() => import('@/modules/recursos/pages/resource-edit-page').then(m => ({ default: m.ResourceEditPage })))
const ReservasCalendarPage  = lazy(() => import('@/modules/reservas/pages/reservas-calendar-page').then(m => ({ default: m.ReservasCalendarPage })))
const ReservasCreatePage    = lazy(() => import('@/modules/reservas/pages/reservas-create-page').then(m => ({ default: m.ReservasCreatePage })))
const ReservasListPage      = lazy(() => import('@/modules/reservas/pages/reservas-list-page').then(m => ({ default: m.ReservasListPage })))
const router = createBrowserRouter([
  {
    element: <AppRouteShell />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: ROUTES.LOGIN, element: <LoginPage /> },
          { path: ROUTES.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
          { path: ROUTES.RESET_PASSWORD, element: <ResetPasswordPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: ROUTES.DASHBOARD,          element: <DashboardPage /> },
              { path: ROUTES.TRACTORS,           element: <Navigate to={`${ROUTES.RESOURCES}?type=tractor`} replace /> },
              { path: ROUTES.TRACTOR_NEW,        element: <TractorCreatePage /> },
              { path: '/tratores/:id',           element: <TractorDetailPage /> },
              { path: '/tratores/:id/editar',    element: <TractorEditPage /> },
              { path: ROUTES.TRUCKS,             element: <Navigate to={`${ROUTES.RESOURCES}?type=truck`} replace /> },
              { path: ROUTES.TRUCK_NEW,          element: <TruckCreatePage /> },
              { path: '/guinchos/:id',           element: <TruckDetailPage /> },
              { path: '/guinchos/:id/editar',    element: <TruckEditPage /> },
              { path: ROUTES.OPERATORS,          element: <OperatorListPage /> },
              { path: ROUTES.OPERATOR_NEW,       element: <OperatorCreatePage /> },
              { path: '/operadores/:id/editar',  element: <OperatorEditPage /> },
              { path: '/operadores/:id',         element: <OperatorDetailPage /> },
              { path: ROUTES.CLIENTS,            element: <ClientListPage /> },
              { path: ROUTES.CLIENT_NEW,         element: <ClientCreatePage /> },
              { path: '/clientes/:id/editar',    element: <ClientEditPage /> },
              { path: '/clientes/:id',           element: <ClientDetailPage /> },
              { path: ROUTES.SUPPLIERS,          element: <SupplierListPage /> },
              { path: ROUTES.SUPPLIER_NEW,      element: <SupplierCreatePage /> },
              { path: '/fornecedores/:id/editar', element: <SupplierEditPage /> },
              { path: '/fornecedores/:id',       element: <SupplierDetailPage /> },
              { path: ROUTES.SERVICES,           element: <ServiceListPage /> },
              { path: ROUTES.SERVICE_NEW,        element: <ServiceCreatePage /> },
              { path: '/servicos/:id/editar',    element: <ServiceEditPage /> },
              { path: '/servicos/:id',           element: <ServiceDetailPage /> },
              { path: ROUTES.RECEIVABLES,        element: <ReceivableListPage /> },
              { path: ROUTES.MACHINE_COSTS,      element: <MachineCostListPage /> },
              { path: ROUTES.PROFITABILITY,      element: <ProfitabilityPage /> },
              { path: ROUTES.RESOURCES,          element: <ResourceListPage /> },
              { path: ROUTES.RESOURCE_NEW,       element: <ResourceCreatePage /> },
              { path: '/recursos/:id',           element: <ResourceDetailPage /> },
              { path: '/recursos/:id/editar',    element: <ResourceEditPage /> },
              { path: ROUTES.BOOKINGS_CALENDAR,  element: <ReservasCalendarPage /> },
              { path: ROUTES.BOOKING_NEW,        element: <ReservasCreatePage /> },
              { path: ROUTES.BOOKINGS_LIST,      element: <ReservasListPage /> },
              { path: ROUTES.ACCOUNT,            element: <AccountSettingsPage /> },
            ],
          },
        ],
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
