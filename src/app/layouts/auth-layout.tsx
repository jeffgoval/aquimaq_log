import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { Tractor } from 'lucide-react'

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-cat flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 text-center text-primary-foreground">
          <div className="flex items-center justify-center gap-3 mb-6">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="drop-shadow-md text-primary-foreground">
              <rect width="48" height="48" rx="12" fill="black" fillOpacity="0.12" />
              <path d="M8 32l8-12 6 8 6-10 12 14H8z" fill="currentColor"/>
              <circle cx="34" cy="18" r="4" fill="currentColor"/>
            </svg>
            <h1 className="typo-brand-display text-primary-foreground">Aquimaq Log</h1>
          </div>
          <p className="text-primary-foreground/90 text-base sm:text-lg max-w-sm leading-relaxed">
            Gestão de serviços de terraplenagem e guincho com controle total da frota.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <header className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shrink-0 shadow-sm">
                <Tractor className="h-7 w-7 text-primary-foreground" aria-hidden />
              </div>
              <h1 className="typo-brand-display text-foreground">
                Aquimaq Log
              </h1>
            </div>
          </header>
          <Suspense fallback={<AppLoadingState message="Carregando…" />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
