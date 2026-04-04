import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/app/providers/auth-provider'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'

export function ProtectedRoute() {
  const { session, isLoading } = useAuth()

  if (isLoading) return <AppLoadingState fullScreen />
  if (!session) return <Navigate to="/login" replace />

  return <Outlet />
}
