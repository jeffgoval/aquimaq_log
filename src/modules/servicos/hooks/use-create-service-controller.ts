import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createServiceSchema, type CreateServiceInput } from '../schemas/service.schema'
import { useCreateService } from './use-service-queries'
import { useClientOptions } from '@/modules/clientes/hooks/use-client-queries'
import { useOperatorOptions } from '@/modules/operadores/hooks/use-operator-queries'
import { useTractorOptions } from '@/modules/tratores/hooks/use-tractor-queries'
import { financialRepository } from '@/modules/financeiro/services/financial.repository'
import { buildInstallmentsPreview } from '@/features/create-installments/create-installments'
import { queryKeys } from '@/integrations/supabase/query-keys'
import { parseSupabaseError } from '@/shared/lib/errors'
import { ROUTES } from '@/shared/constants/routes'
import dayjs from '@/shared/lib/dayjs'
import { getDefaultServiceBillingFields } from '../schemas/service.schema'

export function useCreateServiceController() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const createService = useCreateService()
  const [isSaving, setIsSaving] = useState(false)
  const clients = useClientOptions()
  const operators = useOperatorOptions()
  const tractors = useTractorOptions()

  const form = useForm<CreateServiceInput>({
    resolver: zodResolver(createServiceSchema) as Resolver<CreateServiceInput>,
    defaultValues: {
      service_date: dayjs().format('YYYY-MM-DD'),
      ...getDefaultServiceBillingFields(),
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSaving(true)
    try {
    const service = await createService.mutateAsync({
      client_id: values.client_id,
      tractor_id: values.tractor_id,
      primary_operator_id: values.primary_operator_id || null,
      service_date: values.service_date,
      contracted_hour_rate: values.contracted_hour_rate,
      notes: values.notes || null,
      status: 'draft',
    })

    if (values.client_billing_mode !== 'later') {
      try {
        if (values.client_billing_mode === 'paid_full') {
          await financialRepository.createReceivableWithFullPayment({
            service_id: service.id,
            client_id: values.client_id,
            amount: values.client_billing_amount!,
            payment_date: values.client_payment_date!,
          })
        } else if (values.client_billing_mode === 'pending') {
          await financialRepository.createInstallments([
            {
              service_id: service.id,
              client_id: values.client_id,
              installment_number: 1,
              installment_count: 1,
              original_amount: values.client_billing_amount!,
              fee_percent: 0,
              final_amount: values.client_billing_amount!,
              due_date: values.client_due_date!,
              description: 'A receber',
            },
          ])
        } else if (values.client_billing_mode === 'installments') {
          const count = values.client_installment_count!
          const fee = values.client_fee_percent ?? 0
          const preview = buildInstallmentsPreview({
            totalAmount: values.client_billing_amount!,
            installmentCount: count,
            feePercent: fee,
            firstDueDate: values.client_first_due_date!,
          })
          await financialRepository.createInstallments(
            preview.map((item) => ({
              service_id: service.id,
              client_id: values.client_id,
              installment_number: item.installmentNumber,
              installment_count: count,
              original_amount: values.client_billing_amount! / count,
              fee_percent: fee,
              final_amount: item.amount,
              due_date: item.dueDate,
              description: `Parcela ${item.installmentNumber}/${count}`,
            })),
          )
        }
        await qc.invalidateQueries({ queryKey: queryKeys.receivables })
        await qc.invalidateQueries({ queryKey: queryKeys.receivablesByService(service.id) })
      } catch (e) {
        toast.error(parseSupabaseError(e as Error))
        toast.info('Serviço foi criado. Registe a conta a receber na ficha do serviço.')
      }
    }

    navigate(ROUTES.SERVICE_DETAIL(service.id))
    } finally {
      setIsSaving(false)
    }
  })

  return {
    form,
    onSubmit,
    isSubmitting: isSaving,
    clients: clients.data ?? [],
    operators: operators.data ?? [],
    tractors: tractors.data ?? [],
  }
}
