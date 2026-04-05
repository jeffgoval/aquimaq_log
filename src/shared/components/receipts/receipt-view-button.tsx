import { useState, useEffect } from 'react'
import { FileImage } from 'lucide-react'
import { AppButton } from '@/shared/components/app/app-button'
import { useDisclosure } from '@/shared/hooks/use-disclosure'
import { getReceiptSignedUrl } from '@/integrations/supabase/receipts-storage'
import { ReceiptPhotoLightbox } from './receipt-photo-lightbox'
import { cn } from '@/shared/lib/cn'

export interface ReceiptViewButtonProps {
  storagePath: string
  label?: string
  className?: string
  size?: 'sm' | 'md'
  variant?: 'ghost' | 'secondary'
}

export const ReceiptViewButton = ({
  storagePath,
  label = 'Ver notinha',
  className,
  size = 'sm',
  variant = 'ghost',
}: ReceiptViewButtonProps) => {
  const lightbox = useDisclosure()
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!lightbox.isOpen) {
      setUrl(null)
      return
    }
    let cancelled = false
    setLoading(true)
    void (async () => {
      try {
        const signed = await getReceiptSignedUrl(storagePath)
        if (!cancelled) setUrl(signed)
      } catch {
        if (!cancelled) setUrl(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [lightbox.isOpen, storagePath])

  return (
    <>
      <AppButton
        type="button"
        variant={variant}
        size={size}
        className={cn('gap-1.5', className)}
        onClick={lightbox.open}
      >
        <FileImage className="h-4 w-4 shrink-0" />
        {label}
      </AppButton>
      <ReceiptPhotoLightbox
        open={lightbox.isOpen}
        imageUrl={url}
        loading={loading}
        onClose={lightbox.close}
      />
    </>
  )
}
