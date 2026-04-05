import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { AppButton } from '@/shared/components/app/app-button'
import { AppMoney } from '@/shared/components/app/app-money'
import { AppBadge } from '@/shared/components/app/app-badge'
import { ReceiptPhotoPicker, ReceiptViewButton } from '@/shared/components/receipts'
import { compressImageToJpeg } from '@/shared/lib/image-compress'
import { removeReceiptAtPathIfExists, uploadMachineCostReceipt } from '@/integrations/supabase/receipts-storage'
import { useUpdateMachineCost } from '../hooks/use-cost-queries'
import type { MachineCostWithTractor, Updates } from '@/integrations/supabase/db-types'
import { parseSupabaseError } from '@/shared/lib/errors'
import dayjs from '@/shared/lib/dayjs'
import { cn } from '@/shared/lib/cn'

const COST_TYPE_LABELS = { fuel: '⛽ Combustível', oil: '🛢️ Óleo', parts: '🔧 Peças', maintenance: '🔩 Manutenção', other: '📋 Outro' }

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  cancelled: 'Cancelado',
}

export interface MachineCostDetailPanelProps {
  cost: MachineCostWithTractor
  onClose: () => void
}

export const MachineCostDetailPanel = ({ cost, onClose }: MachineCostDetailPanelProps) => {
  const updateCost = useUpdateMachineCost()
  const [description, setDescription] = useState(() => cost.description ?? '')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const typeLabel = COST_TYPE_LABELS[cost.cost_type as keyof typeof COST_TYPE_LABELS] ?? cost.cost_type

  const handleSave = async () => {
    const payload: Updates<'machine_costs'> = {}
    const newDesc = description.trim() || null
    if (newDesc !== (cost.description ?? null)) {
      payload.description = newDesc
    }
    if (receiptFile) {
      try {
        const blob = await compressImageToJpeg(receiptFile)
        if (cost.receipt_storage_path) await removeReceiptAtPathIfExists(cost.receipt_storage_path)
        payload.receipt_storage_path = await uploadMachineCostReceipt(cost.id, blob)
      } catch (e) {
        toast.error(parseSupabaseError(e as Error))
        return
      }
    }
    if (Object.keys(payload).length === 0) {
      onClose()
      return
    }
    await updateCost.mutateAsync({ id: cost.id, payload })
    setReceiptFile(null)
    onClose()
  }

  const dirtyDesc = (description.trim() || null) !== (cost.description ?? null)
  const dirtyReceipt = receiptFile !== null
  const canSave = dirtyDesc || dirtyReceipt

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="cost-panel-title">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative flex h-full w-full max-w-lg flex-col border-l border-border bg-background shadow-2xl',
          'animate-in slide-in-from-right duration-200'
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-4 shrink-0">
          <div className="min-w-0">
            <h2 id="cost-panel-title" className="typo-section-title truncate">
              {cost.tractors?.name ?? 'Custo'}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {dayjs(cost.cost_date).format('DD/MM/YYYY')} · {typeLabel}
            </p>
          </div>
          <AppButton type="button" variant="ghost" size="sm" className="shrink-0 h-9 w-9 p-0" onClick={onClose} aria-label="Fechar">
            <X className="h-5 w-5" />
          </AppButton>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="typo-caption">Valor</p>
              <p className="font-semibold mt-1">
                <AppMoney value={cost.amount} />
              </p>
            </div>
            <div>
              <p className="typo-caption">Situação (contas)</p>
              <div className="mt-1">
                <AppBadge variant={cost.status === 'paid' ? 'success' : 'default'}>
                  {STATUS_LABELS[cost.status] ?? cost.status}
                </AppBadge>
              </div>
            </div>
            <div className="col-span-2">
              <p className="typo-caption">Fornecedor</p>
              <p className="font-medium mt-1">{cost.suppliers?.name || cost.supplier_name || '—'}</p>
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="cost-panel-desc">
              Observações / detalhe da nota
            </label>
            <textarea
              id="cost-panel-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="field resize-none"
              placeholder="Ex.: litros, número da NF, posto…"
            />
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
            <p className="text-sm font-medium">Foto da notinha</p>
            {cost.receipt_storage_path ? (
              <div className="flex flex-wrap items-center gap-2">
                <ReceiptViewButton storagePath={cost.receipt_storage_path} variant="secondary" size="sm" />
                <span className="text-xs text-muted-foreground">Anexe outra imagem abaixo para substituir.</span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Ainda sem foto. Use o botão abaixo para anexar.</p>
            )}
            <ReceiptPhotoPicker file={receiptFile} onChange={setReceiptFile} disabled={updateCost.isPending} />
          </div>
        </div>

        <div className="border-t border-border p-4 flex flex-wrap gap-2 shrink-0 bg-card/80">
          <AppButton
            type="button"
            variant="primary"
            size="lg"
            disabled={!canSave}
            loading={updateCost.isPending}
            loadingText="Guardando…"
            onClick={handleSave}
          >
            Guardar alterações
          </AppButton>
          <AppButton type="button" variant="ghost" size="md" onClick={onClose}>
            Fechar
          </AppButton>
        </div>
      </div>
    </div>
  )
}
