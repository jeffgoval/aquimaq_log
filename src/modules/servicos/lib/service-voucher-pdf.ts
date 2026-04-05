import { jsPDF } from 'jspdf'
import dayjs from '@/shared/lib/dayjs'
import { currency } from '@/shared/lib/currency'
import type { ServiceWithJoins, WorklogWithOperator } from '@/integrations/supabase/db-types'
import type { ServiceFinancialSummary } from './service-financial-summary'
import { SERVICE_STATUS_LABELS } from '@/shared/constants/status'

const ISSUER = 'Aquimaq Log'
const MARGIN = 18
const LINE_H = 5.5
const PAGE_BOTTOM = 285

function safeFilenamePart(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'cliente'
}

function nextY(doc: jsPDF, y: number, step: number): number {
  if (y + step > PAGE_BOTTOM) {
    doc.addPage()
    return MARGIN
  }
  return y
}

function addWrapped(
  doc: jsPDF,
  text: string,
  y: number,
  maxW: number,
  fontSize: number,
  style: 'normal' | 'bold' = 'normal',
): number {
  doc.setFontSize(fontSize)
  doc.setFont('helvetica', style)
  const lines = doc.splitTextToSize(text, maxW)
  let cy = y
  for (const line of lines) {
    cy = nextY(doc, cy, LINE_H)
    doc.text(line, MARGIN, cy)
    cy += LINE_H
  }
  return cy
}

export function buildServiceVoucherPdf(params: {
  service: ServiceWithJoins
  worklogs: WorklogWithOperator[]
  summary: ServiceFinancialSummary
}): jsPDF {
  const { service, worklogs, summary } = params
  const pageW = 210
  const maxW = pageW - 2 * MARGIN

  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  let y = MARGIN

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Comprovante de Serviço', pageW / 2, y, { align: 'center' })
  y += 9

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(90, 90, 90)
  doc.text(ISSUER, pageW / 2, y, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  y += 10

  const clientName = service.clients?.name?.trim() || 'Cliente'
  const tractorName = service.tractors?.name?.trim() || 'Equipamento'
  const refShort = `${service.id.slice(0, 8)}…`

  y = addWrapped(doc, `Cliente: ${clientName}`, y, maxW, 11, 'bold')
  y = addWrapped(doc, `Equipamento: ${tractorName}`, y, maxW, 10)
  y = addWrapped(
    doc,
    `Data de referência: ${dayjs(service.service_date).format('DD/MM/YYYY')}`,
    y,
    maxW,
    10,
  )
  y = addWrapped(doc, `Ref. interna: ${refShort}`, y, maxW, 9)
  const statusLabel = SERVICE_STATUS_LABELS[service.status] ?? service.status
  y = addWrapped(doc, `Situação: ${statusLabel}`, y, maxW, 9)
  y += 3

  doc.setDrawColor(200, 200, 200)
  doc.line(MARGIN, y, pageW - MARGIN, y)
  y += 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  y = nextY(doc, y, LINE_H)
  doc.text('Detalhe por período (horímetro)', MARGIN, y)
  y += LINE_H + 2

  const sorted = [...worklogs].sort(
    (a, b) => dayjs(a.work_date).valueOf() - dayjs(b.work_date).valueOf(),
  )

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  const colD = MARGIN
  const colH = MARGIN + 28
  const colM = MARGIN + 42
  const colV = MARGIN + 118
  y = nextY(doc, y, LINE_H)
  doc.text('Data', colD, y)
  doc.text('Horas', colH, y)
  doc.text('Horímetro (ini → fim)', colM, y)
  doc.text('Valor', colV, y)
  y += LINE_H - 1
  doc.setDrawColor(220, 220, 220)
  doc.line(MARGIN, y, pageW - MARGIN, y)
  y += 4

  doc.setFont('helvetica', 'normal')
  const rate = Number(service.contracted_hour_rate) || 0

  const validLogs = sorted.filter((w) => {
    const h = Number(w.worked_hours ?? 0)
    return Number.isFinite(h) && h > 0
  })

  if (validLogs.length === 0) {
    y = addWrapped(doc, 'Nenhum registo de horímetro com horas neste serviço.', y, maxW, 9)
  } else {
    for (const w of validLogs) {
      const h = Number(w.worked_hours ?? 0)
      const lineVal = h * rate
      const d = dayjs(w.work_date).format('DD/MM/YYYY')
      const hm = `${Number(w.start_hourmeter).toLocaleString('pt-BR')} → ${Number(w.end_hourmeter).toLocaleString('pt-BR')} h`
      y = nextY(doc, y, LINE_H * 2)
      doc.setFontSize(8)
      const rowTop = y
      doc.text(d, colD, rowTop)
      doc.text(`${h.toLocaleString('pt-BR', { maximumFractionDigits: 2, minimumFractionDigits: 0 })} h`, colH, rowTop)
      const hmLines = doc.splitTextToSize(hm, 68)
      let hy = rowTop
      for (const hl of hmLines) {
        hy = nextY(doc, hy, LINE_H)
        doc.text(hl, colM, hy)
        hy += LINE_H - 0.5
      }
      doc.text(currency.format(lineVal), colV, rowTop)
      y = Math.max(rowTop + LINE_H, hy) + 1

      const note = w.notes?.trim()
      if (note) {
        doc.setFontSize(7)
        doc.setTextColor(80, 80, 80)
        y = addWrapped(doc, `  Nota: ${note}`, y, maxW - 4, 7)
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(8)
      }
    }
  }

  y += 6
  doc.setDrawColor(200, 200, 200)
  doc.line(MARGIN, y, pageW - MARGIN, y)
  y += 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  y = nextY(doc, y, LINE_H)
  doc.text('Resumo (valores para o cliente)', MARGIN, y)
  y += LINE_H + 3

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  const unit = summary.quantityUnit ?? 'h'
  const rows: [string, string][] = [
    [unit === 'km' ? 'Total de km' : 'Total de horas', `${summary.totalQuantity.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${unit}`],
    ['Taxa contratada', `${currency.format(rate)} / ${unit}`],
    [unit === 'km' ? 'Subtotal (km × taxa)' : 'Subtotal (horas × taxa)', currency.format(summary.billingGross)],
  ]
  if (summary.ownerDiscountApplied > 0) {
    rows.push(['Desconto acordado', `− ${currency.format(summary.ownerDiscountApplied)}`])
  }
  rows.push(['Total a cobrar (líquido)', currency.format(summary.billingNet)])

  for (const [label, value] of rows) {
    y = nextY(doc, y, LINE_H + 1)
    doc.text(label, MARGIN, y)
    doc.text(value, pageW - MARGIN, y, { align: 'right' })
    y += LINE_H
  }

  y += 6
  const svcNotes = service.notes?.trim()
  if (svcNotes) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    y = nextY(doc, y, LINE_H)
    doc.text('Observações do serviço', MARGIN, y)
    y += LINE_H
    doc.setFont('helvetica', 'normal')
    y = addWrapped(doc, svcNotes, y, maxW, 9)
    y += 4
  }

  y = nextY(doc, y, LINE_H * 3)
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  y = addWrapped(
    doc,
    'Documento informativo do serviço prestado. Conserve este comprovante para sua conferência.',
    y,
    maxW,
    8,
  )
  y = addWrapped(
    doc,
    `Emitido em ${dayjs().format('DD/MM/YYYY [às] HH:mm')}`,
    y,
    maxW,
    8,
  )
  doc.setTextColor(0, 0, 0)

  return doc
}

export function downloadServiceVoucherPdf(params: {
  service: ServiceWithJoins
  worklogs: WorklogWithOperator[]
  summary: ServiceFinancialSummary
}): void {
  const doc = buildServiceVoucherPdf(params)
  const { service } = params
  const client = safeFilenamePart(service.clients?.name ?? 'cliente')
  const date = dayjs(service.service_date).format('YYYY-MM-DD')
  const name = `Comprovante-${client}-${date}.pdf`
  doc.save(name)
}
