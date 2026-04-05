import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { useWorklogsByService, useCreateWorklog, useUpdateWorklog, useDeleteWorklog } from '../hooks/use-worklog-queries'
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
import { Clock, Plus, Tag, Pencil, Trash2 } from 'lucide-react'
import dayjs from '@/shared/lib/dayjs'

type ServiceWorklogStatus = 'draft' | 'in_progress' | 'completed' | 'cancelled'

interface WorklogSectionProps {
  serviceId: string
  vehicleId: string
  isTruck?: boolean
  /** Estado do serviço: encerrados só permitem alterar observações nas linhas (histórico financeiro protegido). */
  serviceStatus: ServiceWorklogStatus
  /** Pré-seleciona o operador no novo registo (ex.: último operador já apontado neste serviço). */
  defaultOperatorId?: string
  /** Data do serviço (ISO); evita pedir outra data no horímetro — só mostra picker em «É outro dia». */
  serviceDate?: string
  /** Taxa contratada com o cliente (R$/h), para pré-visualização e totais por linha. */
  contractedHourRate: number
}

export function WorklogSection({
  serviceId,
  vehicleId,
  isTruck = false,
  serviceStatus,
  defaultOperatorId,
  serviceDate,
  contractedHourRate,
}: WorklogSectionProps) {
  const serviceLocked = serviceStatus === 'completed' || serviceStatus === 'cancelled'
  const { data, isLoading } = useWorklogsByService(serviceId)
  const createWorklog = useCreateWorklog(serviceId)
  const updateWorklog = useUpdateWorklog(serviceId)
  const deleteWorklog = useDeleteWorklog(serviceId)
  const operators = useOperatorOptions()
  const addDialog = useDisclosure()

  const [form, setForm] = useState({
    operator_id: '',
    work_date: dayjs().format('YYYY-MM-DD'),
    start_value: '',
    end_value: '',
    notes: '',
  })

  const serviceYmd = useMemo(() => {
    if (!serviceDate) return ''
    const s = serviceDate.slice(0, 10)
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ''
  }, [serviceDate])

  const defaultAddWorkDate = serviceYmd || dayjs().format('YYYY-MM-DD')

  /** Com data do serviço conhecida, o registo usa esse dia por defeito; só mostra o date picker se o utilizador escolher outro dia. */
  const [addFormOtherDay, setAddFormOtherDay] = useState(false)

  const [notesOnlyId, setNotesOnlyId] = useState<string | null>(null)
  const [notesOnlyDraft, setNotesOnlyDraft] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    operator_id: '',
    work_date: dayjs().format('YYYY-MM-DD'),
    start_value: '',
    end_value: '',
    notes: '',
  })

  useEffect(() => {
    if (!addDialog.isOpen || !defaultOperatorId) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm((f) => (f.operator_id ? f : { ...f, operator_id: defaultOperatorId }))
  }, [addDialog.isOpen, defaultOperatorId])

  useEffect(() => {
    if (!addDialog.isOpen) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm((f) => ({ ...f, work_date: defaultAddWorkDate }))
    setAddFormOtherDay(false)
  }, [addDialog.isOpen, defaultAddWorkDate])

  const selectedOperatorRate = useMemo(() => {
    if (!form.operator_id) return null
    const op = operators.data?.find((o) => o.id === form.operator_id)
    return op?.default_hour_rate ?? null
  }, [form.operator_id, operators.data])

  const preview = useMemo(() => {
    const start = Number(String(form.start_value).replace(',', '.'))
    const end = Number(String(form.end_value).replace(',', '.'))
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      return null
    }
    const amount = end - start
    return computeWorklogLineAmounts(amount, contractedHourRate, selectedOperatorRate)
  }, [form.start_value, form.end_value, contractedHourRate, selectedOperatorRate])

  const handleAdd = async () => {
    const start = Number(String(form.start_value).replace(',', '.'))
    const end = Number(String(form.end_value).replace(',', '.'))
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      toast.error(`${isTruck ? 'Odômetro' : 'Horímetro'} final deve ser maior que o inicial.`)
      return
    }
    if (!form.operator_id) {
      toast.message('Sem operador selecionado', {
        description: 'O custo de mão de obra desta linha fica zero no resumo até escolher um operador.',
      })
    }
    const workDateSubmit =
      serviceYmd && !addFormOtherDay ? serviceYmd : form.work_date

    await createWorklog.mutateAsync({
      tractor_id: !isTruck ? vehicleId : null,
      truck_id: isTruck ? vehicleId : null,
      operator_id: form.operator_id || null,
      work_date: workDateSubmit,
      start_hourmeter: !isTruck ? start : null,
      end_hourmeter: !isTruck ? end : null,
      start_odometer: isTruck ? start : null,
      end_odometer: isTruck ? end : null,
      notes: form.notes || null,
    })
    setForm({
      operator_id: defaultOperatorId ?? '',
      work_date: defaultAddWorkDate,
      start_value: '',
      end_value: '',
      notes: '',
    })
    addDialog.close()
  }

  const startEdit = (log: NonNullable<typeof data>[number]) => {
    addDialog.close()
    setNotesOnlyId(null)
    setNotesOnlyDraft('')
    setEditingId(log.id)
    setEditForm({
      operator_id: log.operator_id ?? '',
      work_date: log.work_date.slice(0, 10),
      start_value: String(isTruck ? log.start_odometer : log.start_hourmeter),
      end_value: String(isTruck ? log.end_odometer : log.end_hourmeter),
      notes: log.notes ?? '',
    })
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    const start = Number(String(editForm.start_value).replace(',', '.'))
    const end = Number(String(editForm.end_value).replace(',', '.'))
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      toast.error(`${isTruck ? 'Odômetro' : 'Horímetro'} final deve ser maior que o inicial.`)
      return
    }
    await updateWorklog.mutateAsync({
      id: editingId,
      payload: {
        operator_id: editForm.operator_id || null,
        work_date: editForm.work_date,
        start_hourmeter: !isTruck ? start : null,
        end_hourmeter: !isTruck ? end : null,
        start_odometer: isTruck ? start : null,
        end_odometer: isTruck ? end : null,
        notes: editForm.notes.trim() || null,
      },
    })
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remover este registo de horímetro?')) return
    await deleteWorklog.mutateAsync(id)
    if (editingId === id) setEditingId(null)
  }

  const openNotesOnly = (log: NonNullable<typeof data>[number]) => {
    addDialog.close()
    setEditingId(null)
    setNotesOnlyId(log.id)
    setNotesOnlyDraft(log.notes ?? '')
  }

  const handleSaveNotesOnly = async () => {
    if (!notesOnlyId) return
    await updateWorklog.mutateAsync({
      id: notesOnlyId,
      payload: { notes: notesOnlyDraft.trim() || null },
    })
    setNotesOnlyId(null)
    setNotesOnlyDraft('')
  }

  const totalQuantities = data?.reduce((acc, w) => acc + (isTruck ? (w.end_odometer ?? 0) - (w.start_odometer ?? 0) : (w.worked_hours ?? 0)), 0) ?? 0

  return (
    <div className="rounded-xl border border-border bg-card p-4 lg:p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-5">
        <div>
          <h2 className="typo-section-title">{isTruck ? 'Odômetro e deslocamento' : 'Horímetro do trator'}</h2>
          <p className="typo-body-muted text-sm mt-1 max-w-xl">
            {serviceLocked
              ? `Serviço encerrado: horas e ${isTruck ? 'odômetro' : 'horímetro'} não podem ser alterados. Pode acrescentar ou corrigir observações em cada linha abaixo.`
              : `Registe a leitura inicial e final do ${isTruck ? 'odômetro' : 'horímetro'} em cada dia ou turno; os valores são calculados automaticamente.`}
          </p>
          {totalQuantities > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#ffcd1175]" />
              <p className="typo-body font-semibold text-foreground">Total: {totalQuantities.toFixed(1)} {isTruck ? 'km' : 'h'} registadas</p>
            </div>
          )}
        </div>
        {!serviceLocked ? (
          <AppButton
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingId(null)
              addDialog.toggle()
            }}
            className="flex items-center gap-1.5 shadow-lg shadow-primary/20 active:scale-95 shrink-0"
          >
            <Plus className="h-3 w-3" />
            Novo registo
          </AppButton>
        ) : null}
      </div>

      {!serviceLocked && addDialog.isOpen ? (
        <div className="rounded-xl border border-border p-4 mb-5 bg-muted/10 space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              {serviceYmd && !addFormOtherDay ? (
                <>
                  <p className="field-label mb-1">Dia do registo</p>
                  <p className="typo-body text-sm text-foreground">
                    {dayjs(serviceYmd).format('DD/MM/YYYY')}
                    <span className="text-muted-foreground"> — mesma data do serviço</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setAddFormOtherDay(true)}
                    className="mt-2 text-xs font-medium text-primary hover:underline"
                  >
                    É outro dia
                  </button>
                </>
              ) : (
                <>
                  <label className="field-label" htmlFor="worklog-add-date">
                    Data do registo
                  </label>
                  <input
                    id="worklog-add-date"
                    type="date"
                    value={form.work_date}
                    onChange={(e) => setForm((f) => ({ ...f, work_date: e.target.value }))}
                    className="field"
                  />
                  {serviceYmd ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAddFormOtherDay(false)
                        setForm((f) => ({ ...f, work_date: serviceYmd }))
                      }}
                      className="mt-2 text-xs font-medium text-primary hover:underline"
                    >
                      Usar data do serviço
                    </button>
                  ) : null}
                </>
              )}
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
                <label className="field-label" title={isTruck ? "Odômetro inicial" : "Horímetro inicial"}>
                  {isTruck ? 'Odômetro inicial' : 'Horímetro inicial'}
                </label>
                <AppDecimalInput
                  value={form.start_value}
                  onValueChange={(v) => setForm((f) => ({ ...f, start_value: v.value }))}
                  placeholder="0,0"
                />
              </div>
              <div>
                <label className="field-label" title={isTruck ? "Odômetro final" : "Horímetro final"}>
                  {isTruck ? 'Odômetro final' : 'Horímetro final'}
                </label>
                <AppDecimalInput
                  value={form.end_value}
                  onValueChange={(v) => setForm((f) => ({ ...f, end_value: v.value }))}
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
                {isTruck ? 'Distância' : 'Horas'}: <span className="font-semibold text-foreground">{(Number(String(form.end_value).replace(',', '.')) - Number(String(form.start_value).replace(',', '.'))).toFixed(2)} {isTruck ? 'km' : 'h'}</span>
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
      ) : null}

      {notesOnlyId && (
        <div className="rounded-xl border border-border p-4 mb-5 bg-card space-y-3">
          <p className="typo-body font-medium">Observações deste lançamento</p>
          <p className="text-xs text-muted-foreground">
            Só o texto abaixo é guardado; horímetro e datas permanecem bloqueados neste serviço encerrado.
          </p>
          <textarea
            value={notesOnlyDraft}
            onChange={(e) => setNotesOnlyDraft(e.target.value)}
            rows={3}
            className="field resize-none"
            placeholder="Ex.: turno da manhã, abastecimento no posto X…"
          />
          <div className="flex flex-wrap gap-2">
            <AppButton variant="primary" size="sm" loading={updateWorklog.isPending} loadingText="…" onClick={handleSaveNotesOnly}>
              Guardar observação
            </AppButton>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={() => {
                setNotesOnlyId(null)
                setNotesOnlyDraft('')
              }}
            >
              Cancelar
            </AppButton>
          </div>
        </div>
      )}

      {!serviceLocked && editingId ? (
        <div className="rounded-xl border border-primary/25 p-4 mb-5 bg-primary/5 space-y-4">
          <p className="typo-body font-medium">Editar registo de horímetro</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="field-label">Data</label>
              <input
                type="date"
                value={editForm.work_date}
                onChange={(e) => setEditForm((f) => ({ ...f, work_date: e.target.value }))}
                className="field"
              />
            </div>
            <div>
              <label className="field-label">Operador</label>
              <select
                value={editForm.operator_id}
                onChange={(e) => setEditForm((f) => ({ ...f, operator_id: e.target.value }))}
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
                <label className="field-label">{isTruck ? 'Odômetro inicial' : 'Horímetro inicial'}</label>
                <AppDecimalInput
                  value={editForm.start_value}
                  onValueChange={(v) => setEditForm((f) => ({ ...f, start_value: v.value }))}
                  placeholder="0,0"
                />
              </div>
              <div>
                <label className="field-label">{isTruck ? 'Odômetro final' : 'Horímetro final'}</label>
                <AppDecimalInput
                  value={editForm.end_value}
                  onValueChange={(v) => setEditForm((f) => ({ ...f, end_value: v.value }))}
                  placeholder="0,0"
                />
              </div>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="field-label">Observações</label>
              <input
                value={editForm.notes}
                onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                className="field"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <AppButton variant="primary" size="sm" loading={updateWorklog.isPending} loadingText="..." onClick={handleSaveEdit}>
              Guardar alterações
            </AppButton>
            <AppButton variant="ghost" size="sm" onClick={() => setEditingId(null)}>
              Cancelar
            </AppButton>
          </div>
        </div>
      ) : null}

      {isLoading && <AppLoadingState />}
      {!isLoading && (!data || data.length === 0) ? (
        <AppEmptyState
          title="Nenhum registo de horímetro"
          description={
            serviceLocked
              ? 'Não há linhas de apontamento. Use «Editar serviço» para observações gerais ou anexar recibo.'
              : 'Adicione a leitura inicial e final do horímetro do trator para apurar horas e valores.'
          }
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
              <div key={log.id} className="relative">
                <AppDataCard
                  title={dayjs(log.work_date).format('DD/MM/YYYY')}
                  subtitle={log.operators?.name || 'Sem operador'}
                  icon={Clock}
                  badge={
                    <AppBadge variant="success">
                      {(log.worked_hours ?? 0).toFixed(1)} h
                    </AppBadge>
                  }
                  items={[
                    { label: isTruck ? 'Odômetro início' : 'Horímetro início', value: `${isTruck ? log.start_odometer : log.start_hourmeter} ${isTruck ? 'km' : 'h'}` },
                    { label: isTruck ? 'Odômetro fim' : 'Horímetro fim', value: `${isTruck ? log.end_odometer : log.end_hourmeter} ${isTruck ? 'km' : 'h'}` },
                    { label: 'Faturação (cliente)', value: <AppMoney value={line.billingLine} size="sm" /> },
                    { label: 'Custo operador', value: <AppMoney value={line.operatorCostLine} size="sm" /> },
                    { label: 'Margem linha', value: <AppMoney value={line.marginLine} size="sm" colored /> },
                  ]}
                  footer={
                    <div className="space-y-2">
                      {log.notes ? (
                        <div className="flex gap-1.5 items-start pt-2 border-t border-border/50">
                          <Tag className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                          <p className="text-xs text-muted-foreground italic line-clamp-2">&ldquo;{log.notes}&rdquo;</p>
                        </div>
                      ) : null}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {serviceLocked ? (
                          <button
                            type="button"
                            onClick={() => openNotesOnly(log)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                          >
                            <Pencil className="h-3 w-3" />
                            {log.notes ? 'Editar observação' : 'Adicionar observação'}
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEdit(log)}
                              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                            >
                              <Pencil className="h-3 w-3" />
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(log.id)}
                              disabled={deleteWorklog.isPending}
                              className="inline-flex items-center gap-1 text-xs font-medium text-destructive hover:underline"
                            >
                              <Trash2 className="h-3 w-3" />
                              Apagar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  }
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
