<!--
 * @Description: z-divider 分割线组件
 * @Author: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
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
import zLine from '../../components/z-line/z-line.vue'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
/**
 * @description: z-gap 间隔传参
 * @param:borderStyle		设置线条样式 与css border-style属性一致 可填solid（默认实线），dashed（虚线），dotted（圆点）等
 * @param:hairline		是否细线 （默认  true ）
 * @param:dot				是否以点替代文字，优先于text字段起作用 （默认 false ）
 * @param:textPosition	内容文本的位置，left-左边，center-中间，right-右边 （默认 'center' ）
 * @param:text			文本内容
 * @param:textSize		文本大小 （默认 14）
 * @param:textColor		文本颜色 （默认 '#909399' ）
 * @param:lineColor		线条颜色 （默认 '#dcdfe6' ）
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */

type TextPosition = 'left' | 'center' | 'right'

interface PropsType extends PropsTypeHook {
  borderStyle?: string
  hairline?: boolean
  dot?: boolean
  textPosition?: TextPosition
  text: string | number
  textSize?: string | number
  textColor?: string
  lineColor?: string
}

interface EmitsType {
  (e: 'click'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  borderStyle: 'dashed',
  hairline: true,
  dot: false,
  textPosition: 'center',
  textSize: 14,
  textColor: '#909399',
  lineColor: '#dcdfe6',
})

const emits = defineEmits<EmitsType>()

const textStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {
    fontSize: z.addUnit(props.textSize),
    color: props.textColor,
  }
  return style
})

const leftLineStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}
  if (props.textPosition === 'left') {
    style.width = '80rpx'
  } else {
    style.flex = 1
  }
  return style
})

const rightLineStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}
  if (props.textPosition === 'right') {
    style.width = '80rpx'
  } else {
    style.flex = 1
  }
  return style
})

function click() {
  emits('click')
}
</script>

<template>
  <div
    class="z-divider dfr aic"
    :style="[z.addStyle(otherStyle)]"
    @tap.stop="click"
  >
    <zLine
      :color="lineColor"
      :otherStyle="leftLineStyle"
      :hairline="hairline"
      :borderStyle="borderStyle"
    ></zLine>
    <text v-if="dot" class="dot">●</text>
    <text v-else-if="text" class="text" :style="textStyle">
      {{ text }}
    </text>
    <zLine
      :color="lineColor"
      :otherStyle="rightLineStyle"
      :hairline="hairline"
      :borderStyle="borderStyle"
    ></zLine>
  </div>
</template>

<style lang="less" scoped>
.z-divider {
  width: 100%;
  margin: 15px 0;
  .dot {
    font-size: 12px;
    margin: 0 12px;
    color: #c0c4cc;
  }
  .text {
    margin: 0 15px;
  }
}
</style>
