import type { InjectionKey } from 'vue'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'

type zRadioSizeType = 'small' | 'normal' | 'large'

interface RadioGroupProps extends PropsTypeHook {
  size?: zRadioSizeType
  disabled?: boolean
  labelDisabled?: boolean
  border?: boolean
  activeColor?: string
  modelValue?: string | number | boolean
  label?: string | number | boolean
}

export interface RadioGroupContext extends RadioGroupProps {
  changeEvent: (val: RadioGroupProps['modelValue']) => void
}

export const zRadioGroupKey: InjectionKey<RadioGroupContext> =
  Symbol('zRadioGroupKey')
