import { Arrayable } from '../../libs/zType'

import { InjectionKey, shallowRef } from 'vue'

import { propsHook, PropsTypeHook } from '../../libs/zHooks'

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
