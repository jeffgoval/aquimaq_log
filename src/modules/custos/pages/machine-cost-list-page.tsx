import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useMachineCosts, useCreateCost } from '../hooks/use-cost-queries'
import { useTractorOptions } from '@/modules/tratores/hooks/use-tractor-queries'
import { useSupplierOptions } from '@/modules/fornecedores/hooks/use-supplier-queries'
import { ROUTES } from '@/shared/constants/routes'
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
import dayjs from '@/shared/lib/dayjs'
import { getPreferredTractorId, sortTractorsForSelect } from '@/shared/lib/tractors-select'

const COST_TYPE_LABELS = { fuel: '⛽ Combustível', oil: '🛢️ Óleo', parts: '🔧 Peças', maintenance: '🔩 Manutenção', other: '📋 Outro' }

export function MachineCostListPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, error, refetch } = useMachineCosts()
  const tractors = useTractorOptions()
  const suppliers = useSupplierOptions()
  const createCost = useCreateCost()
  const addDialog = useDisclosure()

  const [form, setForm] = useState({
    tractor_id: '',
    supplier_id: '',
    cost_type: 'fuel' as const,
    amount: '',
    description: '',
    cost_date: dayjs().format('YYYY-MM-DD'),
  })

  const tractorOptionsSorted = useMemo(() => sortTractorsForSelect(tractors.data), [tractors.data])

  useEffect(() => {
    if (!addDialog.isOpen || !tractorOptionsSorted.length) return
    setForm((f) => {
      if (f.tractor_id) return f
      const id = getPreferredTractorId(tractorOptionsSorted)
      return id ? { ...f, tractor_id: id } : f
    })
  }, [addDialog.isOpen, tractorOptionsSorted])

  const filtered = data?.filter((c) => {
    const q = search.toLowerCase()
    const supplierLabel = c.suppliers?.name || c.supplier_name || ''
    return (
      c.description?.toLowerCase().includes(q) ||
      c.tractors?.name.toLowerCase().includes(q) ||
      supplierLabel.toLowerCase().includes(q)
    )
  })

  const handleAdd = async () => {
    if (!form.tractor_id || !form.amount) return
    await createCost.mutateAsync({
      tractor_id: form.tractor_id,
      supplier_id: form.supplier_id || null,
      cost_type: form.cost_type as never,
      amount: Number(form.amount),
      description: form.description || null,
      supplier_name: null,
      cost_date: form.cost_date,
    })
    setForm({
      tractor_id: '',
      supplier_id: '',
      cost_type: 'fuel',
      amount: '',
      description: '',
      cost_date: dayjs().format('YYYY-MM-DD'),
    })
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
          <h2 className="typo-section-title text-muted-foreground">Novo registro de custo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="field-label">Trator *</label>
              <select value={form.tractor_id} onChange={e => setForm(f => ({ ...f, tractor_id: e.target.value }))} className="field">
                <option value="">Selecione...</option>
                {tractorOptionsSorted.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
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
              <select
                value={form.supplier_id}
                onChange={(e) => setForm((f) => ({ ...f, supplier_id: e.target.value }))}
                className="field"
              >
                <option value="">Nenhum / selecione...</option>
                {suppliers.data?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-muted-foreground">
                <Link to={ROUTES.SUPPLIER_NEW} className="text-primary hover:underline font-medium">
                  Cadastrar novo fornecedor
                </Link>
              </p>
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
                  { label: 'Fornecedor', value: cost.suppliers?.name || cost.supplier_name || '—' },
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
