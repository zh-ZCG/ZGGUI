<!--
 * @Description: z-back-top 返回顶部组件
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
import z from '../../libs/z'
import zTransition from '../../components/z-transition/z-transition.vue'
import zIcon from '../../components/z-icon/z-icon.vue'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
/**
 * @description: z-back-top 返回顶部组件传参
 * @param	mode  	返回顶部的形状，circle-圆形，square-方形 （默认 'circle' ）
 * @param icon 		自定义图标
 * @param text 		提示文字
 * @param duration	返回顶部滚动时间 （默认 100）单位ms
 * @param scrollTop	滚动距离 （默认 0 ）
 * @param top  		距离顶部多少距离显示，单位px （默认 400 ）
 * @param bottom  	返回顶部按钮到底部的距离，单位px （默认 100 ）
 * @param right  		返回顶部按钮到右边的距离，单位px （默认 20 ）
 * @param zIndex 		层级   （默认 9 ）
 * @param	iconStyle 	图标的样式，对象形式   （默认 {color: '#909399',fontSize: '19px'}）
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  mode?: string
  icon?: string
  text?: string
  duration?: number
  scrollTop?: string | number
  top?: string | number
  bottom?: string | number
  right?: string | number
  zIndex?: string | number
  iconStyle?: Object
}

interface EmitsType {
  (e: 'click'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  mode: 'circle',
  icon: 'arrow-up1',
  text: '',
  duration: 100,
  scrollTop: 0,
  top: 400,
  bottom: 100,
  right: 20,
  zIndex: 9,
  iconStyle: () => ({
    color: '#909399',
    fontSize: '19px',
  }),
})

const emits = defineEmits<EmitsType>()

const backTopStyle = computed(() => {
  const style = {
    bottom: z.addUnit(props.bottom),
    right: z.addUnit(props.right),
    width: '40px',
    height: '40px',
    position: 'fixed',
    zIndex: 10,
  }
  return style
})

const show = computed(() => {
  return z.getPx(props.scrollTop) > z.getPx(props.top)
})

const contentStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}
  let radius = '0'
  // 是否圆形
  if (props.mode === 'circle') {
    radius = '100px'
  } else {
    radius = '4px'
  }

  style.borderTopLeftRadius = radius
  style.borderTopRightRadius = radius
  style.borderBottomLeftRadius = radius
  style.borderBottomRightRadius = radius
  return z.deepMerge(style, props.otherStyle ? props.otherStyle : {})
})

function backToTop() {
  uni.pageScrollTo({
    scrollTop: 0,
    duration: props.duration,
  })
  emits('click')
}
</script>

<template>
  <zTransition mode="fade" :otherStyle="backTopStyle" :show="show">
    <div
      class="z-back-top dfc aic jcc"
      :style="[contentStyle]"
      v-if="!$slots.default && !$slots.$default"
      @click="backToTop"
    >
      <zIcon :name="icon" :otherStyle="iconStyle"></zIcon>
      <text v-if="text" class="text">{{ text }}</text>
    </div>
    <slot v-else />
  </zTransition>
</template>

<style lang="less" scoped>
.z-back-top {
  flex: 1;
  height: 100%;
  background-color: #eeeeee;
  .text {
    font-style: 12px;
    transform: scale(0.8);
  }
}
</style>
