<!--
 * @Description: z-lazy-load  懒加载组件
 * @Author: ZGGUI & ui.zggui.cn & zggamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import {
  ref,
  onMounted,
  onUnmounted,
  getCurrentInstance,
  computed,
  onBeforeUnmount,
  watch,
  nextTick,
  CSSProperties,
} from 'vue'
import z from '@/ZGGUI/libs/z'
import { zImage } from '@/ZGGUI/libs/types/zImage'
import zIcon from '@/ZGGUI/components/z-icon/z-icon.vue'
import { useObserver } from '@/ZGGUI/libs/Hooks/z-use-observe'
import { propsHook, PropsTypeHook } from '@/ZGGUI/libs/zHooks'
/**
 * @description: z-lazy-load  懒加载组件传参
 * @param: src 图片地址
 * @param: height		图片高度
 * @param: width	图片宽度
 * @param: mode 与image的mode相同，具体可参照image
 * @param: threshold 开始加载图片的位置，单位为 px，如果设置为负数表示距离底部还有多少个像素就开始加载
 * @param: transition 是否开启过渡效果(默认true)
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zggui.cn & zggamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  src: string
  height?: string | number
  width?: string | number
  mode?: zImage['mode']
  threshold?: number
  transition?: boolean
}

interface EmitsType {
  (e: 'loaded'): void
  (e: 'error'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  // height: 225,
  // width: 225,
  mode: 'aspectFill',
  threshold: 100,
  transition: true,
})

const emits = defineEmits<EmitsType>()

const lazyLoadStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  if (showImage && imageStatus.value === 'loaded') {
    style.backgroundColor = 'transparent'
    style.color = 'transparent'
  }

  // 设置宽高
  if (props.width) style.width = z.addUnit(props.width)
  if (props.height) style.height = z.addUnit(props.height)

  return style
})

const zLazyLoadImageStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {
    opacity: 0,
  }
  if (imageStatus.value === 'loaded' && props.transition) {
    style.animation = 'show-image-animation 0.25s ease both'
  } else if (imageStatus.value === 'loaded' && !props.transition) {
    style.opacity = 1
  }

  return style
})

const current = getCurrentInstance()

const { connectObserver, disconnectObserver } = useObserver(current)

const componentId = `z-lazy-load-${current?.uid}`

// 图片触发加载位置
const threshold = computed<number>(() => {
  return props.threshold ? props.threshold : 100
})

type LazyLoadStatus = 'waiting' | 'loading' | 'loaded' | 'error'

// 图片加载状态
const imageStatus = ref<LazyLoadStatus>('waiting')
// 开始显示图片
const showImage = ref<boolean>(false)

let initCount = 0

// 初始化监听事件
const initObserver = async () => {
  disconnectObserver()
  try {
    await z.getDomInfo(`#${componentId}`, current)

    initCount = 0

    const bottomThreshold =
      threshold.value < 0
        ? -Math.abs(threshold.value)
        : Math.abs(threshold.value)
    connectObserver(
      `#${componentId}`,
      (res) => {
        if (res.intersectionRatio > 0) {
          // 开始显示图片
          showImage.value = true
          imageStatus.value = 'loading'
          // 图片已加载关闭监听，减少资源消耗
          disconnectObserver()
        }
      },
      {
        type: 'relativeToViewport',
        margins: {
          bottom: bottomThreshold,
        },
      }
    )
  } catch (err) {
    if (initCount > 10) {
      initCount = 0
      z.error(`z-lazy-load 获取图片节点信息失败：${err}`)
      return
    }
    initCount++
    setTimeout(() => {
      initObserver()
    }, 150)
  }
}

// 图片加载完成事件
const handleImageLoadedSuccess = () => {
  imageStatus.value = 'loaded'
  emits('loaded')
}

// 图片加载失败事件
const handleImageLoadedFailed = (err: any) => {
  z.error(`z-lazy-load 图片加载失败: ${err}`)
  imageStatus.value = 'error'
  emits('error')
}

onMounted(() => {
  nextTick(() => {
    initObserver()
  })
})

onUnmounted(() => {
  disconnectObserver()
})
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
  <div :id="componentId" class="pr z-full-style" :style="lazyLoadStyle">
    <!-- 加载中 -->
    <div v-if="imageStatus === 'loading'" class="z-full-style">
      <slot name="loading">
        <div class="z-full-style df jcc aic">
          <div class="icon">
            <zIcon name="loading"></zIcon>
          </div>
        </div>
      </slot>
    </div>
    <!-- 正式显示的图片 -->
    <div v-if="showImage && imageStatus !== 'error'" class="z-full-style">
      <image
        :style="zLazyLoadImageStyle"
        class="z-full-style db"
        :src="src"
        :mode="mode"
        @load="handleImageLoadedSuccess"
        @error="handleImageLoadedFailed"
      />
    </div>
    <!-- 图片加载失败 -->
    <div v-if="imageStatus === 'error'" class="z-full-style">
      <slot name="error">
        <div class="z-full-style df jcc aic" style="font-size: 100rpx">
          <zIcon name="image-error"></zIcon>
        </div>
      </slot>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-full-style {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  .icon {
    font-size: 90rpx;
    animation: loading-icon-animation 3s linear infinite;
  }
}

@keyframes loading-icon-animation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
