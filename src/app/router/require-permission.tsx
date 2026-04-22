import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/app/providers/auth-provider'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { ROUTES } from '@/shared/constants/routes'

interface RequirePermissionProps {
  permission: string
}

export function RequirePermission({ permission }: RequirePermissionProps) {
  const { isLoading, hasPermission } = useAuth()

  if (isLoading) return <AppLoadingState fullScreen />
  if (!hasPermission(permission)) return <Navigate to={ROUTES.DASHBOARD} replace />

  return <Outlet />
}
