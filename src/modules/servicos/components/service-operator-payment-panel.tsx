import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AppButton } from '@/shared/components/app/app-button'
import { cn } from '@/shared/lib/cn'
import { useUpdateService } from '../hooks/use-service-queries'
import type { LaborOperatorAttribution } from '../lib/service-financial-summary'
import type { Tables } from '@/integrations/supabase/db-types'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'
import { AppMoney } from '@/shared/components/app/app-money'
import dayjs from '@/shared/lib/dayjs'

const serviceOperatorPaymentSchema = z.object({
  operator_payment_status: z.enum(['pending', 'paid']),
  operator_payment_date: z.string().optional().nullable(),
})

type ServiceOperatorPaymentForm = z.infer<typeof serviceOperatorPaymentSchema>

interface ServiceOperatorPaymentPanelProps {
  service: Pick<
    Tables<'services'>,
    'id' | 'operator_payment_status' | 'operator_payment_date' | 'service_date'
  >
  laborOperatorAttribution: LaborOperatorAttribution
  operatorCostTotal: number
}

export const ServiceOperatorPaymentPanel = ({
  service,
  laborOperatorAttribution,
  operatorCostTotal,
}: ServiceOperatorPaymentPanelProps) => {
  const update = useUpdateService(service.id)
  const form = useForm<ServiceOperatorPaymentForm>({
    resolver: zodResolver(serviceOperatorPaymentSchema),
    defaultValues: {
      operator_payment_status: (service.operator_payment_status as 'pending' | 'paid') ?? 'pending',
      operator_payment_date: service.operator_payment_date ?? '',
    },
  })

  useEffect(() => {
    form.reset({
      operator_payment_status: (service.operator_payment_status as 'pending' | 'paid') ?? 'pending',
      operator_payment_date: service.operator_payment_date ?? '',
    })
  }, [service.id, service.operator_payment_status, service.operator_payment_date, form.reset])

  const serviceYmd = service.service_date.slice(0, 10)

  const onSubmit = form.handleSubmit(async (values) => {
    const paidDate =
      values.operator_payment_status === 'paid'
        ? (values.operator_payment_date?.trim() || serviceYmd)
        : null
    await update.mutateAsync({
      operator_payment_status: values.operator_payment_status,
      operator_payment_date: paidDate,
    })
  })

  const status = form.watch('operator_payment_status')
  const showPanel = operatorCostTotal > 0

  if (!showPanel) return null

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="typo-section-title mb-1">Pagamento ao operador</h2>
          <p className="typo-body-muted text-sm max-w-xl">
            A <strong className="text-foreground">data do serviço</strong> ({dayjs(service.service_date).format('DD/MM/YYYY')}) já está nos dados abaixo — aqui só indica se já pagou o operador.
            O saldo (vales e pagamentos) regista-se na ficha do operador.
          </p>
        </div>
        <span
          className={cn(
            'text-xs font-medium px-3 py-1.5 rounded-full border shrink-0',
            status === 'paid'
              ? 'border-green-200 bg-green-100 text-green-900 dark:border-green-500/40 dark:bg-green-500/10 dark:text-green-200'
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
          {laborOperatorAttribution.kind === 'single' && (
            <>
              {' '}(<Link
                to={ROUTES.OPERATOR_DETAIL(laborOperatorAttribution.operatorId)}
                className="text-primary underline-offset-2 hover:underline"
              >
                {laborOperatorAttribution.operatorName}
              </Link>
              )
            </>
          )}
          {laborOperatorAttribution.kind === 'multiple' && (
            <>
              {' '}(vários operadores:{' '}
              {laborOperatorAttribution.operators.map((op, i) => (
                <span key={op.operatorId}>
                  {i > 0 ? ', ' : ''}
                  <Link
                    to={ROUTES.OPERATOR_DETAIL(op.operatorId)}
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    {op.operatorName}
                  </Link>
                </span>
              ))}
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

      {status === 'pending' && (
        <p className="text-xs text-muted-foreground">
          Enquanto estiver pendente, não é pedida outra data — usa-se a data do serviço como referência.
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
          {status === 'paid' && (
            <div>
              <label className="field-label">Data em que pagou (se for diferente do serviço)</label>
              <input type="date" className="field" {...form.register('operator_payment_date')} />
              <p className="typo-caption text-muted-foreground mt-1">
                Se ficar vazio, usa-se a data do serviço ({dayjs(service.service_date).format('DD/MM/YYYY')}).
              </p>
            </div>
          )}
        </div>
        <AppButton type="submit" size="sm" loading={update.isPending} loadingText="...">
          Guardar
        </AppButton>
      </form>
    </div>
  )
}
