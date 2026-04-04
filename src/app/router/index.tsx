import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ProtectedRoute } from './protected-route'
import { AppLayout } from '@/app/layouts/app-layout'
import { AuthLayout } from '@/app/layouts/auth-layout'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { ROUTES } from '@/shared/constants/routes'

// Lazy-loaded pages
const LoginPage               = lazy(() => import('@/modules/auth/pages/login-page').then(m => ({ default: m.LoginPage })))
const RegisterPage            = lazy(() => import('@/modules/auth/pages/register-page').then(m => ({ default: m.RegisterPage })))
const ForgotPasswordPage      = lazy(() => import('@/modules/auth/pages/forgot-password-page').then(m => ({ default: m.ForgotPasswordPage })))
const DashboardPage           = lazy(() => import('@/modules/dashboard/pages/dashboard-page').then(m => ({ default: m.DashboardPage })))
const TractorListPage         = lazy(() => import('@/modules/tratores/pages/tractor-list-page').then(m => ({ default: m.TractorListPage })))
const TractorCreatePage       = lazy(() => import('@/modules/tratores/pages/tractor-create-page').then(m => ({ default: m.TractorCreatePage })))
const TractorDetailPage       = lazy(() => import('@/modules/tratores/pages/tractor-detail-page').then(m => ({ default: m.TractorDetailPage })))
const TractorEditPage         = lazy(() => import('@/modules/tratores/pages/tractor-edit-page').then(m => ({ default: m.TractorEditPage })))
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

const Fallback = () => <AppLoadingState fullScreen />

const router = createBrowserRouter([
  // Auth Routes
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTES.LOGIN, element: <Suspense fallback={<Fallback />}><LoginPage /></Suspense> },
      { path: ROUTES.REGISTER, element: <Suspense fallback={<Fallback />}><RegisterPage /></Suspense> },
      { path: ROUTES.FORGOT_PASSWORD, element: <Suspense fallback={<Fallback />}><ForgotPasswordPage /></Suspense> },
    ],
  },
  // Protected Routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.DASHBOARD,          element: <Suspense fallback={<Fallback />}><DashboardPage /></Suspense> },
          { path: ROUTES.TRACTORS,           element: <Suspense fallback={<Fallback />}><TractorListPage /></Suspense> },
          { path: ROUTES.TRACTOR_NEW,        element: <Suspense fallback={<Fallback />}><TractorCreatePage /></Suspense> },
          { path: '/tratores/:id',           element: <Suspense fallback={<Fallback />}><TractorDetailPage /></Suspense> },
          { path: '/tratores/:id/editar',    element: <Suspense fallback={<Fallback />}><TractorEditPage /></Suspense> },
          { path: ROUTES.OPERATORS,          element: <Suspense fallback={<Fallback />}><OperatorListPage /></Suspense> },
          { path: ROUTES.OPERATOR_NEW,       element: <Suspense fallback={<Fallback />}><OperatorCreatePage /></Suspense> },
          { path: '/operadores/:id/editar',  element: <Suspense fallback={<Fallback />}><OperatorEditPage /></Suspense> },
          { path: '/operadores/:id',         element: <Suspense fallback={<Fallback />}><OperatorDetailPage /></Suspense> },
          { path: ROUTES.CLIENTS,            element: <Suspense fallback={<Fallback />}><ClientListPage /></Suspense> },
          { path: ROUTES.CLIENT_NEW,         element: <Suspense fallback={<Fallback />}><ClientCreatePage /></Suspense> },
          { path: '/clientes/:id/editar',    element: <Suspense fallback={<Fallback />}><ClientEditPage /></Suspense> },
          { path: '/clientes/:id',           element: <Suspense fallback={<Fallback />}><ClientDetailPage /></Suspense> },
          { path: ROUTES.SUPPLIERS,          element: <Suspense fallback={<Fallback />}><SupplierListPage /></Suspense> },
          { path: ROUTES.SUPPLIER_NEW,      element: <Suspense fallback={<Fallback />}><SupplierCreatePage /></Suspense> },
          { path: '/fornecedores/:id/editar', element: <Suspense fallback={<Fallback />}><SupplierEditPage /></Suspense> },
          { path: '/fornecedores/:id',       element: <Suspense fallback={<Fallback />}><SupplierDetailPage /></Suspense> },
          { path: ROUTES.SERVICES,           element: <Suspense fallback={<Fallback />}><ServiceListPage /></Suspense> },
          { path: ROUTES.SERVICE_NEW,        element: <Suspense fallback={<Fallback />}><ServiceCreatePage /></Suspense> },
          { path: '/servicos/:id/editar',    element: <Suspense fallback={<Fallback />}><ServiceEditPage /></Suspense> },
          { path: '/servicos/:id',           element: <Suspense fallback={<Fallback />}><ServiceDetailPage /></Suspense> },
          { path: ROUTES.RECEIVABLES,        element: <Suspense fallback={<Fallback />}><ReceivableListPage /></Suspense> },
          { path: ROUTES.MACHINE_COSTS,      element: <Suspense fallback={<Fallback />}><MachineCostListPage /></Suspense> },
          { path: ROUTES.PROFITABILITY,      element: <Suspense fallback={<Fallback />}><ProfitabilityPage /></Suspense> },
        ],
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
