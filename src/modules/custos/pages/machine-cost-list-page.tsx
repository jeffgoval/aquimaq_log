import { useState } from 'react'
import { useMachineCosts, useCreateCost } from '../hooks/use-cost-queries'
import { useTractorOptions } from '@/modules/tratores/hooks/use-tractor-queries'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { AppMoney } from '@/shared/components/app/app-money'
import { AppCurrencyInput } from '@/shared/components/app/app-numeric-input'
import { useDisclosure } from '@/shared/hooks/use-disclosure'
import { Plus, Wrench } from 'lucide-react'
import dayjs from 'dayjs'

const COST_TYPE_LABELS = { fuel: '⛽ Combustível', oil: '🛢️ Óleo', parts: '🔧 Peças', maintenance: '🔩 Manutenção', other: '📋 Outro' }

export function MachineCostListPage() {
  const { data, isLoading, isError, error, refetch } = useMachineCosts()
  const tractors = useTractorOptions()
  const createCost = useCreateCost()
  const addDialog = useDisclosure()

  const [form, setForm] = useState({ tractor_id: '', cost_type: 'fuel' as const, amount: '', description: '', supplier_name: '', cost_date: dayjs().format('YYYY-MM-DD') })

  const handleAdd = async () => {
    if (!form.tractor_id || !form.amount) return
    await createCost.mutateAsync({ tractor_id: form.tractor_id, cost_type: form.cost_type as never, amount: Number(form.amount), description: form.description || null, supplier_name: form.supplier_name || null, cost_date: form.cost_date })
    setForm({ tractor_id: '', cost_type: 'fuel', amount: '', description: '', supplier_name: '', cost_date: dayjs().format('YYYY-MM-DD') })
    addDialog.close()
  }

  const total = data?.reduce((a, c) => a + c.amount, 0) ?? 0

  return (
    <div>
      <AppPageHeader
        title="Custos de Máquina"
        description={`Investimento total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}`}
        actions={
          <button onClick={addDialog.toggle} className="flex items-center gap-2 gradient-amber text-white font-semibold px-4 py-2 rounded-lg hover:opacity-90 text-sm shadow-sm transition-all">
            <Plus className="h-4 w-4" />Registrar custo
          </button>
        }
      />

      {addDialog.isOpen && (
        <div className="rounded-xl border border-border bg-card p-4 lg:p-6 mb-6 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Novo registro de custo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Trator *</label>
              <select value={form.tractor_id} onChange={e => setForm(f => ({ ...f, tractor_id: e.target.value }))} className="w-full mt-1 rounded-lg border border-input bg-input px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none">
                <option value="">Selecione...</option>
                {tractors.data?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Tipo</label>
              <select value={form.cost_type} onChange={e => setForm(f => ({ ...f, cost_type: e.target.value as never }))} className="w-full mt-1 rounded-lg border border-input bg-input px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none">
                {Object.entries(COST_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Valor *</label>
              <AppCurrencyInput value={form.amount} onValueChange={v => setForm(f => ({ ...f, amount: v.value }))} className="w-full mt-1 rounded-lg border border-input bg-input px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none" placeholder="R$ 0,00" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Data</label>
              <input type="date" value={form.cost_date} onChange={e => setForm(f => ({ ...f, cost_date: e.target.value }))} className="w-full mt-1 rounded-lg border border-input bg-input px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Fornecedor</label>
              <input value={form.supplier_name} onChange={e => setForm(f => ({ ...f, supplier_name: e.target.value }))} className="w-full mt-1 rounded-lg border border-input bg-input px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none" placeholder="Nome do fornecedor" />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button onClick={handleAdd} disabled={createCost.isPending} className="gradient-amber text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-md hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50 uppercase">
              {createCost.isPending ? 'Salvando...' : 'Salvar Custo'}
            </button>
            <button onClick={addDialog.close} className="text-xs font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider">Cancelar</button>
          </div>
        </div>
      )}

      {isLoading && <AppLoadingState />}
      {isError && <AppErrorState message={error.message} onRetry={refetch} />}
      {!isLoading && !isError && (
        !data?.length ? <AppEmptyState title="Nenhum custo registrado" />
          : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.map(cost => (
              <div key={cost.id} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 group transition-all hover:border-primary/30">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      {dayjs(cost.cost_date).format('DD [de] MMMM')}
                    </p>
                    <h3 className="font-bold text-foreground text-sm truncate mt-0.5">{cost.tractors?.name || 'Maquinário'}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground uppercase tracking-tighter">
                   {COST_TYPE_LABELS[cost.cost_type as keyof typeof COST_TYPE_LABELS].split(' ')[1]}
                  </span>
                </div>

                <div className="py-2 border-y border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Valor</p>
                  <AppMoney value={cost.amount} size="sm" />
                  {cost.description && <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1 italic">"{cost.description}"</p>}
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-auto">
                  <span className="truncate flex-1 mr-2">{cost.supplier_name || 'Fornecedor não informado'}</span>
                  <Wrench className="h-3 w-3 shrink-0" />
                </div>
              </div>
            ))}
          </div>
      )}
    </div>
  )
}
