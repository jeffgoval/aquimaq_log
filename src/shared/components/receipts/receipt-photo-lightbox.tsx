import { useEffect, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, X } from 'lucide-react'
import { AppButton } from '@/shared/components/app/app-button'
import { cn } from '@/shared/lib/cn'

export interface ReceiptPhotoLightboxProps {
  open: boolean
  imageUrl: string | null
  loading?: boolean
  onClose: () => void
  title?: string
}

export const ReceiptPhotoLightbox = ({
  open,
  imageUrl,
  loading = false,
  onClose,
  title = 'Notinha / recibo',
}: ReceiptPhotoLightboxProps) => {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  const handleCloseClick = (e: MouseEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    onClose()
  }

  const ui = (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/85 p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="flex items-center justify-between gap-3 mb-3 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-medium text-white truncate">{title}</p>
        <AppButton
          type="button"
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10 shrink-0"
          onClick={handleCloseClick}
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </AppButton>
      </div>
      <div
        className={cn(
          'flex-1 flex items-center justify-center min-h-0 rounded-lg overflow-hidden',
          loading && 'items-start pt-8',
        )}
        onClick={(e) => {
          e.stopPropagation()
          if (e.target === e.currentTarget) onClose()
        }}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-2 text-white/90">
            <Loader2 className="h-10 w-10 animate-spin" />
            <span className="text-sm">Carregando imagem…</span>
          </div>
        ) : null}
        {!loading && imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="max-h-[min(85vh,100%)] max-w-full object-contain rounded-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        ) : null}
        {!loading && !imageUrl ? (
          <p className="text-sm text-white/80">Não foi possível carregar a imagem.</p>
        ) : null}
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(ui, document.body) : null
}
