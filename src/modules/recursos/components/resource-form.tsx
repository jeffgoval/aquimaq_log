import { Controller, type UseFormReturn } from 'react-hook-form'
import { AppButton } from '@/shared/components/app/app-button'
import { AppCurrencyInput } from '@/shared/components/app/app-numeric-input'
import type { ResourceFormInput, ResourceInput } from '../schemas/resource.schema'

interface ResourceFormProps {
  form: UseFormReturn<ResourceFormInput, unknown, ResourceInput>
  submitting: boolean
  onSubmit: (values: ResourceInput) => Promise<void>
  onCancel: () => void
  submitLabel: string
}

const typeOptions: Array<{ value: ResourceInput['type']; label: string }> = [
  { value: 'tractor', label: 'Trator' },
  { value: 'truck', label: 'Guincho/Caminhão' },
  { value: 'equipment', label: 'Equipamento' },
]

const billingOptions: Array<{ value: ResourceInput['billing_type']; label: string }> = [
  { value: 'hourly', label: 'Por hora' },
  { value: 'daily', label: 'Por dia' },
  { value: 'km', label: 'Por km' },
  { value: 'fixed', label: 'Valor fixo' },
  { value: 'equipment_15d', label: 'Pacote 15 dias' },
  { value: 'equipment_30d', label: 'Pacote 30 dias' },
]

const statusOptions: Array<{ value: ResourceInput['status']; label: string }> = [
  { value: 'available', label: 'Disponível' },
  { value: 'maintenance', label: 'Manutenção' },
  { value: 'inactive', label: 'Inativo' },
]

/** Zod `coerce` deixa o input do campo como `unknown` até ao submit. */
const currencyFieldValue = (raw: unknown): string | number | undefined => {
  if (raw === null || raw === undefined || raw === '') return ''
  if (typeof raw === 'number' || typeof raw === 'string') return raw
  return ''
}

export function ResourceForm({ form, submitting, onSubmit, onCancel, submitLabel }: ResourceFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = form
  const resourceType = watch('type')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="field-label">Nome *</label>
          <input {...register('name')} className="field" placeholder="Ex.: Trator JD-75" />
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>

        <div>
          <label className="field-label">Tipo *</label>
          <select {...register('type')} className="field">
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.type && <p className="field-error">{errors.type.message}</p>}
        </div>

        {resourceType !== 'equipment' ? (
          <>
            <div>
              <label className="field-label">Tipo de cobrança *</label>
              <select {...register('billing_type')} className="field">
                {billingOptions
                  .filter((option) => option.value === 'hourly' || option.value === 'daily' || option.value === 'fixed')
                  .map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
              {errors.billing_type && <p className="field-error">{errors.billing_type.message}</p>}
            </div>

            <div>
              <label className="field-label">Tarifa *</label>
              <Controller
                name="rate"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <AppCurrencyInput
                    value={currencyFieldValue(value)}
                    onValueChange={(v) => onChange(v.floatValue ?? 0)}
                    placeholder="R$ 0,00"
                  />
                )}
              />
              {errors.rate && <p className="field-error">{errors.rate.message}</p>}
            </div>
          </>
        ) : (
          <div className="space-y-3 rounded-lg border border-border p-3 md:col-span-2">
            <p className="text-sm font-medium text-foreground">Tabela de preços do equipamento</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="field-label">Hora *</label>
                <Controller
                  name="equipment_pricing.hourly"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <AppCurrencyInput
                      value={currencyFieldValue(value)}
                      onValueChange={(v) => onChange(v.floatValue ?? 0)}
                      placeholder="R$ 0,00"
                    />
                  )}
                />
              </div>
              <div>
                <label className="field-label">Diária *</label>
                <Controller
                  name="equipment_pricing.daily"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <AppCurrencyInput
                      value={currencyFieldValue(value)}
                      onValueChange={(v) => onChange(v.floatValue ?? 0)}
                      placeholder="R$ 0,00"
                    />
                  )}
                />
              </div>
              <div>
                <label className="field-label">Pacote 15 dias *</label>
                <Controller
                  name="equipment_pricing.equipment_15d"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <AppCurrencyInput
                      value={currencyFieldValue(value)}
                      onValueChange={(v) => onChange(v.floatValue ?? 0)}
                      placeholder="R$ 0,00"
                    />
                  )}
                />
              </div>
              <div>
                <label className="field-label">Pacote 30 dias *</label>
                <Controller
                  name="equipment_pricing.equipment_30d"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <AppCurrencyInput
                      value={currencyFieldValue(value)}
                      onValueChange={(v) => onChange(v.floatValue ?? 0)}
                      placeholder="R$ 0,00"
                    />
                  )}
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="field-label">Marca</label>
          <input {...register('brand')} className="field" placeholder="Ex.: John Deere" />
        </div>

        <div>
          <label className="field-label">Modelo</label>
          <input {...register('model')} className="field" placeholder="Ex.: 5075E" />
        </div>

        <div>
          <label className="field-label">Status *</label>
          <select {...register('status')} className="field">
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.status && <p className="field-error">{errors.status.message}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <AppButton type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </AppButton>
        <AppButton type="submit" variant="primary" loading={submitting}>
          {submitLabel}
        </AppButton>
      </div>
    </form>
  )
}
