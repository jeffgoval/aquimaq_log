import type { TractorProfitabilityRow } from '../services/profitability.repository'
import type { ClientRevenueRow, TruckProfitabilityRow } from '@/integrations/supabase/db-types'

function escapeCell(v: string | number): string {
  const s = String(v)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function rowsToCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers.map(escapeCell).join(','), ...rows.map((r) => r.map(escapeCell).join(','))]
  return lines.join('\r\n')
}

export function tractorsToCsv(rows: TractorProfitabilityRow[]): string {
  const headers = [
    'tractor_id',
    'tractor_name',
    'total_hours',
    'gross_revenue',
    'depreciation_cost',
    'operational_cost',
    'operator_cost',
    'net_margin',
    'revenue_per_hour',
    'cost_per_hour',
    'purchase_value',
    'residual_value',
  ]
  const data = rows.map((t) => [
    t.tractor_id ?? '',
    t.tractor_name ?? '',
    Number(t.total_hours ?? 0).toFixed(2),
    Number(t.gross_revenue ?? 0).toFixed(2),
    Number(t.depreciation_cost ?? 0).toFixed(2),
    Number(t.operational_cost ?? 0).toFixed(2),
    Number(t.operator_cost ?? 0).toFixed(2),
    Number(t.net_margin ?? 0).toFixed(2),
    Number(t.revenue_per_hour ?? 0).toFixed(4),
    Number(t.cost_per_hour ?? 0).toFixed(4),
    Number(t.purchase_value ?? 0).toFixed(2),
    Number(t.residual_value ?? 0).toFixed(2),
  ])
  return rowsToCsv(headers, data)
}

export function trucksToCsv(rows: TruckProfitabilityRow[]): string {
  const headers = [
    'truck_id',
    'truck_name',
    'total_km',
    'gross_revenue',
    'depreciation_cost',
    'operational_cost',
    'operator_cost',
    'net_margin',
    'revenue_per_km',
    'cost_per_km',
    'purchase_value',
    'residual_value',
    'useful_life_km',
  ]
  const data = rows.map((t) => [
    t.truck_id,
    t.truck_name,
    Number(t.total_km).toFixed(2),
    Number(t.gross_revenue).toFixed(2),
    Number(t.depreciation_cost).toFixed(2),
    Number(t.operational_cost).toFixed(2),
    Number(t.operator_cost).toFixed(2),
    Number(t.net_margin).toFixed(2),
    Number(t.revenue_per_km).toFixed(4),
    Number(t.cost_per_km).toFixed(4),
    Number(t.purchase_value).toFixed(2),
    Number(t.residual_value).toFixed(2),
    Number(t.useful_life_km).toFixed(0),
  ])
  return rowsToCsv(headers, data)
}

export function clientsToCsv(rows: ClientRevenueRow[]): string {
  const headers = [
    'client_id',
    'client_name',
    'service_count',
    'total_billed',
    'total_received',
    'total_pending',
    'total_overdue',
  ]
  const data = rows.map((c) => [
    c.client_id ?? '',
    c.client_name ?? '',
    String(c.service_count ?? 0),
    Number(c.total_billed ?? 0).toFixed(2),
    Number(c.total_received ?? 0).toFixed(2),
    Number(c.total_pending ?? 0).toFixed(2),
    Number(c.total_overdue ?? 0).toFixed(2),
  ])
  return rowsToCsv(headers, data)
}

export function downloadUtf8Csv(filename: string, csvBody: string): void {
  const blob = new Blob([`\ufeff${csvBody}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
