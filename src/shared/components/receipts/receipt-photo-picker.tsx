import { useId, useRef, useEffect, useMemo, type ChangeEvent } from 'react'
import { Camera, ImagePlus, X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { AppButton } from '@/shared/components/app/app-button'

export interface ReceiptPhotoPickerProps {
  file: File | null
  onChange: (file: File | null) => void
  disabled?: boolean
  className?: string
  label?: string
}

export const ReceiptPhotoPicker = ({ file, onChange, disabled, className, label = 'Foto da notinha' }: ReceiptPhotoPickerProps) => {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handlePick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) onChange(f)
    e.target.value = ''
  }

  const clear = () => {
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={cn('space-y-2', className)}>
      <label className="field-label" htmlFor={inputId}>
        {label}
      </label>
      <p className="text-xs text-muted-foreground -mt-1">
        Use a câmera ou a galeria. A imagem é comprimida antes do envio.
      </p>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        capture="environment"
        className="sr-only"
        disabled={disabled}
        onChange={handlePick}
      />
      {!file ? (
        <div className="flex flex-wrap gap-2">
          <AppButton
            type="button"
            variant="secondary"
            size="md"
            disabled={disabled}
            className="gap-2"
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="h-4 w-4 shrink-0" />
            Tirar / anexar foto
          </AppButton>
        </div>
      ) : (
        <div className="relative rounded-lg border border-border bg-muted/30 overflow-hidden max-w-xs">
          {previewUrl ? (
            <img src={previewUrl} alt="Pré-visualização do recibo" className="w-full h-36 object-cover" />
          ) : null}
          <AppButton
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="absolute top-1 right-1 h-8 w-8 p-0 rounded-full bg-background/90 shadow-sm"
            onClick={clear}
            aria-label="Remover foto"
          >
            <X className="h-4 w-4" />
          </AppButton>
          <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-muted-foreground border-t border-border bg-card/80">
            <ImagePlus className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{file.name}</span>
          </div>
        </div>
      )}
    </div>
  )
}
