<!--
 * @Description: z-circle-progress 圆圈进度组件
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
import { propsHook, PropsTypeHook } from '@/ZGGUI/libs/zHooks'
/**
 * @description: z-circle-progress 圆圈进度组件传参
 * @param: radius 圆环的半径，单位 px
 * @param: ringWidth		圆环的宽度，单位 px
 * @param: percent	当前进度百分比
 * @param: activeColor  激活时的颜色
 * @param: inactiveColor  未激活时的颜色
 * @param: showPercent  显示当前进度
 * @param: duration  动画执行时间，单位ms
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  radius?: number
  ringWidth?: number
  percent?: number
  activeColor?: string
  inactiveColor?: string
  showPercent?: boolean
  duration?: number
}

interface EmitsType {}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  radius: 50,
  ringWidth: 7,
  percent: 0,
  duration: 1500,
})

const emits = defineEmits<EmitsType>()

const instance = getCurrentInstance()

// 圆环的直径
const radius = computed<number>(() => {
  return props?.radius ? props?.radius : 50
})
// 圆环的宽度
const ringWidth = computed<number>(() => {
  return props?.ringWidth ? props?.ringWidth : 14
})

// 圆环的颜色
const circleColor = computed<string>(() => {
  return props?.inactiveColor ? props?.inactiveColor : '#e6e6e6'
})

// 圆环激活时的颜色
const activeCircleColor = computed<string>(() => {
  return props?.activeColor ? props?.activeColor : '#01beff'
})

// 动画执行时间
const duration = computed<number>(() => {
  return props?.duration ? props?.duration : 1500
})

// 进度信息，为了产生动画效果，需要在进度条变化时，将进度信息保存下来
let currentPercent = 0
let prevPercent = 0

// 生成canvas圆环id
const canvasId = String('z-circle-progress-' + instance?.uid)

// canvas容器对象
let progressCanvas: UniApp.CanvasContext | null = null

// 圆环开始角度
const startAngle = -90 * (Math.PI / 180)

// 绘制progress圆环
const drawProgressCircle = (percent: number) => {
  if (!progressCanvas) {
    progressCanvas = uni.createCanvasContext(canvasId, instance)
  }
  // 清空画布
  progressCanvas.clearRect(0, 0, radius.value * 2, radius.value * 2)

  // 绘制底部圆环
  progressCanvas.beginPath()
  // 设置颜色\线框
  progressCanvas.setLineWidth(ringWidth.value)
  progressCanvas.setStrokeStyle(circleColor.value)
  // 绘制圆环
  progressCanvas.arc(
    radius.value,
    radius.value,
    radius.value - ringWidth.value / 2,
    startAngle,
    Math.PI * 1.5,
    false
  )
  progressCanvas.stroke()

  // 如果进度为0，不绘制进度圆环
  if (percent === 0) {
    progressCanvas.draw()
    return
  }
  // 绘制进度圆环
  progressCanvas.beginPath()
  // 设置颜色\线框
  progressCanvas.setLineCap('round')
  progressCanvas.setLineWidth(ringWidth.value)
  progressCanvas.setStrokeStyle(activeCircleColor.value)

  // 结束角度
  const endAngle = (Math.PI * 2 * percent) / 100 - Math.PI / 2
  progressCanvas.arc(
    radius.value,
    radius.value,
    radius.value - ringWidth.value / 2,
    startAngle,
    endAngle,
    false
  )
  progressCanvas.stroke()

  progressCanvas.draw()
}

// 计算缓动动画时间函数
function easeOutCubic(t: number, b: number, c: number, d: number) {
  return c * ((t = t / d - 1) * t * t + 1) + b
}

// 开始执行动画
let startTime: number | null = null
const progressAnimation = () => {
  if (!startTime) startTime = Date.now()
  const elapsed = Date.now() - startTime
  let percent = easeOutCubic(
    elapsed,
    prevPercent,
    currentPercent - prevPercent,
    duration.value
  )
  if (percent < 0) percent = 0
  drawProgressCircle(percent)
  if (elapsed < duration.value) {
    setTimeout(progressAnimation, 16)
  }
}

watch(
  () => props.percent,
  (nVal: number, oVal: number | undefined) => {
    currentPercent = nVal > 100 ? 100 : nVal
    prevPercent = !oVal || oVal < 0 ? 0 : oVal

    nextTick(() => {
      startTime = null
      progressAnimation()
    })
  },
  {
    immediate: true,
  }
)
</script>

<template>
  <view
    class="pr"
    :style="{
      width: `${radius * 2}px`,
      height: `${radius * 2}px`,
      color: activeCircleColor,
    }"
  >
    <!-- 默认圆环 -->
    <canvas :id="canvasId" class="pa canvas" :canvas-id="canvasId" />
    <!-- 数值 -->
    <view v-if="showPercent || $slots.default" class="pa precent">
      <slot>{{ percent }}%</slot>
    </view>
  </view>
</template>

<style lang="less" scoped>
.canvas {
  width: 100%;
  height: 100%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.precent {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
