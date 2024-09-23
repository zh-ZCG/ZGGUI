<!--
 * @Description: z-photo-album 相册组件
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
} from 'vue'
import z from '@/ZGGUI/libs/z'
import { propsHook, PropsTypeHook } from '@/ZGGUI/libs/zHooks'
import { zImage } from '@/ZGGUI/libs/types/zImage'
import zLazyLoad from '@/ZGGUI/components/z-lazy-load/z-lazy-load.vue'
/**
 * @description: z-photo-album 相册组件传参
 * @param: data 图片地址列表
 * @param: max	最大允许显示图片的数量
 * @param: column	一行显示的图片数量
 * @param: imgMode  图片模式
 * @param: lazyLoad  是否开启懒加载
 * @param: preview  点击图片进行预览
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zggui.cn & zggamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  data?: Array<string>
  max?: number
  column?: number
  imgMode?: zImage['mode']
  lazyLoad?: boolean
  preview?: boolean
}

interface EmitsType {
  (e: 'click', index: number): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  data: () => [],
  max: 9,
  column: 3,
  imgMode: 'aspectFit',
  lazyLoad: true,
  preview: true,
})

const emits = defineEmits<EmitsType>()

const imageData = computed<string[]>(() => {
  const maxLength = Math.min(props.data.length, props.max)
  return props.data.slice(0, maxLength)
})

// 图片点击事件
const imageClickEvent = (index: number) => {
  emits('click', index)
  if (!props.preview) return
  uni.previewImage({
    urls: imageData.value,
    current: index,
  })
}

const containerStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  let width = `calc(100% / ${props.column} - 20rpx)`
  // #ifdef MP-ALIPAY
  width = `calc(100% / ${props.column} - 22rpx)`
  // #endif

  style.width = style.paddingBottom = width

  return style
})
</script>

<template>
  <div class="pr df fww z-photo-album">
    <div
      v-for="(item, index) in imageData"
      :key="index"
      class="pr container"
      :style="containerStyle"
      @tap.stop="imageClickEvent(index)"
    >
      <div class="item pa">
        <zLazyLoad
          v-if="lazyLoad"
          :src="item"
          :mode="props.imgMode"
        ></zLazyLoad>
        <image v-else class="image" :src="item" :mode="props.imgMode" />
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-photo-album {
  width: 100%;
  .container {
    flex-grow: 0;
    flex-shrink: 0;
    height: 0;
    margin: 10rpx 20rpx 10rpx 0rpx;
    .item {
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      border-radius: 15rpx;
      background-color: #eeeeee;
      .image {
        width: 100%;
        height: 100%;
        border-radius: inherit;
      }
    }
  }
}
</style>
