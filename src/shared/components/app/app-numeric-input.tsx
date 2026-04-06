import { forwardRef } from 'react'
import { PatternFormat, NumericFormat, type PatternFormatProps, type NumericFormatProps } from 'react-number-format'
import { cn } from '@/shared/lib/cn'

/** Props de telefone/documento sem `format`/`mask` fixos (definidos no componente). */
type BrPatternFieldProps = Omit<PatternFormatProps, 'format' | 'mask'>

export const AppCurrencyInput = forwardRef<HTMLInputElement, NumericFormatProps>((props, ref) => {
  return (
    <NumericFormat
      {...props}
      getInputRef={ref}
      className={cn('field', props.className)}
      prefix="R$ "
      decimalSeparator=","
      thousandSeparator="."
      decimalScale={2}
      fixedDecimalScale
      allowNegative={false}
    />
  )
})
AppCurrencyInput.displayName = 'AppCurrencyInput'

export const AppDecimalInput = forwardRef<HTMLInputElement, NumericFormatProps>((props, ref) => {
  return (
    <NumericFormat
      {...props}
      getInputRef={ref}
      className={cn('field', props.className)}
      decimalSeparator=","
      thousandSeparator="."
      allowNegative={false}
    />
  )
})
AppDecimalInput.displayName = 'AppDecimalInput'

export const AppPatternInput = forwardRef<HTMLInputElement, PatternFormatProps>((props, ref) => {
  return (
    <PatternFormat
      {...props}
      getInputRef={ref}
      className={cn('field', props.className)}
    />
  )
})
AppPatternInput.displayName = 'AppPatternInput'

/** Telefone BR: (DD) 9999-9999 ou (DD) 99999-9999 conforme quantidade de dígitos. */
export const AppPhoneInput = forwardRef<HTMLInputElement, BrPatternFieldProps>((props, ref) => {
  const { className, value, ...rest } = props
  const digits = String(value ?? '').replace(/\D/g, '')
  const format = digits.length < 11 ? '(##) ####-####' : '(##) #####-####'
  return (
    <PatternFormat
      {...rest}
      key={format}
      getInputRef={ref}
      value={value}
      format={format}
      mask="_"
      className={cn('field', className)}
      placeholder={props.placeholder ?? '(00) 00000-0000'}
    />
  )
})
AppPhoneInput.displayName = 'AppPhoneInput'

/** CPF (até 11 dígitos) ou CNPJ (14 dígitos), máscara alterna ao ultrapassar 11 dígitos. */
export const AppCpfCnpjInput = forwardRef<HTMLInputElement, BrPatternFieldProps>((props, ref) => {
  const { className, value, ...rest } = props
  const digits = String(value ?? '').replace(/\D/g, '')
  const format = digits.length > 11 ? '##.###.###/####-##' : '###.###.###-##'
  return (
    <PatternFormat
      {...rest}
      key={format}
      getInputRef={ref}
      value={value}
      format={format}
      mask="_"
      className={cn('field', className)}
      placeholder={props.placeholder ?? '000.000.000-00'}
    />
  )
})
AppCpfCnpjInput.displayName = 'AppCpfCnpjInput'

/** Número de registro da CNH (11 dígitos), formato alinhado ao padrão visual de CPF. */
export const AppCnhInput = forwardRef<HTMLInputElement, BrPatternFieldProps>((props, ref) => {
  const { className, ...rest } = props
  return (
    <PatternFormat
      {...rest}
      getInputRef={ref}
      format="###.###.###-##"
      mask="_"
      className={cn('field', className)}
      placeholder={props.placeholder ?? '000.000.000-00'}
    />
  )
})
AppCnhInput.displayName = 'AppCnhInput'
