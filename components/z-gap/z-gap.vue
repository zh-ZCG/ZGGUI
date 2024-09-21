<!--
 * @Description: z-gap 间隔组件
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
/**
 * @description: z-gap 间隔传参
 * @param: bgColor 背景颜色 （默认 'transparent' ）
 * @param: height		 分割高度, （默认 20px ）
 * @param: marginTop	与上一个组件的距离，（ 默认 0px ）
 * @param: marginBottom  与下一个组件的距离，（默认 0px ）
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZCGUI & ui.zcgui.cn & zcgamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  bgColor: string
  height: string | number
  marginTop: string | number
  marginBottom: string | number
}

interface EmitsType {}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  bgColor: 'transparent',
  height: 20,
  marginTop: 0,
  marginBottom: 0,
})

const emits = defineEmits<EmitsType>()

const zGapStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {
    backgroundColor: props.bgColor,
    height: z.addUnit(props.height),
    marginTop: z.addUnit(props.marginTop),
    marginBottom: z.addUnit(props.marginBottom),
  }
  return z.deepMerge(style, props.otherStyle)
})
</script>

<template>
  <div class="z-gap" :style="zGapStyle"></div>
</template>

<style lang="less" scoped></style>
