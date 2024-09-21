<!--
 * @Description: z-switch-tab 选项卡组件
 * @Author: ZCGUI & ui.zcgui.cn & zcgamazing@163.com
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
import z from '@/ZCGUI/libs/z'
import { propsHook, PropsTypeHook } from '@/ZCGUI/libs/zHooks'
import zColor from '@/ZCGUI/libs/zColor'
/**
 * @description: z-switch-tab 选项卡组件传参
 * @param: modelValue 当前激活的标签索引
 * @param: tabs		标签列表
 * @param: disabled	是否禁用
 * @param: inactiveBgColor  未选中时标签的背景颜色
 * @param: activeBgColor  选中时标签的背景颜色
 * @param: inactiveTextColor  未选中时标签的字体颜色
 * @param: activeTextColor  选中时标签的字体颜色
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZCGUI & ui.zcgui.cn & zcgamazing@163.com
 * @example:
 */

type tabClass = (index: number) => string
type tabStyle = (index: number) => CSSProperties

interface PropsType extends PropsTypeHook {
  modelValue?: number
  tabs?: string[]
  disabled?: boolean
  inactiveBgColor?: string
  activeBgColor?: string
  inactiveTextColor?: string
  activeTextColor?: string
}

interface EmitsType {
  (e: 'update:modelValue', value: number): void
  (e: 'change', value: number): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  modelValue: 0,
  tabs: () => [],
})

const emits = defineEmits<EmitsType>()

// 点击切换标签
const tabClickEvent = (index: number) => {
  if (props.disabled) return
  emits('update:modelValue', index)
  nextTick(() => {
    emits('change', index)
  })
}

// 切换选项卡的类
const switchTabClass = computed(() => {
  const cls: string[] = ['z-switch-tab']

  return cls.join(' ')
})
// 切换选项卡的样式
const switchTabStyle = computed(() => {
  const style: CSSProperties = {}

  style.backgroundColor = zColor.getTypeColor(
    props.activeBgColor || zColor.getTypeColor('cw')
  )

  return style
})

// 标签的类
const tabClass = computed<tabClass>(() => {
  return (index: number) => {
    const cls: string[] = ['tab', index === props.modelValue ? 'active' : '']

    return cls.join(' ')
  }
})
// 标签的样式
const tabStyle = computed<tabStyle>(() => {
  return (index: number) => {
    const style: CSSProperties = {}

    if (index === props.modelValue) {
      style.backgroundColor = zColor.getTypeColor(
        props.activeBgColor || zColor.getTypeColor('cw')
      )

      style.color = zColor.getTypeColor(
        props.activeTextColor || zColor.getTypeColor('primary')
      )
    } else {
      style.backgroundColor = zColor.getTypeColor(
        props.inactiveBgColor || zColor.getTypeColor('primary')
      )

      style.color = zColor.getTypeColor(
        props.inactiveTextColor || zColor.getTypeColor('cb')
      )
      if (index === props.modelValue - 1) {
        style.borderBottomRightRadius = '30rpx'
      }
      if (index === props.modelValue + 1) {
        style.borderBottomLeftRadius = '30rpx'
      }
    }

    return style
  }
})
</script>

<template>
  <div :class="[switchTabClass]" :style="switchTabStyle">
    <!-- 标签栏 -->
    <div class="tabs">
      <div
        v-for="(tabItem, tabIndex) in tabs"
        :key="tabIndex"
        :class="[tabClass(tabIndex)]"
        :style="tabStyle(tabIndex)"
        @tap.stop="tabClickEvent(tabIndex)"
      >
        <div class="tab-item bg"></div>
        <div class="tab-item text">{{ tabItem }}</div>
      </div>
    </div>
    <!-- 内容区域 -->
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-switch-tab {
  position: relative;
  width: 100%;
  border-radius: 15rpx;
  .tabs {
    position: relative;
    width: 100%;
    display: flex;
    .tab {
      position: relative;
      flex: 1;
      height: 70rpx;
      .tab-item {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: inherit;
        border-radius: inherit;
        transition-property: height, border-top-left-radius, border-top-right-radius,
          border-bottom-left-radius, border-bottom-right-radius, background-color,
          color;
        transition-duration: 0.15s;
        transition-timing-function: linear;
      }
      .bg {
        transform-origin: center bottom;
        background-color: inherit;
      }
      .text {
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      }

      &:nth-of-type(1) {
        border-top-left-radius: 15rpx;
      }
      &:nth-last-of-type(1) {
        border-top-right-radius: 15rpx;
      }
    }
    .active {
      .tab-item {
        border-top-left-radius: 15rpx;
        border-top-right-radius: 15rpx;
        height: 90rpx;
      }
    }
  }
}
</style>
