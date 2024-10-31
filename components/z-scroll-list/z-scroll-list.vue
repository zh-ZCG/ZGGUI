<!--
 * @Description: z-scroll-list 横向滚动组件
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
import zColor from '../../libs/zColor'
/**
 * @description: z-scroll-list 横向滚动组件传参
 * @param: indicator 是否显示指示器
 * @param: indicatorWidth	指示器的宽度，单位 px
 * @param: indicatorBlockWidth	指示器滑块的宽度，单位 px
 * @param: indicatorColor  指示器的背景颜色
 * @param: indicatorBlockColor  指示器滑块的背景颜色
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  indicator?: boolean
  indicatorWidth?: number
  indicatorBlockWidth?: number
  indicatorColor?: string
  indicatorBlockColor?: string
}

interface EmitsType {
  (e: 'scroll-left'): () => true
  (e: 'scroll-right'): () => true
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  indicator: true,
  indicatorWidth: 40,
  indicatorBlockWidth: 20,
})

const emits = defineEmits<EmitsType>()

const instance = getCurrentInstance()
if (!instance) {
  z.error('zScrollList 请在setup函数中使用useScrollList')
}

// 内容容器id
const componentId = `z-scroll-list-${instance?.uid}`
const componentContentId = `${componentId}-content`

// 内容容器的宽度
let componentWidth = 0
let comoponentContentWidth = 0

// 滑块滑动的距离
const indicatorBlockScrollDistance = ref<number>(0)

let initCount = 0
// 获取内容容器的宽度
const getContentRectInfo = async () => {
  try {
    const componentRectInfo = await z.getDomInfo(`#${componentId}`, instance)
    const contentRectInfo = await z.getDomInfo(
      `#${componentContentId}`,
      instance
    )

    initCount = 0
    componentWidth = componentRectInfo.width || 0
    comoponentContentWidth = contentRectInfo.width || 0
  } catch (err) {
    if (initCount > 10) {
      initCount = 0
      z.error(`zScrollList 获取内容容器的宽度失败: ${err}`)
      return
    }
    initCount++
    setTimeout(() => {
      getContentRectInfo()
    }, 150)
  }
}

// scrollView滚动事件
const scrollViewScrollEvent = (e: any) => {
  const scrollLeft = e.detail.scrollLeft
  indicatorBlockScrollDistance.value =
    (scrollLeft * (props.indicatorWidth - props.indicatorBlockWidth)) /
    (comoponentContentWidth - componentWidth)
}

// scrollView滚动到最左边触发
const scrollToLeftEvent = () => {
  emits('scroll-left')
}
// scrollView滚动到最右边触发
const scrollToRightEvent = () => {
  emits('scroll-right')
}

onMounted(() => {
  nextTick(() => {
    getContentRectInfo()
  })
})

// 指示器对应的类
const indicatorClass = computed<string>(() => {
  const cls: string[] = ['indicator']

  return cls.join(' ')
})
// 指示器的样式
const indicatorStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  if (props.indicatorWidth) style.width = z.addUnit(props.indicatorWidth)

  style.backgroundColor = zColor.getTypeColor(
    z.isEmptyVariableInDefault(
      props.indicatorColor,
      zColor.getTypeColor('disabled')
    )
  )

  return style
})

// 指示器滑块对应的类
const indicatorBlockClass = computed<string>(() => {
  const cls: string[] = ['indicator-block']

  return cls.join(' ')
})
// 指示器滑块的样式
const indicatorBlockStyle = computed<(distance: number) => CSSProperties>(
  () => {
    return (distance: number) => {
      const style: CSSProperties = {}

      if (props.indicatorBlockWidth)
        style.width = z.addUnit(props.indicatorBlockWidth)

      style.left = `${distance}px`

      style.backgroundColor = zColor.getTypeColor(
        z.isEmptyVariableInDefault(
          props.indicatorBlockColor,
          zColor.getTypeColor('primary')
        )
      )

      return style
    }
  }
)
</script>

<template>
  <div
    :id="componentId"
    class="z-scroll-list pr"
    :class="indicator ? 'indicator' : ''"
  >
    <!-- 内容 -->
    <div class="content">
      <scroll-view
        class="scroll-view"
        scroll-x
        enhanced="true"
        :show-scrollbar="false"
        @scroll="scrollViewScrollEvent"
        @scrolltoupper="scrollToLeftEvent"
        @scrolltolower="scrollToRightEvent"
      >
        <div :id="componentContentId" class="data">
          <slot></slot>
        </div>
      </scroll-view>
    </div>

    <!-- 指示器 -->
    <div v-if="indicator" :class="[indicatorClass]" :style="indicatorStyle">
      <!-- 滑块 -->
      <div
        :class="[indicatorBlockClass]"
        :style="indicatorBlockStyle(indicatorBlockScrollDistance)"
      ></div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-scroll-list {
  width: 100%;
  .content {
    width: 100%;
    .scroll-view {
      width: 100%;
      .data {
        position: relative;
        width: fit-content;
      }
    }
  }
  .indicator {
    position: absolute;
    left: 50%;
    height: 8rpx;
    border-radius: 1000rpx;
    transform: translate(-50%, 0);
    .indicator-block {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      border-radius: inherit;
    }
  }
}
</style>
