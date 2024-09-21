import { propsHook, PropsTypeHook } from '@/ZCGUI/libs/zHooks'
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

export const stepsContextKey: InjectionKey<StepsContext> = Symbol('stepsContextKey')

export const useOrderedChildren = <T extends { uid: number }>() => {
  const children: Record<number, T> = {}
  const orderedChildren = shallowRef<T[]>([])

  const addChild = (child: T) => {
    children[child.uid] = child
    orderedChildren.value.push(child)
  }
  const removeChild = (uid: number) => {
    delete children[uid]
    orderedChildren.value = orderedChildren.value.filter(child => child.uid !== uid)
  }

  return {
    children: orderedChildren,
    addChild,
    removeChild,
  }
}
