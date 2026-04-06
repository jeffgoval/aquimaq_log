import { useState } from 'react'
import { toast } from 'sonner'
import { AppButton } from '@/shared/components/app/app-button'
import type { ServiceWithJoins } from '@/integrations/supabase/db-types'

interface Props {
  service: ServiceWithJoins
  billingNet: number
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md'
}

export const SimpleReceiptPdfButton = ({ service, billingNet, variant = 'secondary', size = 'sm' }: Props) => {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (billingNet <= 0) {
      toast.error(
        'Sem faturação líquida para o recibo. Para por KM, registe km nos apontamentos; para valor fixo, confira a taxa contratada.',
      )
      return
    }
    setLoading(true)
    try {
      const { downloadSimpleReceiptPdf } = await import('../lib/simple-receipt-pdf')
      downloadSimpleReceiptPdf(service, billingNet)
      toast.success('Recibo gerado. Use o menu do navegador para enviar pelo WhatsApp.')
    } catch (e) {
      console.error(e)
      toast.error('Não foi possível gerar o recibo. Tente outra vez.')
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
    >
      Recibo Simples
    </AppButton>
  )
}
