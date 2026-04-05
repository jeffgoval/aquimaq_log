import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AppButton } from '@/shared/components/app/app-button'
import { cn } from '@/shared/lib/cn'
import { useUpdateService } from '../hooks/use-service-queries'
import type { Tables } from '@/integrations/supabase/db-types'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'
import { AppMoney } from '@/shared/components/app/app-money'

const serviceOperatorPaymentSchema = z.object({
  operator_payment_status: z.enum(['pending', 'paid']),
  operator_payment_date: z.string().optional().nullable(),
})

type ServiceOperatorPaymentForm = z.infer<typeof serviceOperatorPaymentSchema>

interface ServiceOperatorPaymentPanelProps {
  service: Pick<
    Tables<'services'>,
    'id' | 'primary_operator_id' | 'operator_payment_status' | 'operator_payment_date'
  >
  operatorName?: string | null
  operatorCostTotal: number
}

export const ServiceOperatorPaymentPanel = ({
  service,
  operatorName,
  operatorCostTotal,
}: ServiceOperatorPaymentPanelProps) => {
  const update = useUpdateService(service.id)
  const form = useForm<ServiceOperatorPaymentForm>({
    resolver: zodResolver(serviceOperatorPaymentSchema),
    defaultValues: {
      operator_payment_status: service.operator_payment_status ?? 'pending',
      operator_payment_date: service.operator_payment_date ?? '',
    },
  })

  useEffect(() => {
    form.reset({
      operator_payment_status: service.operator_payment_status ?? 'pending',
      operator_payment_date: service.operator_payment_date ?? '',
    })
  }, [service.id, service.operator_payment_status, service.operator_payment_date, form.reset])

  const onSubmit = form.handleSubmit(async (values) => {
    await update.mutateAsync({
      operator_payment_status: values.operator_payment_status,
      operator_payment_date: values.operator_payment_date?.trim()
        ? values.operator_payment_date
        : null,
    })
  })

  const status = form.watch('operator_payment_status')
  const dateVal = form.watch('operator_payment_date')
  const showPanel = Boolean(service.primary_operator_id) || operatorCostTotal > 0

  if (!showPanel) return null

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="typo-section-title mb-1">Pagamento ao operador</h2>
          <p className="typo-body-muted text-sm max-w-xl">
            Controlo independente da data: marque como pago quando efetuar o pagamento, ou deixe pendente e use a data como lembrete / previsão.
            O saldo global (vales e pagamentos) regista-se na ficha do operador.
          </p>
        </div>
        <span
          className={cn(
            'text-xs font-medium px-3 py-1.5 rounded-full border shrink-0',
            status === 'paid'
              ? 'border-green-500/40 bg-green-500/10 text-green-800 dark:text-green-200'
              : 'border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100',
          )}
        >
          {status === 'paid' ? 'Pago' : 'Pendente'}
        </span>
      </div>

      {operatorCostTotal > 0 && (
        <p className="text-sm">
          Custo de mão de obra apurado neste serviço:{' '}
          <span className="font-semibold tabular-nums"><AppMoney value={operatorCostTotal} size="sm" /></span>
          {operatorName && service.primary_operator_id && (
            <>
              {' '}(<Link to={ROUTES.OPERATOR_DETAIL(service.primary_operator_id)} className="text-primary underline-offset-2 hover:underline">{operatorName}</Link>
              )
            </>
          )}
        </p>
      )}

      {status === 'pending' && operatorCostTotal > 0 && (
        <p className="text-sm text-amber-800 dark:text-amber-200 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          Pagamento ao operador ainda marcado como pendente para este serviço.
        </p>
      )}

      {status === 'paid' && !dateVal && (
        <p className="text-sm text-muted-foreground border border-border rounded-lg px-3 py-2">
          Sugestão: preencha a data em que pagou para manter o histórico claro.
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label">Situação</label>
            <select className="field" {...form.register('operator_payment_status')}>
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
            </select>
          </div>
          <div>
            <label className="field-label">Data (pagamento ou previsão)</label>
            <input type="date" className="field" {...form.register('operator_payment_date')} />
          </div>
        </div>
        <AppButton type="submit" size="sm" loading={update.isPending} loadingText="...">
          Guardar
        </AppButton>
      </form>
    </div>
  )
}
