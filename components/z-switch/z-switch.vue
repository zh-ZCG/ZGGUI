<!--
 * @Description: z-switch 开关组件
 * @Author: ZGGUI & ui.zggui.cn & zggamazing@163.com
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
import zIcon from '@/ZGGUI/components/z-icon/z-icon.vue'
import zColor from '@/ZGGUI/libs/zColor'
import zLoadingIcon from '@/ZGGUI/components/z-loading-icon/z-loading-icon.vue'
import { propsHook, PropsTypeHook } from '@/ZGGUI/libs/zHooks'
import { useFormItem } from '@/ZGGUI/components/z-form/types'
import zType from '@/ZGGUI/libs/zType'
/**
 * @description: z-switch 开关组件传参
 * @param: modelValue 状态绑定的值
 * @param: shape		 按钮形状
 * @param: size	按钮尺寸
 * @param: width  按钮的宽度
 * @param: disabled  是否禁用
 * @param: loading  是否显示加载动画
 * @param: inactiveColor  未选中时的颜色
 * @param: activeColor  选中时的颜色
 * @param: inactiveText  未选中时显示的文本
 * @param: activeText   选中时显示的文本
 * @param: inactiveTextColor  未选中时显示的文本颜色
 * @param: activeTextColor   选中时显示的文本颜色
 * @param: inactiveIcon  未选中时显示的图标
 * @param: activeIcon   选中时显示的图标
 * @param: inactiveValue  未选中时的值
 * @param: activeValue   选中时的值
 * @param: validateEvent  值发生修改时是否触发表单验证
 * @param: beforeChange   状态改变前的钩子， 返回 false 或者返回 Promise 且被 reject 则停止切换
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zggui.cn & zggamazing@163.com
 * @example:
 */

type switchShapes = 'square' | 'round'
type switchSize = 'small' | 'normal' | 'large'

interface PropsType extends PropsTypeHook {
  modelValue?: string | number | boolean
  shape?: switchShapes
  size?: switchSize
  width?: string | number
  disabled?: boolean
  loading?: boolean
  inactiveColor?: string
  activeColor?: string
  inactiveText?: string
  activeText?: string
  inactiveTextColor?: string
  activeTextColor?: string
  inactiveIcon?: string
  activeIcon?: string
  inactiveValue?: string | number | boolean
  activeValue?: string | number | boolean
  validateEvent?: boolean
  beforeChange?: () => Promise<boolean> | boolean
}

interface EmitsType {
  (e: 'update:modelValue', value: string | number | boolean): void
  (e: 'change', value: string | number | boolean): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  modelValue: false,
  shape: 'round',
  size: 'normal',
  inactiveValue: false,
  activeValue: true,
  validateEvent: true,
})

const emits = defineEmits<EmitsType>()

const { formItem } = useFormItem()

// 判断是否为选中状态
const selected = computed<boolean>(() => props.modelValue === props.activeValue)

// 处理切换事件
const handleSwitch = () => {
  const value =
    props.modelValue === props.activeValue
      ? props.inactiveValue
      : props.activeValue

  emits('update:modelValue', value)
  nextTick(() => emits('change', value))
}

// switch按钮的点击切换事件
const switchClickEvent = () => {
  if (props.disabled || props.loading) return

  const { beforeChange } = props
  if (!beforeChange) {
    handleSwitch()
    return
  }

  const shouldChange = beforeChange()

  const isPromiseOrBool = [
    zType.isPromise(shouldChange),
    zType.isBoolean(shouldChange),
  ].includes(true)
  if (!isPromiseOrBool) {
    throw new Error('zswitch beforeChange 返回值必须是 Promise 或者 boolean')
  }

  if (zType.isPromise(shouldChange)) {
    shouldChange
      .then((res) => {
        if (res) handleSwitch()
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        z.error(`zswitch 错误: ${err}`)
      })
  } else if (shouldChange) {
    handleSwitch()
  }
}

watch(
  () => props.modelValue,
  () => {
    if (props.validateEvent) {
      formItem?.validate?.('change').catch((err) => {
        z.error(JSON.stringify(err))
      })
    }
  }
)

// switch所属类
const switchClass = computed<string>(() => {
  const cls: string[] = ['z-switch']

  // switch的形状
  if (props.shape) cls.push(`${props.shape}`)

  // switch的尺寸
  if (props.size) cls.push(`${props.size}`)

  // 禁止状态
  if (props.disabled) cls.push('disabled')

  // 设置switch按钮的激活与未激活状态的颜色
  if (selected.value) {
    if (props.activeColor) cls.push(props.activeColor)
  } else {
    if (props.inactiveColor) cls.push(props.inactiveColor)
  }
  return cls.join(' ')
})

const switchStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  // 设置switch按钮的宽度
  if (props.width) style.width = z.addUnit(props.width)

  // 设置switch按钮的激活与未激活状态的颜色
  if (selected.value) {
    if (props.activeColor) {
      style.backgroundColor =
        props.activeColor || zColor.getTypeColor('primary')
    }
    if (props.activeTextColor) {
      style.color = props.activeTextColor
    }
  } else {
    if (props.inactiveColor) {
      style.backgroundColor = props.inactiveColor || 'rgba(0,0,0,0.3)'
    }
    if (props.inactiveTextColor) {
      style.color = props.inactiveTextColor
    }
  }

  if (!zType.isEmpty(props.otherStyle)) Object.assign(style, props.otherStyle)

  if (
    props.activeText ||
    props.activeIcon ||
    props.inactiveText ||
    props.inactiveIcon
  ) {
    style.minWidth = 'auto'
  }

  return style
})
</script>

<template>
  <div :class="switchClass" :style="switchStyle" @tap.stop="switchClickEvent">
    <!-- switch小圆圈 -->
    <div class="dot df jcc aic pa" :class="selected ? 'checked' : ''">
      <zLoadingIcon :show="loading" :mode="'flower'"></zLoadingIcon>
    </div>
    <div v-if="selected" class="active-content dfr aic">
      <!-- 激活时的文本 -->
      <div v-if="props.activeText && !props.activeIcon" class="text">
        {{ props.activeText }}
      </div>
      <!-- 激活时的图标 -->
      <div v-if="props.activeIcon" class="icon">
        <zIcon :name="props.activeIcon"></zIcon>
      </div>
    </div>
    <div v-else class="inactive-content dfr aic">
      <!-- 未激活时的文本 -->
      <div
        v-if="props.inactiveText && !props.inactiveIcon"
        class="active-content-text"
      >
        {{ props.inactiveText }}
      </div>
      <!-- 激活时的图标 -->
      <div v-if="props.inactiveIcon" class="icon">
        <zIcon :name="props.inactiveIcon"></zIcon>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-switch {
  position: relative;
  transition: all 0.3s ease;
  color: #fff;
  display: inline-flex;
}
.square {
  border-radius: 6rpx;
  .dot {
    border-radius: 6rpx;
  }
}
.round {
  border-radius: 1000rpx;
  .dot {
    border-radius: 50%;
  }
}
.small {
  width: 70rpx;
  height: 40rpx;
  font-size: 24rpx;
  padding: 4rpx;
  .dot {
    top: 50%;
    background-color: #fff;
    transform: translate(0, -50%);
    transition: all 0.3s ease-in-out;
    left: 4rpx;
    width: calc(40rpx * 0.8);
    height: calc(40rpx * 0.8);
  }
  .checked {
    left: calc(100% - 4rpx);
    transform: translate(-100%, -50%);
  }
  .active-content {
    padding-right: calc(40rpx * 0.9 + 4rpx);
    padding-left: 4rpx;
    //transform: scale(0) translateX(100%);
    animation-name: switch-content-animation-active;
    .text {
      height: 100%;
      display: flex;
      align-items: center;
      width: max-content;
      //opacity: 0;
      animation-duration: 0.3s;
      animation-timing-function: ease;
      animation-fill-mode: forwards;
    }
    .icon {
      transform-origin: center;
      transform: scale(1.1);
    }
  }
  .inactive-content {
    padding-left: calc(40rpx * 0.9 + 4rpx);
    padding-right: 4rpx;
    //transform: scale(0) translateX(-100%);
    animation-name: switch-content-animation-inactive;
    .text {
      height: 100%;
      display: flex;
      align-items: center;
      //opacity: 0;
      animation-duration: 0.3s;
      animation-timing-function: ease;
      animation-fill-mode: forwards;
    }
    .icon {
      transform-origin: center;
      transform: scale(1.1);
    }
  }
}
.normal {
  height: 50rpx;
  font-size: 28rpx;
  padding: 6rpx;
  .dot {
    top: 50%;
    background-color: #fff;
    transform: translate(0, -50%);
    transition: all 0.3s ease-in-out;
    left: 6rpx;
    width: calc(50rpx * 0.8);
    height: calc(50rpx * 0.8);
  }
  .checked {
    left: calc(100% - 6rpx);
    transform: translate(-100%, -50%);
  }
  .active-content {
    padding-right: calc(50rpx * 0.9 + 6rpx);
    padding-left: 6rpx;
    //transform: scale(0) translateX(100%);
    animation-name: switch-content-animation-active;
    .text {
      height: 100%;
      display: flex;
      align-items: center;
      //opacity: 0;
      animation-duration: 0.3s;
      animation-timing-function: ease;
      animation-fill-mode: forwards;
    }
    .icon {
      transform-origin: center;
      transform: scale(1.1);
    }
  }
  .inactive-content {
    padding-left: calc(50rpx * 0.9 + 6rpx);
    padding-right: 6rpx;
    //transform: scale(0) translateX(-100%);
    animation-name: switch-content-animation-inactive;
    .text {
      height: 100%;
      display: flex;
      align-items: center;
      //opacity: 0;
      animation-duration: 0.3s;
      animation-timing-function: ease;
      animation-fill-mode: forwards;
    }
    .icon {
      transform-origin: center;
      transform: scale(1.1);
    }
  }
}
.large {
  width: 120rpx;
  height: 60rpx;
  font-size: 36rpx;
  padding: 8rpx;
  .dot {
    top: 50%;
    background-color: #fff;
    transform: translate(0, -50%);
    transition: all 0.3s ease-in-out;
    left: 8rpx;
    width: calc(60rpx * 0.8);
    height: calc(60rpx * 0.8);
  }
  .checked {
    left: calc(100% - 8rpx);
    transform: translate(-100%, -50%);
  }
  .active-content {
    padding-right: calc(60rpx * 0.9 + 8rpx);
    padding-left: 8rpx;
    //transform: scale(0) translateX(100%);
    animation-name: switch-content-animation-active;
    .text {
      height: 100%;
      display: flex;
      align-items: center;
      //opacity: 0;
      animation-duration: 0.3s;
      animation-timing-function: ease;
      animation-fill-mode: forwards;
    }
    .icon {
      transform-origin: center;
      transform: scale(1.1);
    }
  }
  .inactive-content {
    padding-left: calc(60rpx * 0.9 + 8rpx);
    padding-right: 8rpx;
    //transform: scale(0) translateX(-100%);
    animation-name: switch-content-animation-inactive;
    .text {
      height: 100%;
      display: flex;
      align-items: center;
      //opacity: 0;
      animation-duration: 0.3s;
      animation-timing-function: ease;
      animation-fill-mode: forwards;
    }
    .icon {
      transform-origin: center;
      transform: scale(1.1);
    }
  }
}
.disabled {
  //opacity: 0.6;
  background-color: #e6e6e6;
}

.icon {
  transform-origin: center;
  transform: scale(1.1);
}

@keyframes switch-content-animation-active {
  from {
    //opacity: 0;
    //transform: scale(0) translateX(100%);
  }
  to {
    opacity: 1;
    transform: scale(1) translateX(0%);
  }
}
@keyframes switch-content-animation-inactive {
  from {
    //opacity: 0;
    //transform: scale(0) translateX(-100%);
  }
  to {
    opacity: 1;
    transform: scale(1) translateX(0%);
  }
}
</style>
