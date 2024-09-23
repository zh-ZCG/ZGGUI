<!--
 * @Description: z-notify 消息通知组件
 * @Author: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import {
  ref,
  onMounted,
  getCurrentInstance,
  computed,
  onBeforeUnmount,
  watch,
  nextTick,
  CSSProperties,
} from 'vue'
import z from '@/ZGGUI/libs/z'
import zColor from '@/ZGGUI/libs/zColor'
import { propsHook, PropsTypeHook } from '@/ZGGUI/libs/zHooks'
/**
 * @description: z-notify 消息通知组件传参
 * @param: offsetTop 距离顶部的距离，防止使用了自定义顶部导航栏后，notify 被遮挡，单位为 px
 * @param: zIndex		ZIndex
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * @example:
 */

type ComponentType = 'primary' | 'success' | 'warning' | 'danger' | 'info'

type NotifyShowPosition = '' | 'top' | 'center' | 'bottom'

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

interface PropsType extends PropsTypeHook {
  offsetTop: number
  zIndex: number
}

interface EmitsType {}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  offsetTop: 0,
  zIndex: 1500,
})

const emits = defineEmits<EmitsType>()

// notify的默认配置项
const defaultOptions: NotifyOptions = {
  msg: '',
  type: 'primary',
  position: 'top',
  bgColor: '',
  textColor: '',
  duration: 3000,
}
// notify的配置项
const options = ref<NotifyOptions>({
  msg: '',
  type: 'primary',
  position: '',
  bgColor: '',
  textColor: '',
  duration: 3000,
})

// 显示notify
const isActive = ref(false)

// 弹出notify通知
const showNotify = (_options: NotifyOptions) => {
  Object.assign(options.value, defaultOptions, _options)
  isActive.value = true
  autoCloseNotify()
}

// 自动关闭弹框
let autoCloseTimer: ReturnType<typeof setTimeout> | null = null
const autoCloseNotify = () => {
  if (autoCloseTimer) clearTimeout(autoCloseTimer)
  autoCloseTimer = setTimeout(() => {
    isActive.value = false
  }, options.value.duration)
}

// notify对应的类
const notifyClass = computed<string>(() => {
  const cls: string[] = ['z-notify']

  // 设置弹出位置
  cls.push(
    z.isEmptyVariableInDefault(
      `z-notify-${options?.value.position}`,
      'z-notify-top'
    )
  )

  if (isActive.value)
    cls.push(`z-notify-active z-notify-${options?.value.position}-active`)

  return cls.join(' ')
})
// notify对应的样式
const notifyStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  // 设置类型和颜色
  if (options.value.type) {
    style.backgroundColor = zColor.getTypeColor(
      options.value.type as ComponentType
    )
    style.color = zColor.getTypeColor('cw')
  }

  if (options.value.bgColor) style.backgroundColor = options.value.bgColor

  style.color = options.value.textColor || zColor.getTypeColor('cw')

  // 如果当前是顶部弹出，则设置顶部距离
  if (options.value.position === 'top' && props.offsetTop) {
    style.top = z.addUnit(props.offsetTop)
  }

  if (props.zIndex) style.zIndex = props.zIndex

  return style
})

defineExpose({
  /**
   * @description: 显示通知
   */
  show: showNotify,
})
</script>

<template>
  <div :class="[notifyClass]" :style="notifyStyle">
    {{ options.msg }}
  </div>
</template>

<style lang="less" scoped>
.z-notify {
  position: fixed;
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.z-notify-active {
  opacity: 1;
}
.z-notify-top {
  left: 0;
  right: 0;
  top: 0;
  width: 100%;
  padding: 10rpx 0rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-100%);
}
.z-notify-top-active {
  transform: translateY(0);
}
.z-notify-center {
  left: 50%;
  top: 50%;
  padding: 15rpx;
  border-radius: 8rpx;
  transform-origin: center center;
  transform: translate(-50%, -50%) scale(0);
}
.z-notify-center-active {
  transform: translate(-50%, -50%) scale(1);
}
.z-notify-bottom {
  left: 50%;
  bottom: 13%;
  padding: 15rpx;
  border-radius: 8rpx;
  transform-origin: center center;
  transform: translate(-50%, -50%) scale(0);
}
.z-notify-bottom-active {
  transform: translate(-50%, -50%) scale(1);
}
</style>
