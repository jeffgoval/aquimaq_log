import { Link } from 'react-router-dom'
import { Controller } from 'react-hook-form'
import { ArrowLeft } from 'lucide-react'
import { AppCurrencyInput, AppDecimalInput } from '@/shared/components/app/app-numeric-input'
import type { useTractorFormController } from '../hooks/use-tractor-form-controller'
import { ROUTES } from '@/shared/constants/routes'

type TractorFormController = ReturnType<typeof useTractorFormController>

interface TractorFormProps {
  controller: TractorFormController
}

export function TractorForm({ controller }: TractorFormProps) {
  const { form, onSubmit, isSubmitting, isEditing } = controller
  const { register, control, formState: { errors } } = form

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Identificação</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">Nome *</label>
            <input {...register('name')} className="field" placeholder="Ex: Trator John Deere 6110" />
            {errors.name && <p className="field-error">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Marca</label>
            <input {...register('brand')} className="field" placeholder="John Deere" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Modelo</label>
            <input {...register('model')} className="field" placeholder="6110J" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Placa</label>
            <input {...register('plate')} className="field" placeholder="ABC-1234" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Valores e Depreciação</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Valor de Compra *</label>
            <Controller
              name="purchase_value"
              control={control}
              render={({ field: { onChange, value } }) => (
                <AppCurrencyInput
                  value={value || ''}
                  onValueChange={(v) => onChange(v.floatValue ?? 0)}
                  placeholder="R$ 0,00"
                />
              )}
            />
            {errors.purchase_value && <p className="field-error">{errors.purchase_value.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Valor Residual</label>
            <Controller
              name="residual_value"
              control={control}
              render={({ field: { onChange, value } }) => (
                <AppCurrencyInput
                  value={value || ''}
                  onValueChange={(v) => onChange(v.floatValue ?? 0)}
                  placeholder="R$ 0,00"
                />
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Vida Útil (h) *</label>
            <Controller
              name="useful_life_hours"
              control={control}
              render={({ field: { onChange, value } }) => (
                <AppDecimalInput
                  value={value || ''}
                  onValueChange={(v) => onChange(v.floatValue ?? 0)}
                  placeholder="Ex: 5000"
                  allowNegative={false}
                />
              )}
            />
            {errors.useful_life_hours && <p className="field-error">{errors.useful_life_hours.message}</p>}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          O custo de depreciação por hora é calculado automaticamente: (Compra − Residual) ÷ Vida Útil
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Observações</h2>
        <textarea
          {...register('notes')}
          rows={3}
          className="field resize-none"
          placeholder="Informações adicionais sobre o trator..."
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="gradient-amber text-white font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity text-sm"
        >
          {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Cadastrar trator'}
        </button>
        <Link
          to={ROUTES.TRACTORS}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancelar
        </Link>
      </div>
    </form>
  )
}
