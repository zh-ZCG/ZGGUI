<!--
 * @Description: z-gap 间隔组件
 * @Author: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
// #ifdef MP-WEIXIN
<script lang="ts">
export default {
  options: {
    // 在微信小程序中将组件节点渲染为虚拟节点，更加接近Vue组件的表现(不会出现shadow节点下再去创建元素)
    virtualHost: true,
  },
}
</script>
// #endif
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
import z from '../../libs/z'
import zColor from '../../libs/zColor'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
/**
 * @description: z-gap 间隔传参
 * @param: bgColor 背景颜色 （默认 'transparent' ）
 * @param: height		 分割高度, （默认 20px ）
 * @param: marginTop	与上一个组件的距离，（ 默认 0px ）
 * @param: marginBottom  与下一个组件的距离，（默认 0px ）
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
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
    backgroundColor: zColor.getTypeColor(props.bgColor),
    height: z.addUnit(props.height),
    width: '100%',
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
