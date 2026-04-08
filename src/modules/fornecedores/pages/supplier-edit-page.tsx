import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supplierSchema, type SupplierInput } from '../schemas/supplier.schema'
import { useSupplier, useUpdateSupplier } from '../hooks/use-supplier-queries'
import { ROUTES } from '@/shared/constants/routes'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppButton } from '@/shared/components/app/app-button'
import { AppPatternInput, AppPhoneInput } from '@/shared/components/app/app-numeric-input'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { UnsavedChangesBanner } from '@/shared/components/app/unsaved-changes-banner'
import { useUnsavedWarning } from '@/shared/hooks/use-unsaved-warning'

function nullIfEmpty(s: string | undefined): string | null {
  const t = s?.trim()
  return t ? t : null
}

export function SupplierEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: supplier, isLoading, isError, error } = useSupplier(id ?? '')
  const update = useUpdateSupplier(id ?? '')

  const form = useForm<SupplierInput>({
    resolver: zodResolver(supplierSchema) as Resolver<SupplierInput>,
    defaultValues: { name: '', is_active: true },
  })
  const { register, control, formState: { errors, isDirty }, reset } = form
  useUnsavedWarning(isDirty)

  useEffect(() => {
    if (!supplier) return
    reset({
      name: supplier.name,
      address: supplier.address ?? '',
      phone: supplier.phone ?? '',
      cnpj: supplier.cnpj ?? '',
      notes: supplier.notes ?? '',
      is_active: supplier.is_active,
    })
  }, [supplier, reset])

  const onSubmit = form.handleSubmit(async (v) => {
    if (!id) return
    await update.mutateAsync({
      name: v.name.trim(),
      address: nullIfEmpty(v.address),
      phone: nullIfEmpty(v.phone),
      cnpj: nullIfEmpty(v.cnpj),
      notes: nullIfEmpty(v.notes),
      is_active: v.is_active,
    })
    navigate(ROUTES.SUPPLIER_DETAIL(id))
  })

  if (!id) return <AppErrorState message="Fornecedor inválido" />
  if (isLoading) return <AppLoadingState />
  if (isError) return <AppErrorState message={error.message} />

  return (
    <div className="max-w-2xl">
      <AppPageHeader
        backTo={id ? ROUTES.SUPPLIER_DETAIL(id) : ROUTES.SUPPLIERS}
        backLabel="Voltar ao fornecedor"
        title="Editar Fornecedor"
        description={supplier?.name}
      />
      <UnsavedChangesBanner isDirty={isDirty} className="mb-4" />
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>
        <div className="flex items-center gap-3">
          <AppButton type="submit" variant="primary" size="lg" loading={update.isPending} loadingText="Salvando...">
            Salvar alterações
          </AppButton>
          <Link to={ROUTES.SUPPLIER_DETAIL(id)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
