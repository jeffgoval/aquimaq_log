import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { useWorklogsByService, useCreateWorklog } from '../hooks/use-worklog-queries'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { AppDataCard } from '@/shared/components/app/app-data-card'
import { AppBadge } from '@/shared/components/app/app-badge'
import { AppButton } from '@/shared/components/app/app-button'
import { useDisclosure } from '@/shared/hooks/use-disclosure'
import { AppDecimalInput } from '@/shared/components/app/app-numeric-input'
import { AppMoney } from '@/shared/components/app/app-money'
import { useOperatorOptions } from '@/modules/operadores/hooks/use-operator-queries'
import { computeWorklogLineAmounts } from '@/modules/servicos/lib/service-financial-summary'
import { Clock, Plus, Tag } from 'lucide-react'
import dayjs from '@/shared/lib/dayjs'

interface WorklogSectionProps {
  serviceId: string
  tractorId: string
  /** Pré-seleciona o operador no formulário (ex.: operador principal do serviço). */
  defaultOperatorId?: string
  /** Taxa contratada com o cliente (R$/h), para pré-visualização e totais por linha. */
  contractedHourRate: number
}

export function WorklogSection({
  serviceId,
  tractorId,
  defaultOperatorId,
  contractedHourRate,
}: WorklogSectionProps) {
  const { data, isLoading } = useWorklogsByService(serviceId)
  const createWorklog = useCreateWorklog(serviceId)
  const operators = useOperatorOptions()
  const addDialog = useDisclosure()

  const [form, setForm] = useState({
    operator_id: '',
    work_date: dayjs().format('YYYY-MM-DD'),
    start_hourmeter: '',
    end_hourmeter: '',
    notes: '',
  })

  useEffect(() => {
    if (!addDialog.isOpen || !defaultOperatorId) return
    setForm((f) => (f.operator_id ? f : { ...f, operator_id: defaultOperatorId }))
  }, [addDialog.isOpen, defaultOperatorId])

  const selectedOperatorRate = useMemo(() => {
    if (!form.operator_id) return null
    const op = operators.data?.find((o) => o.id === form.operator_id)
    return op?.default_hour_rate ?? null
  }, [form.operator_id, operators.data])

  const preview = useMemo(() => {
    const start = Number(String(form.start_hourmeter).replace(',', '.'))
    const end = Number(String(form.end_hourmeter).replace(',', '.'))
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      return null
    }
    const hours = end - start
    return computeWorklogLineAmounts(hours, contractedHourRate, selectedOperatorRate)
  }, [form.start_hourmeter, form.end_hourmeter, contractedHourRate, selectedOperatorRate])

  const handleAdd = async () => {
    const start = Number(String(form.start_hourmeter).replace(',', '.'))
    const end = Number(String(form.end_hourmeter).replace(',', '.'))
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      toast.error('Horímetro final deve ser maior que o inicial.')
      return
    }
    if (!form.operator_id) {
      toast.message('Sem operador selecionado', {
        description: 'O custo de mão de obra desta linha fica zero no resumo até escolher um operador.',
      })
    }
    await createWorklog.mutateAsync({
      tractor_id: tractorId,
      operator_id: form.operator_id || null,
      work_date: form.work_date,
      start_hourmeter: start,
      end_hourmeter: end,
      notes: form.notes || null,
    })
    setForm({
      operator_id: defaultOperatorId ?? '',
      work_date: dayjs().format('YYYY-MM-DD'),
      start_hourmeter: '',
      end_hourmeter: '',
      notes: '',
    })
    addDialog.close()
  }

  const totalHours = data?.reduce((acc, w) => acc + (w.worked_hours ?? 0), 0) ?? 0

  return (
    <div className="rounded-xl border border-border bg-card p-4 lg:p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-5">
        <div>
          <h2 className="typo-section-title">Horímetro do trator</h2>
          <p className="typo-body-muted text-sm mt-1 max-w-xl">
            Registe a leitura inicial e final do horímetro em cada dia ou turno; as horas são calculadas automaticamente.
          </p>
          {totalHours > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#ffcd1175]" />
              <p className="typo-body font-semibold text-foreground">Total: {totalHours.toFixed(1)} h registadas</p>
            </div>
          )}
        </div>
        <AppButton
          variant="primary"
          size="sm"
          onClick={addDialog.toggle}
          className="flex items-center gap-1.5 shadow-lg shadow-primary/20 active:scale-95 shrink-0"
        >
          <Plus className="h-3 w-3" />
          Novo registo
        </AppButton>
      </div>

      {addDialog.isOpen && (
        <div className="rounded-xl border border-border p-4 mb-5 bg-muted/10 space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="field-label">Data</label>
              <input
                type="date"
                value={form.work_date}
                onChange={(e) => setForm((f) => ({ ...f, work_date: e.target.value }))}
                className="field"
              />
            </div>
            <div>
              <label className="field-label">Operador</label>
              <select
                value={form.operator_id}
                onChange={(e) => setForm((f) => ({ ...f, operator_id: e.target.value }))}
                className="field"
              >
                <option value="">Nenhum</option>
                {operators.data?.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-1">
              <div>
                <label className="field-label" title="Horímetro inicial">
                  Horímetro inicial
                </label>
                <AppDecimalInput
                  value={form.start_hourmeter}
                  onValueChange={(v) => setForm((f) => ({ ...f, start_hourmeter: v.value }))}
                  placeholder="0,0"
                />
              </div>
              <div>
                <label className="field-label" title="Horímetro final">
                  Horímetro final
                </label>
                <AppDecimalInput
                  value={form.end_hourmeter}
                  onValueChange={(v) => setForm((f) => ({ ...f, end_hourmeter: v.value }))}
                  placeholder="0,0"
                />
              </div>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="field-label">Observações</label>
              <input
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="field"
                placeholder="Detalhe opcional…"
              />
            </div>
          </div>

          {preview && (
            <div className="rounded-lg border border-border/80 bg-card/80 px-4 py-3 text-sm space-y-1">
              <p className="font-medium text-foreground">Pré-visualização deste registo</p>
              <p className="text-muted-foreground">
                Horas: <span className="font-semibold text-foreground">{(Number(String(form.end_hourmeter).replace(',', '.')) - Number(String(form.start_hourmeter).replace(',', '.'))).toFixed(2)} h</span>
                {' · '}
                Faturação (cliente): <AppMoney value={preview.billingLine} size="sm" />
                {' · '}
                Custo operador: <AppMoney value={preview.operatorCostLine} size="sm" />
                {' · '}
                Margem: <AppMoney value={preview.marginLine} size="sm" colored />
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <AppButton
              variant="primary"
              size="md"
              loading={createWorklog.isPending}
              loadingText="Salvando..."
              onClick={handleAdd}
              className="shadow-md active:scale-95"
            >
              Guardar registo
            </AppButton>
            <AppButton variant="ghost" size="sm" onClick={addDialog.close}>
              Cancelar
            </AppButton>
          </div>
        </div>
      )}

      {isLoading && <AppLoadingState />}
      {!isLoading && (!data || data.length === 0) ? (
        <AppEmptyState
          title="Nenhum registo de horímetro"
          description="Adicione a leitura inicial e final do horímetro do trator para apurar horas e valores."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data?.map((log) => {
            const line = computeWorklogLineAmounts(
              log.worked_hours ?? 0,
              contractedHourRate,
              log.operators?.default_hour_rate,
            )
            return (
              <AppDataCard
                key={log.id}
                title={dayjs(log.work_date).format('DD/MM/YYYY')}
                subtitle={log.operators?.name || 'Sem operador'}
                icon={Clock}
                badge={
                  <AppBadge variant="success">
                    {(log.worked_hours ?? 0).toFixed(1)} h
                  </AppBadge>
                }
                items={[
                  { label: 'Horímetro início', value: `${log.start_hourmeter} h` },
                  { label: 'Horímetro fim', value: `${log.end_hourmeter} h` },
                  { label: 'Faturação (cliente)', value: <AppMoney value={line.billingLine} size="sm" /> },
                  { label: 'Custo operador', value: <AppMoney value={line.operatorCostLine} size="sm" /> },
                  { label: 'Margem linha', value: <AppMoney value={line.marginLine} size="sm" colored /> },
                ]}
                footer={
                  log.notes ? (
                    <div className="flex gap-1.5 items-start pt-2 border-t border-border/50">
                      <Tag className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground italic line-clamp-2">&ldquo;{log.notes}&rdquo;</p>
                    </div>
                  ) : undefined
                }
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
