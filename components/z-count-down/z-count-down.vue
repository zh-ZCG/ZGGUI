<!--
 * @Description: z-count-down 倒计时组件
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
} from 'vue'
import z from '../../libs/z'
import zMath from '../../libs/zMath'
import zColor from '../../libs/zColor'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
/**
 * @description: z-count-down 倒计时组件传参
 * @param: time 倒计时时间，ms
 * @param: format		时间格式 DD-日，HH-时，mm-分，ss-秒，SSS-毫秒  （默认 'HH:mm:ss' ）
 * @param: autoStart 自动开始倒计时 （默认 true ）
 * @param: millisecond 展示毫秒倒计时 （默认 false ）
 * @param: finish		倒计时结束时触发
 * @param: change 倒计时变化时触发
 * @param: start		开始倒计时
 * @param: pause		暂停倒计时
 * @param: reset		重置倒计时，if autoStart 为 true，重置后会自动开始倒计时
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  time?: string | number
  format?: string
  autoStart?: boolean
  millisecond?: boolean
  finish?: Function
  change?: Function
  start?: Function
  pause?: Function
  reset?: Function
}

interface EmitsType {
  (e: 'change', data: any): void
  (e: 'finish'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  time: 0,
  format: 'HH:mm:ss',
  autoStart: true,
  millisecond: false,
  finish: () => {},
  change: () => {},
  start: () => {},
  pause: () => {},
  reset: () => {},
})

const emits = defineEmits<EmitsType>()

onMounted(() => {
  init()
})

const timer = ref<NodeJS.Timeout | null>(null)
// 各单位(天，时，分等)剩余时间
const timeData = zMath.parseTimeData(0)
// 格式化后的时间，如"03:23:21"
const formattedTime = ref<string>('0')
// 倒计时是否正在进行中
const runing = ref<boolean>(false)
const endTime = ref<number>(0) // 结束的毫秒时间戳
const remainTime = ref<number>(0) // 剩余的毫秒时间

watch(
  () => props.time,
  (newVal) => {
    reset()
  }
)

function init() {
  reset()
}

// 开始倒计时
function start() {
  if (runing.value) return
  // 标识为进行中
  runing.value = true
  // 结束时间戳 = 此刻时间戳 + 剩余的时间
  endTime.value = Date.now() + remainTime.value
  toTick()
}
// 根据是否展示毫秒，执行不同操作函数
function toTick() {
  if (props.millisecond) {
    microTick()
  } else {
    macroTick()
  }
}
function macroTick() {
  ClearTimeout()
  // 每隔一定时间，更新一遍定时器的值
  // 同时此定时器的作用也能带来毫秒级的更新
  timer.value = setTimeout(() => {
    // 获取剩余时间
    const remain = getRemainTime()
    // 重设剩余时间
    if (!zMath.isSameSecond(remain, remainTime.value) || remain === 0) {
      setRemainTime(remain)
    }
    // 如果剩余时间不为0，则继续检查更新倒计时
    if (remainTime.value !== 0) {
      macroTick()
    }
  }, 30)
}
function microTick() {
  ClearTimeout()
  timer.value = setTimeout(() => {
    setRemainTime(getRemainTime())
    if (remainTime.value !== 0) {
      microTick()
    }
  }, 50)
}
// 获取剩余的时间
function getRemainTime() {
  // 取最大值，防止出现小于0的剩余时间值
  return Math.max(endTime.value - Date.now(), 0)
}
// 设置剩余的时间
function setRemainTime(remain: number) {
  remainTime.value = remain
  // 根据剩余的毫秒时间，得出该有天，小时，分钟等的值，返回一个对象
  const timeData = zMath.parseTimeData(remain)
  emits('change', timeData)
  // 得出格式化后的时间
  formattedTime.value = zMath.parseFormat(props.format, timeData)
  // 如果时间已到，停止倒计时
  if (remain <= 0) {
    pause()
    emits('finish')
  }
}
// 重置倒计时
function reset() {
  pause()
  remainTime.value = Number(props.time)
  setRemainTime(remainTime.value)
  if (props.autoStart) {
    start()
  }
}
// 暂停倒计时
function pause() {
  runing.value = false
  ClearTimeout()
}
// 清空定时器
function ClearTimeout() {
  if (timer.value) clearTimeout(timer.value)
  timer.value = null
}

onBeforeUnmount(() => {
  ClearTimeout()
})

defineExpose({
  start,
  pause,
  reset,
})
</script>

<template>
  <div class="z-count-down" :style="z.addStyle(props.otherStyle)">
    <slot>
      <text class="text">{{ formattedTime }}</text>
    </slot>
  </div>
</template>

<style lang="less" scoped>
.z-count-down {
  .text {
    color: #1a1a1a;
    font-size: 16px;
    line-height: 24px;
  }
}
</style>
