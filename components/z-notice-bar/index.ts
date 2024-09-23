import { propsHook, PropsTypeHook } from '@/ZGGUI/libs/zHooks'
import { InjectionKey } from 'vue'
type noticeBarScrollDirection = 'horizontal' | 'vertical'

interface PropsType extends PropsTypeHook {
  show?: boolean
  data?: Array<string>
  bgColor?: string
  textColor?: string
  fontSize?: string | number
  leftIcon?: string
  leftIconColor?: string
  leftIconSize?: string | number
  rightIcon?: string
  rightIconColor?: string
  rightIconSize?: string | number
  pause?: boolean
  autoPlay?: boolean
  direction?: noticeBarScrollDirection
  loop?: boolean
  speed?: number
  autoHide?: boolean
}

export type NoticeBarContext = PropsType & {
  play: boolean
  click: (index: number) => void
}

export const noticeBarKey: InjectionKey<NoticeBarContext> = Symbol('noticeBar')
