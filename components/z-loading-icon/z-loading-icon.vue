<!--
 * @Description: z-loading-icon 加载图标
 * @Author: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import { ref, getCurrentInstance, watch, computed, onMounted } from 'vue'
import type { Ref, PropType } from 'vue'
import z from '../../libs/z'
import zColor from '../../libs/zColor'

/**
 * @description: z-loading-icon 加载图标传参
 * @param: show 是否显示加载图标（默认true）
 * @param: vertical  图标与文字是否垂直排列 (默认false,即横向)
 * @param: mode 选择旋转模式 半圆：semicircle 圆型：circle 花朵型：flower(默认)
 * @param: size 图标大小,默认16px
 * @param: color 动画颜色，mode为flower有效
 * @param: textColor 文字颜色，默认(#1a1a1a)
 * @param: textSize 文字大小，默认16px
 * @param: textValue 文字内容
 * @param: timingFunction 使用的动画模式（默认'ease-in-out'） circle或semicircle有效
 * @param: duration 动画执行一次的时间 （默认1000，单位ms）
 * @param: inCircleColor 当mode为circle时，暗边的颜色
 * @param: otherStyle 其他样式
 *
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */
interface PropsType {
  show?: boolean
  vertical?: boolean
  mode?: string
  size?: number | string
  color?: string
  textColor?: string
  textSize?: number | string
  textValue?: string
  timingFunction?: string
  duration?: number
  inCircleColor?: string
  otherStyle?: object
}

interface EmitsType {
  (e: 'click'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  show: true,
  vertical: false,
  mode: 'circle',
  size: 16,
  color: '#666666',
  textColor: '#1a1a1a',
  textSize: 16,
  timingFunction: 'ease-in-out',
  duration: 1000,
  inCircleColor: '#409eff',
})

const emits = defineEmits<EmitsType>()

const dot = ref(
  Array.from({
    length: 12,
  })
)

onMounted(() => {
  init()
})

/**
 * 是否隐藏了动画
 */
const isHide = ref(false)

const zLoadingIconStyle = computed(() => {
  let style = {}
  return z.deepMerge(style, props.otherStyle ? props.otherStyle : {})
})

const otherBorderColor = computed(() => {
  const lightColor = zColor.colorGradient(props.color, '#ffffff', 100)[80]
  if (props.mode === 'circle') {
    return props.inCircleColor ? props.inCircleColor : lightColor
  } else {
    return 'transparent'
  }
})

const zLoadingIconDetail = computed(() => {
  let style = {
    color: props.color,
    width: z.addUnit(props.size),
    height: z.addUnit(props.size),
    borderTopColor: props.color,
    borderBottomColor: otherBorderColor.value,
    borderLeftColor: otherBorderColor.value,
    borderRightColor: otherBorderColor.value,
    'animation-duration': `${props.duration}ms`,
    'animation-timing-function':
      props.mode === 'semicircle' || props.mode === 'circle'
        ? props.timingFunction
        : '',
  } as any
  return style
})

/**
 * 初始事件
 */
function init() {
  setTimeout(() => {
    // #ifdef APP-PLUS
    props.show && addEventListenerToWebview()
    // #endif
  }, 25)
}

// 监听webview的显示与隐藏
function addEventListenerToWebview() {
  // 获取当前页面
  const pages = getCurrentPages()
  const page = pages[pages.length - 1]
  // 当前页面的webview实例
  const currentWebview = page.$getAppWebview ? page.$getAppWebview() : undefined
  // 监听webview的显示与隐藏控制动画的开关
  if (currentWebview) {
    currentWebview.addEventListener('hide', () => {
      isHide.value = true
    })
    currentWebview.addEventListener('show', () => {
      isHide.value = false
    })
  }
}
</script>

<template>
  <div
    :class="props.vertical ? 'dfc' : 'dfr'"
    class="aic jcc"
    id="z-loading-icon"
    ref="z-loading-icon"
    :style="zLoadingIconStyle"
    v-if="props.show"
  >
    <div
      v-if="!isHide"
      class="z-loading-icon-detail pr"
      :class="[`z-loading-icon-detail-${props.mode}`]"
      :style="zLoadingIconDetail"
    >
      <div
        class="pa z-loading-icon-detail-flower-dot"
        v-for="(item, index) in dot"
        :key="index"
        v-if="mode === 'flower'"
      ></div>
    </div>
    <div
      v-if="props.textValue"
      :style="{
        'font-size': z.addUnit(props.textSize),
        color: props.textColor,
      }"
    >
      {{ props.textValue }}
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-loading-icon-detail {
  width: 30px;
  height: 30px;
  max-width: 100%;
  max-height: 100%;
  animation: rotate 1s linear infinite;
}

.z-loading-icon-detail-flower {
  animation-timing-function: steps(12);
}

.z-loading-icon-detail-flower-dot {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  &:before {
    display: block;
    width: 2px;
    height: 25%;
    margin: 0 auto;
    background-color: currentColor;
    border-radius: 40%;
    content: '';
  }

  .z-loading-icon-detail-flower-dot-loop(@i) when (@i > 0) {
    &:nth-of-type(@{i}) {
      transform: rotate((@i * 30deg));
      opacity: (1 - (0.0625 * (@i - 1)));
    }
    .z-loading-icon-detail-flower-dot-loop(@i - 1);
  }
  .z-loading-icon-detail-flower-dot-loop(12);
}

.z-loading-icon-detail-semicircle {
  border-radius: 100px;
  border: 2px solid transparent;
}

.z-loading-icon-detail-circle {
  border-radius: 100px;
  border: 2px solid #e6e6e6;
}
</style>
