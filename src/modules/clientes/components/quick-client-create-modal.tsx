import { createPortal } from 'react-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { AppButton } from '@/shared/components/app/app-button'
import { AppPhoneInput } from '@/shared/components/app/app-numeric-input'
import { clientSchema, type ClientInput } from '@/modules/clientes/schemas/client.schema'
import { useCreateClient } from '@/modules/clientes/hooks/use-client-queries'
import { queryKeys } from '@/integrations/supabase/query-keys'

export interface QuickClientCreateModalProps {
  onClose: () => void
  onCreated: (id: string, name: string) => void
}

export const QuickClientCreateModal = ({ onClose, onCreated }: QuickClientCreateModalProps) => {
  const qc = useQueryClient()
  const create = useCreateClient()
  const form = useForm<ClientInput>({
    resolver: zodResolver(clientSchema) as Resolver<ClientInput>,
    defaultValues: { name: '', is_active: true },
  })
  const { register, control, formState: { errors } } = form

  const onSubmit = form.handleSubmit(async (values) => {
    const created = await create.mutateAsync(values)
    await qc.refetchQueries({ queryKey: queryKeys.clientOptions })
    const name = values.name.trim() || String(created.name ?? '').trim()
    onCreated(String(created.id), name)
  })

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">Cadastrar novo cliente</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Preencha o nome para continuar. Os demais dados pode completar depois.
            </p>
          </div>
          <AppButton type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose} aria-label="Fechar">
            <X className="h-4 w-4" />
          </AppButton>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="field-label">Nome *</label>
            <input {...register('name')} className="field" placeholder="Nome completo ou razão social" autoFocus />
            {errors.name && <span className="field-error">{errors.name.message}</span>}
          </div>
          <div>
            <label className="field-label">Telefone</label>
            <Controller
              name="phone"
              control={control}
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <AppPhoneInput
                  ref={ref}
                  value={value ?? ''}
                  onBlur={onBlur}
                  onValueChange={(vals) => onChange(vals.formattedValue)}
                />
              )}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <AppButton type="submit" loading={create.isPending} loadingText="Salvando..." className="flex-1">
              Cadastrar e continuar
            </AppButton>
            <AppButton type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : null
}
