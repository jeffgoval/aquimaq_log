import { useEffect, useState } from 'react'
import { AppButton } from '@/shared/components/app/app-button'
import { AppCurrencyInput } from '@/shared/components/app/app-numeric-input'
import { AppMoney } from '@/shared/components/app/app-money'
import { useUpdateService } from '../hooks/use-service-queries'

interface ServiceOwnerDiscountCardProps {
  serviceId: string
  /** Valor guardado no serviço (sincroniza quando muda). */
  savedAmount: number
  locked: boolean
}

export const ServiceOwnerDiscountCard = ({
  serviceId,
  savedAmount,
  locked,
}: ServiceOwnerDiscountCardProps) => {
  const update = useUpdateService(serviceId)
  const [amount, setAmount] = useState<number | undefined>(savedAmount)

  useEffect(() => {
    setAmount(savedAmount)
  }, [savedAmount, serviceId])

  if (locked) {
    return (
      <div className="rounded-xl border border-border bg-muted/15 px-4 py-3">
        <p className="typo-body font-medium text-sm">Desconto do dono</p>
        <p className="text-sm text-muted-foreground mt-1">
          {savedAmount > 0
            ? (
              <>
                Registado: <AppMoney value={savedAmount} size="sm" className="font-medium text-foreground" />
                {' '}(serviço concluído ou cancelado — não editável)
              </>
            )
            : (
              'Nenhum desconto registado.'
            )}
        </p>
      </div>
    )
  }

  const handleSave = async () => {
    await update.mutateAsync({ owner_discount_amount: amount ?? 0 })
  }

  const dirty = (amount ?? 0) !== savedAmount

  return (
    <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-4 space-y-3">
      <div>
        <h3 className="typo-body font-semibold text-foreground">Desconto do dono (R$)</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
          Valor fixo a <strong className="text-foreground font-medium">abater da faturação bruta</strong> (horas × taxa ao
          cliente). Reduz o que aparece em «Faturação líquida» e o total sugerido em Contas a receber.{' '}
          <strong className="text-foreground font-medium">Não altera</strong> o custo de mão de obra dos apontamentos.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-end gap-3">
        <div className="w-full sm:w-auto sm:min-w-[200px]">
          <label className="field-label" htmlFor={`owner-discount-${serviceId}`}>
            Valor do desconto
          </label>
          <AppCurrencyInput
            id={`owner-discount-${serviceId}`}
            value={amount ?? ''}
            onValueChange={(v) => setAmount(v.floatValue ?? 0)}
            placeholder="R$ 0,00"
          />
        </div>
        <AppButton
          type="button"
          variant="secondary"
          size="sm"
          loading={update.isPending}
          loadingText="..."
          onClick={handleSave}
          disabled={!dirty}
          className="shrink-0"
        >
          Guardar desconto
        </AppButton>
      </div>
    </div>
  )
}
