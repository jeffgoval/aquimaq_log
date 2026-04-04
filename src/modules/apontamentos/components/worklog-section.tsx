import { useState } from 'react'
import { useWorklogsByService, useCreateWorklog } from '../hooks/use-worklog-queries'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { useDisclosure } from '@/shared/hooks/use-disclosure'
import { AppDecimalInput } from '@/shared/components/app/app-numeric-input'
import { useOperatorOptions } from '@/modules/operadores/hooks/use-operator-queries'
import { Clock, Plus } from 'lucide-react'
import dayjs from 'dayjs'

interface WorklogSectionProps {
  serviceId: string
  tractorId: string
}

export function WorklogSection({ serviceId, tractorId }: WorklogSectionProps) {
  const { data, isLoading } = useWorklogsByService(serviceId)
  const createWorklog = useCreateWorklog(serviceId)
  const operators = useOperatorOptions()
  const addDialog = useDisclosure()

  const [form, setForm] = useState({ operator_id: '', work_date: dayjs().format('YYYY-MM-DD'), start_hourmeter: '', end_hourmeter: '', notes: '' })

  const handleAdd = async () => {
    const start = Number(form.start_hourmeter)
    const end = Number(form.end_hourmeter)
    if (end <= start) { alert('Horímetro final deve ser maior que o inicial'); return }
    await createWorklog.mutateAsync({
      tractor_id: tractorId,
      operator_id: form.operator_id || null,
      work_date: form.work_date,
      start_hourmeter: start,
      end_hourmeter: end,
      notes: form.notes || null,
    })
    setForm({ operator_id: '', work_date: dayjs().format('YYYY-MM-DD'), start_hourmeter: '', end_hourmeter: '', notes: '' })
    addDialog.close()
  }

  const totalHours = data?.reduce((acc, w) => acc + (w.worked_hours ?? 0), 0) ?? 0

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Apontamentos</h2>
          {totalHours > 0 && <p className="text-xs text-muted-foreground mt-0.5">Total: {totalHours.toFixed(1)}h trabalhadas</p>}
        </div>
        <button onClick={addDialog.toggle} className="flex items-center gap-1.5 text-xs gradient-amber text-white font-medium px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
          <Plus className="h-3.5 w-3.5" />Registrar
        </button>
      </div>

      {/* Add form */}
      {addDialog.isOpen && (
        <div className="rounded-lg border border-border p-4 mb-4 bg-muted/20 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="field-label">Data</label>
              <input type="date" value={form.work_date} onChange={e => setForm(f => ({ ...f, work_date: e.target.value }))} className="field" />
            </div>
            <div>
              <label className="field-label">Operador</label>
              <select value={form.operator_id} onChange={e => setForm(f => ({ ...f, operator_id: e.target.value }))} className="field">
                <option value="">Nenhum</option>
                {operators.data?.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Horímetro inicial</label>
              <AppDecimalInput value={form.start_hourmeter} onValueChange={v => setForm(f => ({ ...f, start_hourmeter: v.value }))} className="field" placeholder="0,0" />
            </div>
            <div>
              <label className="field-label flex justify-between">
                <span>Horímetro final</span>
                {Number(form.end_hourmeter) > Number(form.start_hourmeter) && (
                  <span className="text-primary font-bold">
                    = {(Number(form.end_hourmeter) - Number(form.start_hourmeter)).toFixed(1)}h
                  </span>
                )}
              </label>
              <AppDecimalInput value={form.end_hourmeter} onValueChange={v => setForm(f => ({ ...f, end_hourmeter: v.value }))} className="field" placeholder="0,0" />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Observações</label>
              <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="field" placeholder="..." />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={createWorklog.isPending} className="gradient-amber text-white text-xs font-medium px-4 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-50">
              {createWorklog.isPending ? 'Salvando...' : 'Salvar'}
            </button>
            <button onClick={addDialog.close} className="text-xs text-muted-foreground hover:text-foreground">Cancelar</button>
          </div>
        </div>
      )}

      {isLoading && <AppLoadingState />}
      {!isLoading && (!data || data.length === 0) ? (
        <AppEmptyState title="Nenhum apontamento" description="Registre horas trabalhadas neste serviço" />
      ) : (
        <div className="space-y-2">
          {data?.map(log => (
            <div key={log.id} className="flex items-center gap-4 rounded-lg border border-border p-3 text-sm">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{dayjs(log.work_date).format('DD/MM/YYYY')}</p>
                <p className="text-xs text-muted-foreground">{log.operators?.name || 'Sem operador'}</p>
              </div>
              <p className="text-xs text-muted-foreground">{log.start_hourmeter}h → {log.end_hourmeter}h</p>
              <p className="font-bold text-primary">{(log.worked_hours ?? 0).toFixed(1)}h</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
