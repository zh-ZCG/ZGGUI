import { Arrayable } from '@/ZCGUI/libs/zType'

import { InjectionKey, shallowRef } from 'vue'

import { propsHook, PropsTypeHook } from '@/ZCGUI/libs/zHooks'

interface PropsType extends PropsTypeHook {
  modelValue?: CollapseModelValue
  accordion?: boolean
  showArrow?: boolean
  arrowColor?: string
}

export type CollapseModelValue = Arrayable<number>

export type CollapseItemContext = {
  uid: number
}

export type CollapseContext = Pick<PropsType, 'showArrow' | 'arrowColor'> & {
  items: CollapseItemContext[]
  addItem: (item: CollapseItemContext) => void
  removeItem: (uid: number) => void
  activeUid: number[]
  handleItemClick: (uid: number) => void
}

export const collapseContextKey: InjectionKey<CollapseContext> =
  Symbol('collapseContextKey')

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
