import type { InjectionKey } from 'vue'
import { shallowRef } from 'vue'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'

export interface SubsectionItemRect {
  left: number
  width: number
}

export type subsectionMode = 'default' | 'button'

interface SubsectionProps extends PropsTypeHook {
  color?: string
  activeColor?: string
  disabled?: boolean
  modelValue?: number
  mode?: subsectionMode
  size?: string
  radius?: string
}

interface SubsectionItemProps extends PropsTypeHook {
  color?: string
  activeColor?: string
  disabled?: boolean
  title?: string
}

export type SubsectionSliderRect = SubsectionItemRect

export type SubsectionItemContext = SubsectionItemProps & {
  uid: number
  element: SubsectionItemRect
}

export type SubsectionContext = SubsectionProps & {
  items: SubsectionItemContext[]
  activeUid: number
  addItem: (item: SubsectionItemContext) => void
  removeItem: (uid: number) => void
  setActiveItem: (uid: number) => void
}

export const subsectionContextKey: InjectionKey<SubsectionContext> = Symbol(
  'subsectionContextKey'
)

export const useOrderedChildren = <T extends { uid: number }>() => {
  const children: Record<number, T> = {}
  const orderedChildren = shallowRef<T[]>([])

  const addChild = (child: T) => {
    children[child.uid] = child
    orderedChildren.value.push(child)
  }
  const removeChild = (uid: number) => {
    delete children[uid]
    orderedChildren.value = orderedChildren.value.filter(
      (child) => child.uid !== uid
    )
  }

  return {
    children: orderedChildren,
    addChild,
    removeChild,
  }
}
