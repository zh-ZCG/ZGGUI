import type { InjectionKey } from 'vue'
import { propsHook, PropsTypeHook } from '@/ZGGUI/libs/zHooks'

export interface zTabsItemRect {
  width: number
  height: number
  left: number
}

type TabsSwitchBeforeFunc = (index: number) => Promise<boolean> | boolean

interface zTabsProps extends PropsTypeHook {
  color?: string
  activeColor?: string
  fontSize?: string
  activeFontSize?: string
  modelValue?: string | number
  height?: string
  barWidth?: string
  bgColor?: string
  barColor?: string
  bottomShadow?: boolean
  scroll?: boolean
  bar?: boolean
  activeBold?: boolean
  offsetTop?: number
  beforeSwitch?: TabsSwitchBeforeFunc
}

export type zTabsItemContext = {
  uid: number
  elementRect: zTabsItemRect
  name?: string | number
}

export type TabsContext = zTabsProps & {
  items: zTabsItemContext[]
  activeUid: number
  showBar: boolean
  addItem: (item: zTabsItemContext) => void
  removeItem: (uid: number) => void
  setActiveItem: (uid: number) => void
}

export const ztabsContextKey: InjectionKey<TabsContext> =
  Symbol('ztabsContextKey')
