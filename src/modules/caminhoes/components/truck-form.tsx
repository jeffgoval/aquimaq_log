import { UseFormReturn, Controller } from 'react-hook-form'
import { TruckFormValues } from '../schemas/truck.schema'
import { AppButton } from '@/shared/components/app/app-button'
import { NumericFormat } from 'react-number-format'

interface Props {
  form: UseFormReturn<TruckFormValues>
  onSubmit: (v: TruckFormValues) => void
  isLoading: boolean
  submitLabel: string
}

export const TruckForm = ({ form, onSubmit, isLoading, submitLabel }: Props) => {
  const { register, handleSubmit, formState: { errors }, control } = form

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="field-label">Nome / Identificação *</label>
          <input className="field" {...register('name')} placeholder="Ex: Guincho 01" autoFocus />
          {errors.name && <span className="field-error">{errors.name.message}</span>}
        </div>
        
        <div>
          <label className="field-label">Placa</label>
          <input className="field uppercase" {...register('plate')} placeholder="ABC1D23" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">Marca</label>
            <input className="field" {...register('brand')} placeholder="Ex: VW" />
          </div>
          <div>
            <label className="field-label">Modelo</label>
            <input className="field" {...register('model')} placeholder="Ex: 24.280" />
          </div>
        </div>

        <div>
          <label className="field-label">Valor de Compra (R$)</label>
          <Controller
            control={control}
            name="purchase_value"
            render={({ field }) => (
              <NumericFormat
                className="field"
                value={field.value}
                onValueChange={(v) => field.onChange(v.floatValue ?? 0)}
                thousandSeparator="."
                decimalSeparator=","
                prefix="R$ "
                decimalScale={2}
                fixedDecimalScale
                allowNegative={false}
              />
            )}
          />
          {errors.purchase_value && <span className="field-error">{errors.purchase_value.message}</span>}
        </div>

        <div>
          <label className="field-label">Valor Residual (venda futura)</label>
          <Controller
            control={control}
            name="residual_value"
            render={({ field }) => (
              <NumericFormat
                className="field"
                value={field.value}
                onValueChange={(v) => field.onChange(v.floatValue ?? 0)}
                thousandSeparator="."
                decimalSeparator=","
                prefix="R$ "
                decimalScale={2}
                fixedDecimalScale
                allowNegative={false}
              />
            )}
          />
        </div>

        <div>
          <label className="field-label">Odômetro Atual (KM)</label>
          <Controller
            control={control}
            name="current_odometer"
            render={({ field }) => (
              <NumericFormat
                className="field"
                value={field.value}
                onValueChange={(v) => field.onChange(v.floatValue ?? 0)}
                thousandSeparator="."
                decimalSeparator=","
                decimalScale={0}
                allowNegative={false}
              />
            )}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="field-label flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" {...register('is_active')} />
            Veículo Ativo
          </label>
        </div>

        <div className="sm:col-span-2">
          <label className="field-label">Observações</label>
          <textarea className="field resize-none" rows={3} {...register('notes')} />
        </div>
      </div>

      <div className="pt-2">
        <AppButton type="submit" variant="primary" loading={isLoading} className="w-full sm:w-auto">
          {submitLabel}
        </AppButton>
      </div>
    </form>
  )
}
