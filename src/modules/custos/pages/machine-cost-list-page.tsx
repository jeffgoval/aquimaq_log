import { useState } from 'react'
import { useMachineCosts, useCreateCost } from '../hooks/use-cost-queries'
import { useTractorOptions } from '@/modules/tratores/hooks/use-tractor-queries'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { AppMoney } from '@/shared/components/app/app-money'
import { AppCurrencyInput } from '@/shared/components/app/app-numeric-input'
import { AppButton } from '@/shared/components/app/app-button'
import { useDisclosure } from '@/shared/hooks/use-disclosure'
import { AppBadge } from '@/shared/components/app/app-badge'
import { AppSearchInput } from '@/shared/components/app/app-search-input'
import { AppDataCard } from '@/shared/components/app/app-data-card'
import { Plus, Wrench } from 'lucide-react'
import dayjs from 'dayjs'

const COST_TYPE_LABELS = { fuel: '⛽ Combustível', oil: '🛢️ Óleo', parts: '🔧 Peças', maintenance: '🔩 Manutenção', other: '📋 Outro' }

export function MachineCostListPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, error, refetch } = useMachineCosts()
  const tractors = useTractorOptions()
  const createCost = useCreateCost()
  const addDialog = useDisclosure()

  const [form, setForm] = useState({ tractor_id: '', cost_type: 'fuel' as const, amount: '', description: '', supplier_name: '', cost_date: dayjs().format('YYYY-MM-DD') })

  const filtered = data?.filter(c =>
    c.description?.toLowerCase().includes(search.toLowerCase()) ||
    c.tractors?.name.toLowerCase().includes(search.toLowerCase()) ||
    c.supplier_name?.toLowerCase().includes(search.toLowerCase())
  )

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
          <AppButton
            variant="primary"
            size="md"
            onClick={addDialog.toggle}
            className="flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Registrar Custo
          </AppButton>
        }
      />

      <AppSearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por trator, descrição ou fornecedor..."
        containerClassName="mb-4"
      />

      {addDialog.isOpen && (
        <div className="rounded-xl border border-border bg-card p-4 lg:p-6 mb-6 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Novo registro de custo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
              <AppCurrencyInput value={form.amount} onValueChange={v => setForm(f => ({ ...f, amount: v.value }))} placeholder="R$ 0,00" />
            </div>
            <div>
              <label className="field-label">Data</label>
              <input type="date" value={form.cost_date} onChange={e => setForm(f => ({ ...f, cost_date: e.target.value }))} className="field" />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="field-label">Fornecedor</label>
              <input value={form.supplier_name} onChange={e => setForm(f => ({ ...f, supplier_name: e.target.value }))} className="field" placeholder="Nome do fornecedor" />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <AppButton
              variant="primary"
              size="lg"
              loading={createCost.isPending}
              loadingText="Salvando..."
              onClick={handleAdd}
            >
              Salvar Custo
            </AppButton>
            <AppButton variant="ghost" size="md" onClick={addDialog.close}>Cancelar</AppButton>
          </div>
        </div>
      )}

      {isLoading && <AppLoadingState />}
      {isError && <AppErrorState message={error.message} onRetry={refetch} />}
      {!isLoading && !isError && (
        !filtered?.length ? <AppEmptyState title="Nenhum custo registrado" />
          : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered?.map(cost => (
              <AppDataCard
                key={cost.id}
                title={cost.tractors?.name || 'Maquinário'}
                subtitle={dayjs(cost.cost_date).format('DD [de] MMMM')}
                icon={Wrench}
                badge={
                  <AppBadge variant="default">
                    {COST_TYPE_LABELS[cost.cost_type as keyof typeof COST_TYPE_LABELS].split(' ')[1]}
                  </AppBadge>
                }
                items={[
                  { label: 'Valor', value: <AppMoney value={cost.amount} size="sm" /> },
                  { label: 'Fornecedor', value: cost.supplier_name || '—' },
                ]}
                footer={
                  cost.description ? (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic border-t border-border/50 pt-2">
                      "{cost.description}"
                    </p>
                  ) : undefined
                }
              />
            ))}
          </div>
      )}
    </div>
  )
}
