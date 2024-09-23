<!--
 * @Description: z-count-to 数字跳转组件
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
  onUnmounted,
} from 'vue'
import z from '@/ZGGUI/libs/z'
import { propsHook, PropsTypeHook } from '@/ZGGUI/libs/zHooks'
/**
 * @description: z-count-to 数字跳转组件传参
 * @param: startVal 开始数值（默认0）
 * @param: endVal		目标数值（默认0）
 * @param: duration		动画持续时间，单位ms（默认1500）
 * @param: autoplay 设置数值后自动开始滚动 （默认 true ）
 * @param: decimals 显示小数位数，（默认0），如果设置了startVal，endVal，该参数应该等于他们的小数位数
 * @param: decimal		十进制分割 （ 默认 "." ）
 * @param: useEasing		滚动结束，缓慢结尾（默认true）
 * @param: color 字体颜色（默认'#1a1a1a'）
 * @param: fontSize		字体大小，单位px（默认16px）
 * @param: bold		是否加粗（默认false）
 * @param: separator		千位分隔符（达到1000后分割例如1,000，默认无）
 * @param: otherStyle 其他的样式
 *
 * @event: end 滚动到目标后触发
 * @tutorial: ZGGUI & ui.zggui.cn & zggamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  startVal?: string | number
  endVal?: string | number
  duration?: string | number
  autoplay?: boolean
  decimals?: string | number
  decimal?: string
  useEasing?: boolean
  color?: string
  fontSize?: string | number
  bold?: boolean
  separator?: string
}

interface EmitsType {
  (e: 'end'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  startVal: 0,
  endVal: 0,
  duration: 1500,
  autoplay: true,
  decimals: 0,
  decimal: '.',
  useEasing: true,
  color: '#1a1a1a',
  fontSize: 22,
  bold: false,
  separator: '',
})

const emits = defineEmits<EmitsType>()

const localStartVal = ref(props.startVal)
const displayValue = ref(formatNumber(props.startVal))
const printVal = ref(0)
const paused = ref(false) // 是否暂停
const localDuration = ref(Number(props.duration))
const startTime = ref(0) // 开始的时间
const timestamp = ref(0) // 时间戳
const remaining = ref(0) // 停留的时间
const rAF = ref<string | number | NodeJS.Timeout | undefined>(undefined)
const lastTime = ref(0) // 上一次的时间

const countDown = computed<boolean>(() => {
  return props.startVal > props.endVal
})

watch(
  () => props.startVal,
  () => {
    props.autoplay && start()
  }
)

watch(
  () => props.endVal,
  () => {
    props.autoplay && start()
  }
)

onMounted(() => {
  props.autoplay && start()
})

/**
 * 缓动函数，用于计算缓动效果的当前值。
 * @param t - 当前时间。
 * @param b - 起始值。
 * @param c - 变化量（结束值 - 起始值）。
 * @param d - 持续时间。
 * @returns 计算出的缓动效果当前值。
 */
function easingFn(t: number, b: number, c: number, d: number): number {
  // 计算缓动效果的当前值
  return (c * (-Math.pow(2, (-10 * t) / d) + 1) * 1024) / 1023 + b
}
function requestAnimationFrame(callback: Function) {
  const currTime = new Date().getTime()
  // 为了使setTimteout的尽可能的接近每秒60帧的效果
  const timeToCall = Math.max(0, 16 - (currTime - lastTime.value))
  const id = setTimeout(() => {
    callback(currTime + timeToCall)
  }, timeToCall)
  lastTime.value = currTime + timeToCall
  return id
}
function cancelAnimationFrame(
  id: string | number | NodeJS.Timeout | undefined
) {
  clearTimeout(id)
}
// 开始滚动数字
function start() {
  localStartVal.value = props.startVal
  startTime.value = 0
  localDuration.value = Number(props.duration)
  paused.value = false
  rAF.value = requestAnimationFrame(count)
}
// 暂定状态，重新再开始滚动；或者滚动状态下，暂停
function reStart() {
  if (paused.value) {
    resume()
    paused.value = false
  } else {
    stop()
    paused.value = true
  }
}
// 暂停
function stop() {
  cancelAnimationFrame(rAF.value)
}
// 重新开始(暂停的情况下)
function resume() {
  if (!remaining.value) return
  startTime.value = 0
  localDuration.value = remaining.value
  localStartVal.value = printVal.value
  requestAnimationFrame(count)
}
// 重置
function reset() {
  startTime.value = 0
  cancelAnimationFrame(rAF.value)
  displayValue.value = formatNumber(props.startVal)
}
function count(timestampCopy: number) {
  if (!startTime.value) startTime.value = timestampCopy
  timestamp.value = timestampCopy
  const progress = timestampCopy - startTime.value
  remaining.value = localDuration.value - progress
  if (props.useEasing) {
    if (countDown.value) {
      printVal.value =
        Number(localStartVal.value) -
        easingFn(
          progress,
          0,
          Number(localStartVal.value) - Number(props.endVal),
          localDuration.value
        )
    } else {
      printVal.value = easingFn(
        progress,
        Number(localStartVal.value),
        Number(props.endVal) - Number(localStartVal.value),
        localDuration.value
      )
    }
  } else {
    if (countDown.value) {
      printVal.value =
        Number(localStartVal.value) -
        (Number(localStartVal.value) - Number(props.endVal)) *
          (progress / localDuration.value)
    } else {
      printVal.value =
        Number(localStartVal.value) +
        (Number(props.endVal) - Number(localStartVal.value)) *
          (progress / localDuration.value)
    }
  }
  if (countDown.value) {
    printVal.value =
      printVal.value < Number(props.endVal)
        ? Number(props.endVal)
        : printVal.value
  } else {
    printVal.value =
      printVal.value > Number(props.endVal)
        ? Number(props.endVal)
        : printVal.value
  }
  displayValue.value = formatNumber(printVal.value) || '0'
  if (progress < localDuration.value) {
    rAF.value = requestAnimationFrame(count)
  } else {
    emits('end')
  }
}
// 判断是否数字
function isNumber(val: string): boolean {
  return !isNaN(parseFloat(val))
}
function formatNumber(num: string | number) {
  // 将num转为Number类型，因为其值可能为字符串数值，调用toFixed会报错
  num = Number(num)
  num = num.toFixed(Number(props.decimals))
  num += ''
  const x = num.split('.')
  let x1 = x[0]
  const x2 = x.length > 1 ? props.decimal + x[1] : ''
  const rgx = /(\d+)(\d{3})/
  if (props.separator && !isNumber(props.separator)) {
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + props.separator + '$2')
    }
  }
  return x1 + x2
}
onUnmounted(() => {
  cancelAnimationFrame(rAF.value)
})

defineExpose({
  start,
  reStart,
  stop,
  resume,
  reset,
})
</script>

<template>
  <text
    class="z-count-to"
    :style="{
      fontSize: z.addUnit(props.fontSize),
      fontWeight: props.bold ? 'bold' : 'normal',
      color: props.color,
    }"
  >
    {{ displayValue }}
  </text>
</template>

<style lang="less" scoped>
.z-count-to {
  /* #ifndef APP-NVUE */
  display: inline-flex;
  /* #endif */
  text-align: center;
}
</style>
