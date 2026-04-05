import { useId, type TextareaHTMLAttributes } from 'react'
import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form'
import { cn } from '@/shared/lib/cn'
import { FormFieldShell } from './form-field-shell'
import { getFieldError } from './form-utils'

export interface RHFTextareaFieldProps<T extends FieldValues> extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'name' | 'defaultValue' | 'form'
> {
  methods: UseFormReturn<T>
  name: FieldPath<T>
  label?: string
  required?: boolean
  hint?: string
  wrapperClassName?: string
}

export const RHFTextareaField = <T extends FieldValues>({
  methods,
  name,
  label,
  required,
  hint,
  wrapperClassName,
  className,
  id: idProp,
  ...textareaProps
}: RHFTextareaFieldProps<T>) => {
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
      <textarea
        id={inputId}
        className={cn('field resize-none', className)}
        {...textareaProps}
        {...methods.register(name)}
      />
    </FormFieldShell>
  )
}
