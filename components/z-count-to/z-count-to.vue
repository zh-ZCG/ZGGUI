<!--
 * @Description: z-count-to 数字跳转组件
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
  onUnmounted,
  CSSProperties,
} from 'vue'
import z from '../../libs/z'
import zColor from '../../libs/zColor'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
/**
 * @description: z-count-to 数字跳转组件传参
 * @param: start 开始数值（默认0）
 * @param: end		目标数值（默认0）
 * @param: duration		动画执行时间，单位毫秒，默认1500
 * @param: textColor	文字颜色
 * @param: decimals 显示小数位数，（默认0），如果设置了startVal，endVal，该参数应该等于他们的小数位数
 * @param: fontSize		字体大小，单位px（默认16px）
 * @param: decimalSeparator		小数点的分隔符
 * @param: thousandsSeparator		千分位的分隔符，如果不填写则为没有千分位
 * @param: otherStyle 其他的样式
 *
 * @event: end 滚动到目标后触发
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  start?: string | number
  end?: string | number
  duration?: number
  decimals?: number
  textColor?: string
  fontSize?: string | number
  decimalSeparator?: string
  thousandsSeparator?: string
}

interface EmitsType {
  (e: 'end'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  start: 0,
  end: 0,
  duration: 1500,
  decimals: 0,
  textColor: '#1a1a1a',
  fontSize: 22,
  decimalSeparator: '.',
})

const emits = defineEmits<EmitsType>()

// 开始值
const startValue = computed<number>(() =>
  Number(z.isEmptyVariableInDefault(props.start, 0))
)
// 结束值
const endValue = computed<number>(() =>
  Number(z.isEmptyVariableInDefault(props.end, 0))
)
// 判断是往下计数还是往上计数
const countDown = computed<boolean>(() => startValue.value > endValue.value)

// 动画执行时间
const duration = computed<number>(() =>
  z.isEmptyVariableInDefault(props.duration, 1500)
)

// 待显示的内容
const content = ref<string>('')

// 格式化需要显示的内容
const _formatContent = (value: number) => {
  const throusandNumberReg = /(\d+)(\d{3})/
  const valueStr = value.toFixed(props.decimals)
  const valueArr = valueStr.split('.')
  let firestValue = valueArr[0]
  let secondValue = ''
  if (valueArr.length > 1) {
    secondValue = `${z.isEmptyVariableInDefault(props.decimalSeparator, '.')}${
      valueArr[1]
    }`
  }
  if (props?.thousandsSeparator) {
    while (throusandNumberReg.test(firestValue)) {
      firestValue = firestValue.replace(
        throusandNumberReg,
        `$1${props.thousandsSeparator}$2`
      )
    }
  }

  return `${firestValue}${secondValue}`
}

// 计算缓动动画时间函数
function _easeOutCubic(t: number, b: number, c: number, d: number) {
  return (c * (-Math.pow(2, (-10 * t) / d) + 1) * 1024) / 1023 + b
}

/* 数值动画操作 start */
// 动画执行开始时间
let startTime: number | null = null
// 开始执行动画
const countToAnimation = () => {
  if (!startTime) startTime = Date.now()
  const elapsed = Date.now() - startTime
  let currentValue = 0
  if (countDown.value) {
    currentValue =
      startValue.value -
      _easeOutCubic(
        elapsed,
        0,
        startValue.value - endValue.value,
        duration.value
      )
    currentValue = currentValue < endValue.value ? endValue.value : currentValue
  } else {
    currentValue = _easeOutCubic(
      elapsed,
      startValue.value,
      endValue.value - startValue.value,
      duration.value
    )
    currentValue = currentValue > endValue.value ? endValue.value : currentValue
  }
  content.value = _formatContent(currentValue)
  if (elapsed < duration.value) {
    // 使用settimeout来模拟requestAnimationFrame
    setTimeout(countToAnimation, 16)
  } else {
    // 动画执行结束
    emits('end')
  }
}
/* 数值动画操作 end */

// 监听endValue和startValue的变化
watch(
  [endValue, startValue],
  () => {
    startTime = null
    countToAnimation()
  },
  {
    immediate: true,
  }
)

// countTo对应的类
const countToClass = computed<string>(() => {
  const cls: string[] = ['z-count-to']

  return cls.join(' ')
})

// countTo对应的样式
const countToStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  style.color = zColor.getTypeColor(props.textColor || 'primary')

  if (props.fontSize) style.fontSize = z.addUnit(props.fontSize)

  return style
})
</script>

<template>
  <div :class="[countToClass]" :style="countToStyle">
    {{ content }}
  </div>
</template>

<style lang="less" scoped>
.z-count-to {
  display: inline-block;
}
</style>
