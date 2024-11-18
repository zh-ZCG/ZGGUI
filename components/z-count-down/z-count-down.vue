<!--
 * @Description: z-count-down 倒计时组件
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
import zMath from '../../libs/zMath'
import zColor from '../../libs/zColor'
import { useComponentSize } from '../../libs/use-component-size/use-component-size'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
/**
 * @description: z-count-down 倒计时组件传参
 * @param: time 倒计时时间，ms
 * @param: autoStart 自动开始倒计时 （默认 true ）
 * @param: size 尺寸可选small normal large 或者自定义大小
 * @param: showDay 显示天数
 * @param: showHour 显示小时
 * @param: showMinute	显示分钟
 * @param: showSecond 显示秒数
 * @param: autoHideDay		隐藏天数
 * @param: separatorMode		分割符类型，`cn` 显示 对应语言的中文分割符，`en` 显示 : 分割符
 * @param: separatorColor		分割符颜色
 * @param: border	显示边框
 * @param: borderColor	边框颜色
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */

type separatorModeType = 'cn' | 'en'

const countDownSeparatorMode = ['cn', 'en'] as const

type CountDownSeparatorMode = (typeof countDownSeparatorMode)[number]

interface CountDownSeparatorItem {
  day: string
  hour: string
  minute: string
  second: string
}
type CountDownSeparatorData = Record<
  CountDownSeparatorMode,
  CountDownSeparatorItem
>

interface PropsType extends PropsTypeHook {
  time: number
  autoStart?: boolean
  size?: string
  textColor?: string
  showDay?: boolean
  showHour?: boolean
  showMinute?: boolean
  showSecond?: boolean
  autoHideDay?: boolean
  separatorMode?: separatorModeType
  separatorColor?: string
  border?: boolean
  borderColor?: string
}

interface EmitsType {
  (e: 'start'): void
  (e: 'end'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  time: 0,
  size: 'normal',
  autoStart: true,
  showHour: true,
  showMinute: true,
  showSecond: true,
  autoHideDay: true,
  separatorMode: 'en',
})

const emits = defineEmits<EmitsType>()

const SECOND = 1
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// 当前倒计时时间
let time = 0

// 时间定义
const day = ref<string>('')
const hour = ref<string>('')
const minute = ref<string>('')
const second = ref<string>('')

// 将时间戳转换为对应的时间
const splitCountDownData = () => {
  const { showDay, showHour, showMinute, showSecond, autoHideDay } = props

  const _day = Math.floor(time / DAY)

  // 如果不显示天数则将天的时间加到小时上，后面的分钟和秒如此累加
  const _hour = showDay
    ? Math.floor((time % DAY) / HOUR)
    : Math.floor(time / HOUR)
  const _minute = Math.floor((time % HOUR) / MINUTE)
  const _second = Math.floor(time % MINUTE)

  // 判断是否自动隐藏天数
  if (!showDay || (autoHideDay && _day === 0)) day.value = ''
  else day.value = z.formatNumber(_day, 4)

  hour.value = showHour ? z.formatNumber(_hour, 4) : ''
  minute.value = showMinute ? z.formatNumber(_minute) : ''
  second.value = showSecond ? z.formatNumber(_second) : ''
}

// 倒计时定时器
let countDownTimer: ReturnType<typeof setInterval> | null = null
// 开始倒计时
const startCountDown = () => {
  // 如果倒计时时间为0，重新设置倒计时时间
  if (time <= 0) time = props.time
  else {
    // 先渲染一次
    time--
  }
  // 先停止之前的倒计时
  stopCountDown()
  emits('start')
  // 开始倒计时
  countDownTimer = setInterval(() => {
    if (time < 0) {
      stopCountDown()
      emits('end')
      return
    }

    splitCountDownData()
    time--
  }, 1000)
}
// 停止倒计时
const stopCountDown = () => {
  if (countDownTimer) {
    clearInterval(countDownTimer)
    countDownTimer = null
  }
}
// 重置定时器
const resetCountDown = () => {
  stopCountDown()
  time = props.time
  splitCountDownData()
}

watch(
  () => props.time,
  (_time) => {
    resetCountDown()
    // 自动开始倒计时
    if (props.autoStart && _time > 0) {
      startCountDown()
    }
  },
  {
    immediate: true,
  }
)

const countDownSeparatorData: CountDownSeparatorData = {
  cn: {
    day: '天',
    hour: '时',
    minute: '分',
    second: '秒',
  },
  en: {
    day: ':',
    hour: ':',
    minute: ':',
    second: '',
  },
}

const getSeparatorData = (
  mode: CountDownSeparatorMode,
  key: keyof CountDownSeparatorItem
) => {
  return countDownSeparatorData[mode][key]
}

const { sizeType } = useComponentSize(props.size)

// 倒计时的类
const countDownClass = computed<string>(() => {
  const cls: string[] = ['z-count-down']

  if (props.size && sizeType.value === 'inner')
    cls.push(`z-count-down-${props.size}`)

  return cls.join(' ')
})
// 倒计时的样式
const countDownStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  // 设置字体大小
  if (props.size && sizeType.value === 'custom')
    style.fontSize = z.addUnit(props.size)

  return style
})

// 倒计时文字的类
const textClass = computed<string>(() => {
  const cls: string[] = ['z-count-down-text']

  return cls.join(' ')
})
// 倒计时文字的样式
const textStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  // 设置字体颜色
  if (props.textColor)
    style.color = zColor.getTypeColor(props.textColor || 'primary')

  // 设置边框颜色
  if (props.border) {
    if (props.borderColor) {
      style.borderColor = zColor.getTypeColor(props.borderColor || 'disabled')
    }
    style.borderRadius = '8rpx'
    style.borderWidth = '1rpx'
    style.borderStyle = 'solid'
    style.padding = '4rpx'
  }

  return style
})

// 分割符的类
const separatorClass = computed<string>(() => {
  const cls: string[] = [
    'z-count-down-separator',
    `z-count-down-separator-${props.separatorMode}`,
  ]

  return cls.join(' ')
})
// 分割符的样式
const separatorStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  if (props.separatorColor)
    style.color = zColor.getTypeColor(props.separatorColor || '#666666')

  return style
})

defineExpose({
  /**
   * @description 开始倒计时
   */
  start: startCountDown,
  /**
   * @description 停止倒计时
   */
  stop: stopCountDown,
  /**
   * @description 重置倒计时
   */
  reset: resetCountDown,
})
</script>

<template>
  <div :class="[countDownClass]" :style="countDownStyle" class="pr">
    <!-- 日 -->
    <template v-if="day">
      <div class="day" :class="[textClass]" :style="textStyle">{{ day }}</div>
      <div class="day" :class="[separatorClass]" :style="separatorStyle">
        {{ getSeparatorData(separatorMode, 'day') }}
      </div>
    </template>
    <!-- 时 -->
    <template v-if="hour">
      <div class="hour" :class="[textClass]" :style="textStyle">
        {{ hour }}
      </div>
      <div class="hour" :class="[separatorClass]" :style="separatorStyle">
        {{ getSeparatorData(separatorMode, 'hour') }}
      </div>
    </template>
    <!-- 分 -->
    <template v-if="minute">
      <div class="minute" :class="[textClass]" :style="textStyle">
        {{ minute }}
      </div>
      <div class="minute" :class="[separatorClass]" :style="separatorStyle">
        {{ getSeparatorData(separatorMode, 'minute') }}
      </div>
    </template>
    <!-- 秒 -->
    <template v-if="second">
      <div class="second" :class="[textClass]" :style="textStyle">
        {{ second }}
      </div>
      <div
        v-if="getSeparatorData(separatorMode, 'second')"
        class="minute"
        :class="[separatorClass]"
        :style="separatorStyle"
      >
        {{ getSeparatorData(separatorMode, 'second') }}
      </div>
    </template>
  </div>
</template>

<style lang="less" scoped>
.z-count-down {
  display: inline-flex;
  align-items: center;

  line-height: 1;

  .z-count-down-text {
  }

  .z-count-down-separator {
    margin: 0 4rpx;
  }
  .z-count-down-separator-en {
    margin-top: -3%;
  }
}
.z-count-down-small {
  font-size: 24rpx;
}
.z-count-down-normal {
  font-size: 28rpx;
}
.z-count-down-large {
  font-size: 32rpx;
}
.z-count-down-xlarge {
  font-size: 36rpx;
}
</style>
