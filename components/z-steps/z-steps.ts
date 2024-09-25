import { propsHook, PropsTypeHook } from '../../libs/zHooks'
import { InjectionKey, shallowRef } from 'vue'

export type stepModes = 'dot' | 'number' | 'dotIcon' | 'icon'

export type StepContext = {
  uid: number
}

interface StepsProps extends PropsTypeHook {
  color?: string
  activeColor?: string
  disabled?: boolean
  modelValue?: number
  mode?: stepModes
}

export type StepsContext = StepsProps & {
  items: StepContext[]
  activeUidList: number[]
  addItem: (item: StepContext) => void
  removeItem: (uid: number) => void
  setActiveItem: (uid: number) => void
}

export const stepsContextKey: InjectionKey<StepsContext> =
  Symbol('stepsContextKey')
