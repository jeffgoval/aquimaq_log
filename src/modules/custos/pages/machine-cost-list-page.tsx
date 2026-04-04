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
        description={`Total: R$ ${total.toFixed(2)}`}
        actions={
          <button onClick={addDialog.toggle} className="flex items-center gap-2 gradient-amber text-white font-semibold px-4 py-2 rounded-lg hover:opacity-90 text-sm">
            <Plus className="h-4 w-4" />Registrar custo
          </button>
        }
      />

      {addDialog.isOpen && (
        <div className="rounded-xl border border-border bg-card p-6 mb-6 space-y-4">
          <h2 className="text-sm font-semibold">Novo custo</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="field-label">Trator *</label>
              <select value={form.tractor_id} onChange={e => setForm(f => ({ ...f, tractor_id: e.target.value }))} className="field">
                <option value="">Selecione...</option>
                {tractors.data?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Tipo</label>
              <select value={form.cost_type} onChange={e => setForm(f => ({ ...f, cost_type: e.target.value as never }))} className="field">
                {Object.entries(COST_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Valor *</label>
              <AppCurrencyInput value={form.amount} onValueChange={v => setForm(f => ({ ...f, amount: v.value }))} className="field" placeholder="R$ 0,00" />
            </div>
            <div>
              <label className="field-label">Data</label>
              <input type="date" value={form.cost_date} onChange={e => setForm(f => ({ ...f, cost_date: e.target.value }))} className="field" />
            </div>
            <div>
              <label className="field-label">Fornecedor</label>
              <input value={form.supplier_name} onChange={e => setForm(f => ({ ...f, supplier_name: e.target.value }))} className="field" placeholder="Nome do fornecedor" />
            </div>
            <div>
              <label className="field-label">Descrição</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="field" placeholder="Detalhe do custo" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={createCost.isPending} className="gradient-amber text-white text-sm font-medium px-4 py-2 rounded-lg">{createCost.isPending ? 'Salvando...' : 'Salvar'}</button>
            <button onClick={addDialog.close} className="text-sm text-muted-foreground hover:text-foreground">Cancelar</button>
          </div>
        </div>
      )}

      {isLoading && <AppLoadingState />}
      {isError && <AppErrorState message={error.message} onRetry={refetch} />}
      {!isLoading && !isError && (
        !data?.length ? <AppEmptyState title="Nenhum custo registrado" />
          : <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['Data', 'Trator', 'Tipo', 'Descrição', 'Fornecedor', 'Valor'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map(cost => (
                  <tr key={cost.id} className="border-b border-border last:border-0 hover:bg-muted/10">
                    <td className="px-4 py-3 text-muted-foreground">{dayjs(cost.cost_date).format('DD/MM/YY')}</td>
                    <td className="px-4 py-3 font-medium">{cost.tractors?.name || '—'}</td>
                    <td className="px-4 py-3"><span className="flex items-center gap-1.5"><Wrench className="h-3.5 w-3.5 text-muted-foreground" />{COST_TYPE_LABELS[cost.cost_type as keyof typeof COST_TYPE_LABELS]}</span></td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{cost.description || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{cost.supplier_name || '—'}</td>
                    <td className="px-4 py-3"><AppMoney value={cost.amount} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      )}
    </div>
  )
}
