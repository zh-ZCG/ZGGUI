<!--
 * @Description: z-overlay 遮罩层
 * @Author: ZCGUI & ui.zcgui.cn & zcgamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import { ref, getCurrentInstance, watch, computed } from 'vue'
import type { Ref, PropType } from 'vue'
import zTransition from '@/ZCGUI/components/z-transition/z-transition.vue'
import z from '@/ZCGUI/libs/z'

/**
 * @description: z-overlay 遮罩层
 * @param: show 是否展示遮罩层
 * @param: opacity  遮罩层不透明度 默认0.5，例如：rgba（0，0，0，0.5）
 * @param: duration 动画时长,默认300ms
 * @param: zIndex 层级高度，默认500
 * @param: otherStyle 其他样式
 *
 * @event: click 点击遮罩层
 * @tutorial: ZCGUI & ui.zcgui.cn & zcgamazing@163.com
 * @example:
 */
interface PropsType {
  show?: boolean
  opacity?: number | string
  duration?: number | string
  zIndex?: number | string
  otherStyle?: object
}

interface EmitsType {
  (e: 'click'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  show: false,
  opacity: 0.5,
  duration: 300,
  zIndex: 500,
})

const emits = defineEmits<EmitsType>()

/**触发点击 */
function clickOverlay() {
  emits('click')
}

const overlayStyle = computed(() => {
  let style = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: props.zIndex,
    'background-color': `rgba(0, 0, 0, ${props.opacity})`,
  }
  return z.deepMerge(style, props.otherStyle ? props.otherStyle : {})
})
</script>

<template>
  <div ref="z-overlay" id="z-overlay">
    <zTransition
      :show="props.show"
      :duration="Number(props.duration)"
      :otherStyle="overlayStyle"
      @click="clickOverlay"
    >
      <slot></slot>
    </zTransition>
  </div>
</template>

<style lang="less" scoped></style>
