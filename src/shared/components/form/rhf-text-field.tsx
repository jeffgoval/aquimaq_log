import { useId, type InputHTMLAttributes } from 'react'
import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form'
import { cn } from '@/shared/lib/cn'
import { FormFieldShell } from './form-field-shell'
import { getFieldError } from './form-utils'

export interface RHFTextFieldProps<T extends FieldValues> extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'name' | 'defaultValue' | 'form'
> {
  methods: UseFormReturn<T>
  name: FieldPath<T>
  label: string
  required?: boolean
  hint?: string
  /** Classes no wrapper externo (ex.: `sm:col-span-2`) */
  wrapperClassName?: string
}

export const RHFTextField = <T extends FieldValues>({
  methods,
  name,
  label,
  required,
  hint,
  wrapperClassName,
  className,
  id: idProp,
  ...inputProps
}: RHFTextFieldProps<T>) => {
  const uid = useId()
  const inputId = idProp ?? uid
  const error = getFieldError(methods.formState.errors, name)

  return (
    <FormFieldShell
      label={label}
      required={required}
      error={error}
      hint={hint}
      className={wrapperClassName}
      htmlFor={inputId}
    >
      <input
        id={inputId}
        className={cn('field', className)}
        {...inputProps}
        {...methods.register(name)}
      />
    </FormFieldShell>
  )
}
