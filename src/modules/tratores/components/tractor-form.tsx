import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AppButton } from '@/shared/components/app/app-button'
import {
  FormGrid,
  FormSection,
  RHFCurrencyField,
  RHFDecimalField,
  RHFTextareaField,
  RHFTextField,
} from '@/shared/components/form'
import type { useTractorFormController } from '../hooks/use-tractor-form-controller'
import { ROUTES } from '@/shared/constants/routes'

type TractorFormController = ReturnType<typeof useTractorFormController>

interface TractorFormProps {
  controller: TractorFormController
}

export const TractorForm = ({ controller }: TractorFormProps) => {
  const { form, onSubmit, isSubmitting, isEditing } = controller

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <FormSection title="Identificação">
        <FormGrid columns={2}>
          <RHFTextField
            methods={form}
            name="name"
            label="Nome"
            required
            placeholder="Ex: Trator John Deere 6110"
            wrapperClassName="sm:col-span-2"
          />
          <RHFTextField methods={form} name="brand" label="Marca" placeholder="John Deere" />
          <RHFTextField methods={form} name="model" label="Modelo" placeholder="6110J" />
          <RHFTextField methods={form} name="plate" label="Placa" placeholder="ABC-1234" />
        </FormGrid>
      </FormSection>

      <FormSection title="Valores e Depreciação">
        <FormGrid columns={3}>
          <RHFCurrencyField
            methods={form}
            name="default_hour_rate"
            label="Valor hora padrão"
            placeholder="R$ 0,00"
            hint="Esse valor é usado como sugestão ao criar um novo serviço (você ainda pode editar no serviço)."
          />
          <RHFCurrencyField
            methods={form}
            name="purchase_value"
            label="Valor de Compra"
            required
            placeholder="R$ 0,00"
          />
          <RHFCurrencyField methods={form} name="residual_value" label="Valor Residual" placeholder="R$ 0,00" />
          <RHFDecimalField
            methods={form}
            name="useful_life_hours"
            label="Vida Útil (h)"
            required
            placeholder="Ex: 5000"
            allowNegative={false}
          />
        </FormGrid>
        <p className="field-hint">
          O custo de depreciação por hora é calculado automaticamente: (Compra − Residual) ÷ Vida Útil
        </p>
      </FormSection>

      <FormSection title="Manutenção — troca de óleo (opcional)">
        <FormGrid columns={2}>
          <RHFDecimalField
            methods={form}
            name="oil_change_interval_hours"
            label="Intervalo (horas)"
            placeholder="Ex: 250"
            allowEmpty
            decimalScale={0}
            hint="Deixe vazio para não receber alertas no dashboard."
          />
          <RHFDecimalField
            methods={form}
            name="oil_change_last_done_hourmeter"
            label="Horímetro na última troca"
            placeholder="Leitura do painel"
            allowEmpty
            hint="Obrigatório para o alerta: intervalo + esta leitura + apontamentos com horímetro."
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Observações">
        <RHFTextareaField
          methods={form}
          name="notes"
          rows={3}
          placeholder="Informações adicionais sobre o trator..."
        />
      </FormSection>

      <div className="flex items-center gap-3">
        <AppButton type="submit" variant="primary" size="lg" loading={isSubmitting} loadingText="Salvando...">
          {isEditing ? 'Salvar alterações' : 'Cadastrar trator'}
        </AppButton>
        <Link
          to={ROUTES.TRACTORS}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancelar
        </Link>
      </div>
    </form>
  )
}
