<!--
 * @Description: z-swiper 轮播组件
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
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
/**
 * @description: z-swiper 轮播组件传参
 * @param: modelValue 当前选中item的索引值
 * @param: data		swiper数据源
 * @param: blankCount	空白swiper的数量，如果设置了data则以data的数据为准
 * @param: width  轮播图的宽度,默认px
 * @param: height  轮播图的高度,默认px
 * @param: autoplay  是否自动播放
 * @param: interval  自动播放的时间间隔，单位ms
 * @param: duration  动画时长，单位ms
 * @param: loop  是否循环播放
 * @param: previousMargin  前边距
 * @param: nextMargin  后边距
 * @param: indicator  是否显示指示器
 * @param: indicatorPosition  指示器的位置
 * @param: indicatorType   指示器的类型
 * @param: indicatorBgColor  指示器颜色
 * @param: indicatorActiveBgColor  指示器激活时的颜色
 * @param: indicatorTextColor  指示器文本颜色
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */

type swiperIndicatorPosition =
  | 'left-top'
  | 'center-top'
  | 'right-top'
  | 'left-bottom'
  | 'center-bottom'
  | 'right-bottom'

type swiperIndicatorType = 'line' | 'dot' | 'number'

interface PropsType extends PropsTypeHook {
  modelValue?: number
  data?: Array<any>
  blankCount?: number
  width?: string
  height?: string
  autoplay?: boolean
  interval?: number
  duration?: number
  loop?: boolean
  previousMargin?: string | number
  nextMargin?: string | number
  indicator?: boolean
  indicatorPosition?: swiperIndicatorPosition
  indicatorType?: swiperIndicatorType
  indicatorBgColor?: string
  indicatorActiveBgColor?: string
  indicatorTextColor?: string
}

interface EmitsType {
  (e: 'update:modelValue', value: number): void
  (e: 'change', value: number): void
  (e: 'item-click', value: number): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  modelValue: 0,
  data: [] as any,
  autoplay: false,
  interval: 5000,
  duration: 500,
  loop: false,
  previousMargin: 0,
  nextMargin: 0,
  indicatorPosition: 'center-bottom',
  indicatorType: 'dot',
})

const emits = defineEmits<EmitsType>()

type IndicatorColorStyle = (active: boolean) => CSSProperties

// swiper对应的样式
const swiperStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  if (props.width) style.width = z.addUnit(props.width)
  if (props.height) style.height = z.addUnit(props.height)

  return style
})

// 指示器颜色对应的样式
const indicatorColorStyle = computed<IndicatorColorStyle>(() => {
  return (active: boolean) => {
    const style: CSSProperties = {}

    if (props.indicatorType === 'number') {
      if (props.indicatorBgColor) {
        style.backgroundColor = props.indicatorBgColor || 'rgba(0, 0, 0, 0.25)'
      }
      if (props.indicatorTextColor) {
        style.color = props.indicatorTextColor
      } else if (!props.indicatorTextColor && !props.indicatorBgColor) {
        style.color = '#fff'
      }
    } else {
      if (active) {
        if (props.indicatorActiveBgColor)
          style.backgroundColor = props.indicatorActiveBgColor || '#fff'
      } else {
        if (props.indicatorBgColor)
          style.backgroundColor =
            props.indicatorBgColor || 'rgba(0, 0, 0, 0.25)'
      }
    }

    return style
  }
})

// 当前选中的SwiperItem索引
const currentSwiperIndex = ref<number>(
  props?.modelValue ? props?.modelValue : 0
)

watch(
  () => props.modelValue,
  (value) => (currentSwiperIndex.value = value ? value : 0)
)

// 轮播数据
const swiperData = computed<any[]>(() => {
  if (props.data?.length) return props.data
  if (props.blankCount)
    return Array.from({ length: props.blankCount }).map((_, i) => i)
  return []
})

// swiper数量
const swiperCount = computed<number>(() => swiperData.value?.length || 0)

// 处理swiper滑动事件
const swiperChangeHandle = (event: any) => {
  const { current } = event.detail
  if (props.modelValue === undefined || props.modelValue === 0)
    currentSwiperIndex.value = current
  emits('update:modelValue', current)
  nextTick(() => {
    emits('change', current)
  })
}

// 处理item点击事件
const itemClickHandle = () => {
  emits('item-click', currentSwiperIndex.value)
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
  <div class="pr z-swiper" :style="swiperStyle" @tap.stop="itemClickHandle">
    <div class="z-swiper-wrapper" :style="swiperStyle">
      <swiper
        class="swiper"
        :current="currentSwiperIndex"
        :autoplay="autoplay"
        :interval="interval"
        :duration="duration"
        :circular="loop"
        :previous-margin="previousMargin"
        :next-margin="nextMargin"
        @change="swiperChangeHandle"
      >
        <swiper-item
          v-for="(item, index) in swiperData"
          :key="index"
          class="swiper-item"
        >
          <slot :active="index === currentSwiperIndex" :data="item" />
        </swiper-item>
      </swiper>
    </div>
    <!-- 指示器 -->
    <div v-if="indicator" class="indicator pa" :class="indicatorPosition">
      <!-- 矩形 -->
      <div v-if="indicatorType === 'line'" class="indicator-line">
        <div class="indicator-wrapper" :style="indicatorColorStyle(false)">
          <div
            class="active-block"
            :style="{
              ...indicatorColorStyle(true),
              width: `${(100 / swiperData.length).toFixed(2)}%`,
              transform: `translateX(${100 * currentSwiperIndex}%)`,
            }"
          />
        </div>
      </div>
      <!-- 点 -->
      <div v-if="indicatorType === 'dot'" class="indicator-dot">
        <div class="indicator-wrapper">
          <div
            v-for="(_, i) in swiperCount"
            :key="i"
            class="dot-item"
            :class="[{ active: i === currentSwiperIndex }]"
            :style="indicatorColorStyle(i === currentSwiperIndex)"
          />
        </div>
      </div>
      <!-- 数值 -->
      <div v-if="indicatorType === 'number'" class="indicator-number">
        <div class="indicator-wrapper" :style="indicatorColorStyle(false)">
          <div class="current-index">{{ currentSwiperIndex + 1 }}</div>
          <div class="sep">/</div>
          <div class="swiper-count">{{ swiperCount }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-swiper {
  width: 100%;
  height: 100%;
  .z-swiper-wrapper {
    width: 100%;
    height: 100%;
    .swiper {
      width: 100%;
      height: 100%;
      .swiper-item {
        width: 100%;
        height: 100%;
        overflow: visible !important;
        > view {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
  .indicator {
    .indicator-line {
      position: relative;
      width: 100rpx;
      height: 8rpx;
      .indicator-wrapper {
        width: 100%;
        height: 100%;

        .active-block {
          position: absolute;
          height: 100%;
          left: 0;
          top: 0;
          transition: transform 0.3s ease-out;
        }
      }
    }
    .indicator-dot {
      position: relative;
      width: fit-content;
      height: auto;

      .indicator-wrapper {
        display: flex;
        align-items: center;

        .dot-item {
          position: relative;
          width: 16rpx;
          height: 16rpx;
          border-radius: 50%;
          margin-right: 10rpx;
          transition-property: width, border-radius;
          transition-duration: 0.3s;
          transition-timing-function: ease;

          &.active {
            width: 32rpx;
            border-radius: 30rpx;
          }
        }
      }
    }
    .indicator-number {
      position: relative;
      width: fit-content;
      height: auto;

      .indicator-wrapper {
        display: flex;
        align-items: center;
        line-height: 1;
        padding: 10rpx 24rpx;
        border-radius: 100rpx;

        .sep {
          margin: 0rpx 6rpx;
        }
      }
    }
  }
  .left-top {
    left: 30rpx;
    top: 30rpx;
    transform: translateY(-50%);
    .indicator-number {
      margin-top: 20rpx;
    }
  }
  .center-top {
    top: 30rpx;
    left: 50%;
    transform: translate(-50%, -50%);
    .indicator-number {
      margin-top: 20rpx;
    }
  }
  .right-top {
    right: 30rpx;
    top: 30rpx;
    transform: translateY(-50%);
    .indicator-number {
      margin-top: 20rpx;
    }
  }
  .left-bottom {
    left: 30rpx;
    bottom: 30rpx;
    transform: translateY(50%);
    .indicator-number {
      margin-bottom: 20rpx;
    }
  }
  .center-bottom {
    bottom: 30rpx;
    left: 50%;
    transform: translate(-50%, 50%);
    .indicator-number {
      margin-bottom: 20rpx;
    }
  }
  .right-bottom {
    right: 30rpx;
    bottom: 30rpx;
    transform: translateY(50%);
    .indicator-number {
      margin-bottom: 20rpx;
    }
  }
}
</style>
