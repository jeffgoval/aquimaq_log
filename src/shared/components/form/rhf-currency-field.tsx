import { Controller, type FieldPath, type FieldValues, type UseFormReturn } from 'react-hook-form'
import { AppCurrencyInput } from '@/shared/components/app/app-numeric-input'
import { FormFieldShell } from './form-field-shell'
import { getFieldError } from './form-utils'

export interface RHFCurrencyFieldProps<T extends FieldValues> {
  methods: UseFormReturn<T>
  name: FieldPath<T>
  label: string
  required?: boolean
  hint?: string
  placeholder?: string
  wrapperClassName?: string
  inputClassName?: string
}

export const RHFCurrencyField = <T extends FieldValues>({
  methods,
  name,
  label,
  required,
  hint,
  placeholder = 'R$ 0,00',
  wrapperClassName,
  inputClassName,
}: RHFCurrencyFieldProps<T>) => {
  const { control, formState } = methods
  const error = getFieldError(formState.errors, name)

  return (
    <FormFieldShell
      label={label}
      required={required}
      error={error}
      hint={hint}
      className={wrapperClassName}
    >
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <AppCurrencyInput
            className={inputClassName}
            value={typeof value === 'number' ? value : (value ?? '')}
            onValueChange={(v) => onChange(v.floatValue ?? 0)}
            placeholder={placeholder}
          />
        )}
      />
    </FormFieldShell>
  )
}
