/**
 * Recibo simples para serviços de guincho / frete — voltado ao cliente PF.
 * Formato limpo e direto: empresa, cliente, descrição do serviço, valor.
 */
import { jsPDF } from 'jspdf'
import dayjs from '@/shared/lib/dayjs'
import { currency } from '@/shared/lib/currency'
import type { ServiceWithJoins } from '@/integrations/supabase/db-types'

const ISSUER = 'Aquimaq Log'
const MARGIN = 20
const PAGE_W = 210
const LINE_H = 6

function safeFilenamePart(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'cliente'
}

function row(doc: jsPDF, label: string, value: string, y: number): number {
  const maxW = PAGE_W - 2 * MARGIN
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text(label, MARGIN, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const lines = doc.splitTextToSize(value, maxW - 36)
  doc.text(lines, MARGIN + 36, y)
  return y + Math.max(LINE_H, lines.length * LINE_H)
}

export function buildSimpleReceiptPdf(service: ServiceWithJoins, billingNet: number): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })

  const clientName = service.clients?.name?.trim() || 'Cliente'
  const truckName = service.trucks?.name?.trim() || service.tractors?.name?.trim() || 'Guincho'
  const date = dayjs(service.service_date).format('DD/MM/YYYY')
  const refShort = service.id.slice(0, 8).toUpperCase()

  let y = MARGIN

  // Header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('RECIBO DE SERVIÇO', PAGE_W / 2, y, { align: 'center' })
  y += 8

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(90, 90, 90)
  doc.text(ISSUER, PAGE_W / 2, y, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  y += 3

  // Separator
  doc.setDrawColor(60, 60, 60)
  doc.setLineWidth(0.5)
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)
  y += 8

  // Big amount highlight
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Valor recebido:', MARGIN, y)
  doc.setFontSize(18)
  doc.text(currency.format(billingNet), PAGE_W - MARGIN, y, { align: 'right' })
  y += 10

  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)
  y += 8

  // Service details
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)

  y = row(doc, 'Cliente:', clientName, y)
  y += 1
  y = row(doc, 'Data do serviço:', date, y)
  y += 1
  y = row(doc, 'Veículo:', truckName, y)
  y += 1

  if (service.truck_id) {
    if (service.towed_vehicle_plate || service.towed_vehicle_brand || service.towed_vehicle_model) {
      const vehicle = [
        service.towed_vehicle_plate?.toUpperCase(),
        service.towed_vehicle_brand,
        service.towed_vehicle_model,
      ].filter(Boolean).join(' — ')
      y = row(doc, 'Veículo socorrido:', vehicle, y)
      y += 1
    }
    if (service.origin_location || service.destination_location) {
      const route = [service.origin_location, service.destination_location].filter(Boolean).join(' → ')
      y = row(doc, 'Trajeto:', route, y)
      y += 1
    }
  }

  if (service.charge_type === 'por_km') {
    y = row(doc, 'Cobrança:', 'Por KM rodado', y)
    y += 1
  } else if (service.charge_type === 'valor_fixo') {
    y = row(doc, 'Cobrança:', 'Valor fixo', y)
    y += 1
  }

  if (service.notes?.trim()) {
    y = row(doc, 'Observações:', service.notes.trim(), y)
    y += 1
  }

  y += 2
  y = row(doc, 'Ref. interna:', refShort, y)
  y += 10

  // Separator
  doc.setDrawColor(60, 60, 60)
  doc.setLineWidth(0.5)
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)
  y += 8

  // Signature area
  const colL = MARGIN
  const colR = PAGE_W / 2 + 10
  const sigY = y + 14

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setDrawColor(120, 120, 120)
  doc.setLineWidth(0.3)
  doc.line(colL, sigY, colL + 70, sigY)
  doc.line(colR, sigY, colR + 70, sigY)
  y = sigY + 4
  doc.text('Assinatura do prestador', colL, y)
  doc.text('Assinatura do cliente', colR, y)
  y += 10

  // Footer
  doc.setFontSize(7)
  doc.setTextColor(120, 120, 120)
  doc.text(
    `Emitido em ${dayjs().format('DD/MM/YYYY [às] HH:mm')} · ${ISSUER}`,
    PAGE_W / 2,
    y,
    { align: 'center' },
  )
  doc.setTextColor(0, 0, 0)

  return doc
}

export function downloadSimpleReceiptPdf(service: ServiceWithJoins, billingNet: number): void {
  const doc = buildSimpleReceiptPdf(service, billingNet)
  const client = safeFilenamePart(service.clients?.name ?? 'cliente')
  const date = dayjs(service.service_date).format('YYYY-MM-DD')
  doc.save(`Recibo-${client}-${date}.pdf`)
}
