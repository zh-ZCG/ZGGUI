<!--
 * @Description: z-row-notice-bar 横向通知栏组件
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
  inject,
} from 'vue'
import z from '@/ZGGUI/libs/z'
import { propsHook, PropsTypeHook } from '@/ZGGUI/libs/zHooks'
import { noticeBarKey } from '@/ZGGUI/components/z-notice-bar/index'
/**
 * @description:z-row-notice-bar 横向通知栏组件传参
 * @tutorial: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {}

interface EmitsType {}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
})

const emits = defineEmits<EmitsType>()

const instance = getCurrentInstance()
const noticeBar = inject(noticeBarKey)

console.log(123)
console.log(noticeBar)

const componentId = `z-row-notice-bar-${instance?.uid}`
const componentTextId = `${componentId}-text`

// 需要显示的数据
const data = computed<string>(() => {
  if (!noticeBar?.data?.length) return ''
  return noticeBar.data.join(' ')
})

// 每秒显示的像素数
const speed = computed<number>(() => (noticeBar?.speed ? noticeBar?.speed : 80))

// 动画参数
let animationDuration = 0
let animation: UniApp.Animation | null = null
const animationData = ref<any>(null)
let animationLoopTimer: ReturnType<typeof setInterval> | null = null

// 创建动画
const createAnimation = () => {
  animation = uni.createAnimation({
    duration: animationDuration,
    timingFunction: 'linear',
  })

  animation
    .translateX(-(contentWidth + contentTextWidth) + Number(Math.random() * 10))
    .step({
      duration: animationDuration,
    })
  animation.translateX(0).step({
    duration: 0,
  })

  animationData.value = animation.export()
}
// 创建循环动画
const createLoopAnimation = () => {
  createAnimation()
  animationLoopTimer = setInterval(() => {
    createAnimation()
  }, animationDuration + 80)
}
// 停止动画
const stopAnimation = () => {
  animation = null
  animationData.value = null
  if (animationLoopTimer) {
    clearInterval(animationLoopTimer)
    animationLoopTimer = null
  }
}

watch(
  () => noticeBar?.play,
  (newVal) => {
    if (newVal) {
      createLoopAnimation()
    } else {
      stopAnimation()
    }
  }
)

let initCount = 0
// 获取内容区域容器信息
let contentWidth = 0
let contentTextWidth = 0
const getContentRectInfo = async () => {
  try {
    const contentRectInfo = await z.getDomInfo(`#${componentId}`, instance)
    const contentTextRectInfo = await z.getDomInfo(
      `#${componentTextId}`,
      instance
    )

    initCount = 0

    contentWidth = contentRectInfo.width || 0
    contentTextWidth = contentTextRectInfo.width || 0
    animationDuration = ((contentWidth + contentTextWidth) / speed.value) * 1000

    if (noticeBar?.play && noticeBar?.autoPlay) {
      setTimeout(() => {
        createLoopAnimation()
      }, 50)
    }
  } catch (err) {
    if (initCount > 10) {
      initCount = 0
      z.error(`z-row-notice-bar 获取通知栏容器信息失败: ${err}`)
      return
    }
    initCount++
    setTimeout(() => {
      getContentRectInfo()
    }, 150)
  }
}

// 如果修改了speed重新初始化
watch(
  () => noticeBar?.speed,
  () => {
    stopAnimation()
    getContentRectInfo()
  }
)

// 通知点击事件
const noticeClickEvent = () => {
  noticeBar?.click(0)
}

onMounted(() => {
  nextTick(() => {
    getContentRectInfo()
  })
})
</script>

// #ifdef MP-WEIXIN
<!-- <script lang="ts">
export default {
  options: {
    // 在微信小程序中将组件节点渲染为虚拟节点，更加接近Vue组件的表现(不会出现shadow节点下再去创建元素)
    virtualHost: true,
  },
}
</script> -->
// #endif

<template>
  <div
    :id="componentId"
    class="z-row-notice-bar pr"
    :animation="animationData"
    @tap.stop="noticeClickEvent"
  >
    <div :id="componentTextId" class="data wsnw">
      {{ data }}
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-row-notice-bar {
  width: auto;
  min-width: 0;
  padding-left: 100%;
  color: inherit;
  background-color: transparent;
  .data {
    display: inline;
    word-break: keep-all;
    width: auto;
    min-width: 0;
  }
}
</style>
