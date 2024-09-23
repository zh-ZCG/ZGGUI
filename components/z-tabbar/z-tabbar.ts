import type { InjectionKey } from 'vue'
import { PropsTypeHook } from '../../libs/zHooks'

interface PropsType extends PropsTypeHook {
  value?: string | number
  safeAreaInsetBottom?: boolean
  border?: boolean
  height?: string | number
  zIndex?: number
  bgColor?: string
  hasBulgeButton?: boolean
  switchAnimation?: boolean
  frosted?: boolean
  activeColor?: string
  inactiveColor?: string
  fixed?: boolean
  placeholder?: boolean
}

interface TabbarItemRect {
  width: number
  height: number
  left: number
  maxWidth?: number
}

export type TabbarItemContext = {
  uid: number
  name?: string | number
}

export type TabbarContext = PropsType & {
  items: TabbarItemContext[]
  activeUid: number
  addItem: (item: TabbarItemContext) => void
  removeItem: (uid: number) => void
  setActiveItem: (uid: number) => void
  setBulgeCircle: (rect: TabbarItemRect) => void
}

export const tabbarContextKey: InjectionKey<TabbarContext> =
  Symbol('tabbarContextKey')
