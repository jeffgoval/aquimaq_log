import { useEffect, useMemo, useState } from 'react'
import { AppSearchInput } from '@/shared/components/app/app-search-input'
import { cn } from '@/shared/lib/cn'

export interface ClientComboboxOption {
  id: string
  name: string | null | undefined
}

export interface ClientComboboxFieldProps {
  clients: ClientComboboxOption[]
  isLoading?: boolean
  /** Id selecionado; quando vazio, o utilizador ainda não escolheu. */
  value: string
  onSelect: (clientId: string) => void
  label?: string
  searchPlaceholder?: string
  errorMessage?: string
  className?: string
}

export const ClientComboboxField = ({
  clients,
  isLoading = false,
  value,
  onSelect,
  label = 'Cliente *',
  searchPlaceholder = 'Digite o nome para filtrar…',
  errorMessage,
  className,
}: ClientComboboxFieldProps) => {
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!value) setQuery('')
  }, [value])

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('pt-BR')
    const sorted = [...clients].sort((a, b) =>
      (a.name ?? '').localeCompare(b.name ?? '', 'pt-BR', { sensitivity: 'base' }),
    )
    if (!q) return sorted
    return sorted.filter((c) => (c.name ?? '').toLocaleLowerCase('pt-BR').includes(q))
  }, [clients, query])

  const listId = 'client-combobox-list'

  return (
    <div className={cn('space-y-2', className)}>
      <label className="field-label" htmlFor="client-combobox-search">
        {label}
      </label>
      <AppSearchInput
        id="client-combobox-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={searchPlaceholder}
        autoComplete="off"
        aria-controls={listId}
        aria-autocomplete="list"
        containerClassName="max-w-none w-full"
        disabled={isLoading}
      />

      <div
        id={listId}
        className="max-h-52 overflow-y-auto rounded-lg border border-border bg-card shadow-sm"
      >
        {isLoading ? (
          <p className="px-3 py-3 text-sm text-muted-foreground">A carregar clientes…</p>
        ) : filtered.length === 0 ? (
          <p className="px-3 py-3 text-sm text-muted-foreground">
            {clients.length === 0
              ? 'Nenhum cliente ativo. Cadastre um cliente novo.'
              : 'Nenhum nome corresponde à pesquisa.'}
          </p>
        ) : (
          <ul role="listbox" aria-label="Clientes" className="list-none divide-y divide-border py-0.5">
            {filtered.map((c) => {
              const display = c.name?.trim() ? c.name.trim() : '(sem nome)'
              return (
                <li key={c.id} className="list-none" role="presentation">
                  <button
                    type="button"
                    role="option"
                    className="flex w-full items-center px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted/80 focus-visible:bg-muted focus-visible:outline-none"
                    onClick={() => onSelect(c.id)}
                  >
                    {display}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {errorMessage ? <p className="field-error">{errorMessage}</p> : null}
    </div>
  )
}
