import type zNotify from './z-notify.vue'

export type ComponentType =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'

export type NotifyShowPosition = '' | 'top' | 'center' | 'bottom'

export type zNotifyInstance = InstanceType<typeof zNotify>

/**
 * @description notify options配置项
 */
export interface NotifyOptions {
  /**
   * @description 消息内容
   */
  msg: string
  /**
   * @description 消息类型
   */
  type?: Omit<ComponentType, ''>
  /**
   * @description 通知的位置
   */
  position?: NotifyShowPosition
  /**
   * @description 背景颜色
   */
  bgColor?: string
  /**
   * @description 文字颜色
   */
  textColor?: string
  /**
   * @description 自动关闭时间
   */
  duration?: number
}
