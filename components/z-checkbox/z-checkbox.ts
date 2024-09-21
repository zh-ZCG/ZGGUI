import type { InjectionKey } from 'vue'
import { propsHook, PropsTypeHook } from '@/ZCGUI/libs/zHooks'

type zCheckBoxSizeType = 'small' | 'normal' | 'large' | ''

type zCheckBoxShapes = 'square' | 'circle'

interface CheckboxGroupProps extends PropsTypeHook {
  size?: zCheckBoxSizeType
  checkedShape?: zCheckBoxShapes
  disabled?: boolean
  labelDisabled?: boolean
  border?: boolean
  activeColor?: string
  modelValue: zCheckboxGroupValueType
  min?: number
  max?: number
  wrap?: boolean
  validateEvent?: boolean
}

export type zCheckboxValueType = string | number | boolean
export type zCheckboxGroupValueType = Exclude<zCheckboxValueType, boolean>[]

export interface CheckboxGroupContext extends CheckboxGroupProps {
  changeEvent: (val: zCheckboxGroupValueType[number]) => void
}

export const zCheckboxGroupKey: InjectionKey<CheckboxGroupContext> =
  Symbol('zCheckboxGroupKey')
