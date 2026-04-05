import { Controller, type FieldPath, type FieldValues, type UseFormReturn } from 'react-hook-form'
import type { NumericFormatProps } from 'react-number-format'
import { AppDecimalInput } from '@/shared/components/app/app-numeric-input'
import { FormFieldShell } from './form-field-shell'
import { getFieldError } from './form-utils'

export interface RHFDecimalFieldProps<T extends FieldValues> {
  methods: UseFormReturn<T>
  name: FieldPath<T>
  label: string
  required?: boolean
  hint?: string
  placeholder?: string
  wrapperClassName?: string
  inputClassName?: string
  allowNegative?: boolean
  decimalScale?: NumericFormatProps['decimalScale']
  /** Se true, campo vazio envia `null` em vez de 0 (campos opcionais). */
  allowEmpty?: boolean
}

export const RHFDecimalField = <T extends FieldValues>({
  methods,
  name,
  label,
  required,
  hint,
  placeholder,
  wrapperClassName,
  inputClassName,
  allowNegative = false,
  decimalScale,
  allowEmpty = false,
}: RHFDecimalFieldProps<T>) => {
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
          <AppDecimalInput
            className={inputClassName}
            value={
              allowEmpty && (value === null || value === undefined)
                ? ''
                : typeof value === 'number'
                  ? value
                  : (value ?? '')
            }
            onValueChange={(v) => {
              if (allowEmpty) {
                onChange(v.floatValue === undefined ? null : v.floatValue)
              } else {
                onChange(v.floatValue ?? 0)
              }
            }}
            placeholder={placeholder}
            allowNegative={allowNegative}
            decimalScale={decimalScale}
          />
        )}
      />
    </FormFieldShell>
  )
}
