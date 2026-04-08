import { Link, useNavigate } from 'react-router-dom'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supplierSchema, type SupplierInput } from '../schemas/supplier.schema'
import { useCreateSupplier } from '../hooks/use-supplier-queries'
import { ROUTES } from '@/shared/constants/routes'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppButton } from '@/shared/components/app/app-button'
import { AppPatternInput, AppPhoneInput } from '@/shared/components/app/app-numeric-input'
import { AppCard } from '@/shared/components/app/app-card'

function nullIfEmpty(s: string | undefined): string | null {
  const t = s?.trim()
  return t ? t : null
}

export function SupplierCreatePage() {
  const navigate = useNavigate()
  const create = useCreateSupplier()
  const form = useForm<SupplierInput>({
    resolver: zodResolver(supplierSchema) as Resolver<SupplierInput>,
    defaultValues: { name: '', is_active: true },
  })
  const { register, control, formState: { errors } } = form

  const onSubmit = form.handleSubmit(async (v) => {
    await create.mutateAsync({
      name: v.name.trim(),
      address: nullIfEmpty(v.address),
      phone: nullIfEmpty(v.phone),
      cnpj: nullIfEmpty(v.cnpj),
      notes: nullIfEmpty(v.notes),
      is_active: v.is_active,
    })
    navigate(ROUTES.SUPPLIERS)
  })

  return (
    <div className="max-w-2xl">
      <AppPageHeader backTo={ROUTES.SUPPLIERS} backLabel="Voltar aos fornecedores" title="Novo Fornecedor" />
      <form onSubmit={onSubmit} className="space-y-5">
        <AppCard className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="sm:col-span-2">
              <label className="field-label">Nome / Razão social *</label>
              <input {...register('name')} className="field" placeholder="Nome do fornecedor" />
              {errors.name && <span className="field-error">{errors.name.message}</span>}
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Endereço</label>
              <input {...register('address')} className="field" placeholder="Rua, número, cidade..." />
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
            <div>
              <label className="field-label">CNPJ</label>
              <Controller
                name="cnpj"
                control={control}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <AppPatternInput
                    ref={ref}
                    value={value ?? ''}
                    onBlur={onBlur}
                    onValueChange={(vals) => onChange(vals.formattedValue)}
                    format="##.###.###/####-##"
                    mask="_"
                    placeholder="00.000.000/0000-00"
                  />
                )}
              />
              {errors.cnpj && <span className="field-error">{errors.cnpj.message}</span>}
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Observações</label>
              <textarea {...register('notes')} rows={3} className="field resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                <input type="checkbox" {...register('is_active')} className="rounded border-input size-4" />
                <span className="text-sm text-foreground">Fornecedor ativo</span>
              </label>
            </div>
          </div>
        </AppCard>
        <div className="flex items-center gap-3">
          <AppButton type="submit" variant="primary" size="lg" loading={create.isPending} loadingText="Salvando...">
            Cadastrar fornecedor
          </AppButton>
          <Link to={ROUTES.SUPPLIERS} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
