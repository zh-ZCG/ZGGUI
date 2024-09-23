<!--
 * @Description:  col布局组件
 * @Author: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * @Date: 2024-03-22 15:58:51
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import { ref, getCurrentInstance, watch, computed, onMounted } from 'vue'
import type { Ref, PropType } from 'vue'
import z from '../../libs/z'

interface PropsType {
  span: number
  offset: number
  justify: string
  align: string
  textAlign: string
  otherStyle: object
}

interface EmitsType {}

const props = withDefaults(defineProps<PropsType>(), {
  offset: 0,
  justify: 'center',
  align: 'center',
  textAlign: 'center',
})

const emits = defineEmits<EmitsType>()

/**
 * 父组件宽度
 */
const zParentsWidth = ref(0)

onMounted(async () => {
  let instance = getCurrentInstance() as any
  if (instance && instance.ctx && instance.ctx.$parent) {
    // 调用 getParentWidth 方法，并等待 Promise 完成
    zParentsWidth.value = await instance.ctx.$parent.getParentsWidth()
  }
})

const juststyle = computed(() => {
  switch (props.justify) {
    case 'start' || 'flex-start' || 'left':
      return 'flex-start'
    case 'end' || 'flex-end' || 'right':
      return 'flex-end'
    case 'center':
      return 'center'
    case 'between':
      return 'space-between'
    case 'around':
      return 'space-around'
    case 'evenly':
      return 'space-evenly'
    default:
      return 'center'
  }
})

const alistyle = computed(() => {
  switch (props.align) {
    case 'start' || 'flex-start' || 'top':
      return 'flex-start'
    case 'end' || 'flex-end' || 'bottom':
      return 'flex-end'
    case 'center':
      return 'center'
    default:
      return 'center'
  }
})

const colStyle = computed(() => {
  let style = {
    display: 'flex',
    justifyContent: juststyle.value,
    alignItems: alistyle.value,
    paddingLeft: '0px',
    textAlign: props.textAlign,
  } as any
  style.paddingLeft =
    '-' + Number(getCurrentInstance()?.parent?.props.gutter) / 2 + 'px'
  style.paddingRight =
    '-' + Number(getCurrentInstance()?.parent?.props.gutter) / 2 + 'px'
  style.width =
    Math.floor((zParentsWidth.value / 12) * Number(props.span)) + 'px'
  style.marginLeft =
    Math.floor((zParentsWidth.value / 12) * Number(props.offset)) + 'px'
  return z.deepMerge(style, props.otherStyle)
})
</script>

<template>
  <div :style="[colStyle]" id="z-col" ref="z-col">
    <slot></slot>
  </div>
</template>

<style lang="less" scoped></style>
