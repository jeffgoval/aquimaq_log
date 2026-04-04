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
    <div className="rounded-xl border border-border bg-card p-4 lg:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Apontamentos</h2>
          {totalHours > 0 && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] font-bold text-foreground">Total: {totalHours.toFixed(1)}h trabalhadas</p>
            </div>
          )}
        </div>
        <button onClick={addDialog.toggle} className="flex items-center gap-1.5 text-[10px] uppercase font-bold gradient-amber text-white px-3 py-1.5 rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all">
          <Plus className="h-3 w-3" />Registrar
        </button>
      </div>

      {/* Add form */}
      {addDialog.isOpen && (
        <div className="rounded-xl border border-border p-4 mb-5 bg-muted/10 space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Data</label>
              <input type="date" value={form.work_date} onChange={e => setForm(f => ({ ...f, work_date: e.target.value }))} className="w-full mt-1 rounded-lg border border-input bg-input px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Operador</label>
              <select value={form.operator_id} onChange={e => setForm(f => ({ ...f, operator_id: e.target.value }))} className="w-full mt-1 rounded-lg border border-input bg-input px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none">
                <option value="">Nenhum</option>
                {operators.data?.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">H. Inicial</label>
                <AppDecimalInput value={form.start_hourmeter} onValueChange={v => setForm(f => ({ ...f, start_hourmeter: v.value }))} className="w-full mt-1 rounded-lg border border-input bg-input px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none" placeholder="0,0" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">H. Final</label>
                <AppDecimalInput value={form.end_hourmeter} onValueChange={v => setForm(f => ({ ...f, end_hourmeter: v.value }))} className="w-full mt-1 rounded-lg border border-input bg-input px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none" placeholder="0,0" />
              </div>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Observações</label>
              <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full mt-1 rounded-lg border border-input bg-input px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none" placeholder="Algum detalhe importante..." />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button onClick={handleAdd} disabled={createWorklog.isPending} className="flex-1 lg:flex-none gradient-amber text-white text-[10px] font-bold px-5 py-2.5 rounded-lg shadow-md uppercase">
              {createWorklog.isPending ? 'Salvando...' : 'Salvar Apontamento'}
            </button>
            <button onClick={addDialog.close} className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest">Cancelar</button>
          </div>
        </div>
      )}

      {isLoading && <AppLoadingState />}
      {!isLoading && (!data || data.length === 0) ? (
        <AppEmptyState title="Nenhum apontamento" description="Registre horas trabalhadas neste serviço" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {data?.map(log => (
            <div key={log.id} className="flex flex-col gap-2 rounded-xl border border-border bg-muted/5 p-3 hover:border-primary/30 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-1.5"><Clock className="h-3.5 w-3.5 text-primary" /></div>
                  <div className="min-w-0">
                    <p className="font-bold text-foreground text-xs">{dayjs(log.work_date).format('DD/MM/YYYY')}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-tight">
                      {log.operators?.name || 'Sem operador'}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-primary text-sm whitespace-nowrap">{(log.worked_hours ?? 0).toFixed(1)}h</p>
              </div>
              <div className="mt-1 flex items-center justify-between py-1.5 px-2 bg-muted/20 rounded-lg text-[10px] text-muted-foreground font-mono">
                <span>Início: {log.start_hourmeter}h</span>
                <span className="opacity-30">|</span>
                <span>Fim: {log.end_hourmeter}h</span>
              </div>
              {log.notes && (
                <p className="text-[10px] text-muted-foreground italic line-clamp-1 border-t border-border/30 pt-1 mt-1">"{log.notes}"</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
