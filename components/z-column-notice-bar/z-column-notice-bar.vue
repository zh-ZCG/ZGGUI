<!--
 * @Description: z-column-notice-bar 纵向通知栏组件
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
  CSSProperties,
  inject,
} from 'vue'
import z from '@/ZGGUI/libs/z'
import { propsHook, PropsTypeHook } from '@/ZGGUI/libs/zHooks'
import { noticeBarKey } from '@/ZGGUI/components/z-notice-bar/index'
/**
 * @description:z-column-notice-bar 纵向通知栏组件传参
 * @tutorial: ZGGUI & ui.zggui.cn & zggamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {}

interface EmitsType {}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
})

const emits = defineEmits<EmitsType>()

const noticeBar = inject(noticeBarKey, null)

// 通知数据
const data = computed<string[]>(() => (noticeBar?.data ? noticeBar?.data : []))

// 通知切换时间
const interval = computed<number>(() =>
  noticeBar?.speed ? noticeBar?.speed : 3000
)

// 是否播放
const play = computed<boolean>(() => (noticeBar?.play ? noticeBar?.play : true))

// 是否垂直轮播
const vertical = computed<boolean>(() => noticeBar?.direction === 'vertical')

// 通知点击事件
const noticeClickEvent = (index: number) => {
  noticeBar?.click(index)
}
</script>

// #ifdef MP-WEIXIN
<script lang="ts">
export default {
  options: {
    // 在微信小程序中将组件节点渲染为虚拟节点，更加接近Vue组件的表现(不会出现shadow节点下再去创建元素)
    virtualHost: true,
  },
}
</script>
// #endif

<template>
  <div class="pr z-column-notice-bar">
    <swiper
      class="swiper pr"
      :autoplay="play"
      :interval="interval"
      :vertical="vertical"
      circular
    >
      <swiper-item
        v-for="(item, index) in data"
        :key="index"
        class="swiper-item pr"
        @tap.stop="noticeClickEvent(index)"
      >
        {{ item }}
      </swiper-item>
    </swiper>
  </div>
</template>

<style lang="less" scoped>
.z-column-notice-bar {
  width: 100%;
  height: auto;
  .swiper {
    width: 100%;
    height: 1em;
    .swiper-item {
      width: 100%;
      line-height: 1.1em;
    }
  }
}
</style>
