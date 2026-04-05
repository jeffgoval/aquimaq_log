import { useState } from 'react'
import { FileDown } from 'lucide-react'
import { toast } from 'sonner'
import { AppButton } from '@/shared/components/app/app-button'
import type { ServiceWithJoins, WorklogWithOperator } from '@/integrations/supabase/db-types'
import type { ServiceFinancialSummary } from '../lib/service-financial-summary'

export interface ServiceVoucherPdfButtonProps {
  service: ServiceWithJoins
  worklogs: WorklogWithOperator[]
  summary: ServiceFinancialSummary
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md'
}

export const ServiceVoucherPdfButton = ({
  service,
  worklogs,
  summary,
  variant = 'secondary',
  size = 'sm',
}: ServiceVoucherPdfButtonProps) => {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const { downloadServiceVoucherPdf } = await import('../lib/service-voucher-pdf')
      downloadServiceVoucherPdf({ service, worklogs, summary })
      toast.success('PDF gerado. Use o menu do navegador ou Partilhar para enviar pelo WhatsApp.')
    } catch (e) {
      console.error(e)
      toast.error('Não foi possível gerar o PDF. Tente outra vez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppButton
      type="button"
      variant={variant}
      size={size}
      onClick={() => void handleClick()}
      loading={loading}
      loadingText="A gerar…"
      className="gap-2"
    >
      <FileDown className="h-4 w-4 shrink-0" />
      Comprovante PDF
    </AppButton>
  )
}
