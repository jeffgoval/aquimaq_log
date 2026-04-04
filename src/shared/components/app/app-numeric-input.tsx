import { forwardRef } from 'react'
import { PatternFormat, NumericFormat, type PatternFormatProps, type NumericFormatProps } from 'react-number-format'
import { cn } from '@/shared/lib/cn'

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
