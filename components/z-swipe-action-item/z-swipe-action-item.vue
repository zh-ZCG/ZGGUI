<!--
 * @Description: z-swipe-action-item 滑动菜单子组件
 * @Author: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
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
<script lang="ts" setup>
import {
  ref,
  onMounted,
  getCurrentInstance,
  onUnmounted,
  computed,
  onBeforeUnmount,
  watch,
  nextTick,
  CSSProperties,
  inject,
} from 'vue'
import z from '@/ZGGUI/libs/z'
import zIcon from '@/ZGGUI/components/z-icon/z-icon.vue'
import zColor from '@/ZGGUI/libs/zColor'
import { SwipeActionItemOption } from '@/ZGGUI/components/z-swipe-action-item/z-swipe-action-item'
import { useTouch } from '@/ZGGUI/libs/use-Touch/use-Touch'
import { swipeActionContextKey } from '@/ZGGUI/components/z-swipe-action/z-swipe-action'
import { propsHook, PropsTypeHook } from '@/ZGGUI/libs/zHooks'
/**
 * @description: z-swipe-action-item 滑动菜单子组件传参
 * @param: autoClose 自动关闭菜单
 * @param: options	菜单配置项
 * @param: disabled	是否禁用
 * @param: threshold  滑动阈值，单位 px，大于该值则滑动动作生效
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  autoClose?: boolean
  options?: Array<SwipeActionItemOption>
  disabled?: boolean
  threshold?: number
}

interface EmitsType {}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  autoClose: true,
  options: () => [],
  threshold: 20,
})

const emits = defineEmits<EmitsType>()

const instance = getCurrentInstance()

const { uid } = instance!

const swipeActionContext = inject(swipeActionContextKey, null)
if (!swipeActionContext) {
  z.error('zSwipeActionItem 请在zSwipeAction 中使用 zSwipeActionItem')
}

const componentId = `z-swipe-action-item`
const optionComponentClass = `${componentId}-option`

function optionItemClass(item: SwipeActionItemOption) {
  let cls = 'option-item'

  if (item.disabled) {
    cls += ' disabled'
  }
  if (item.round) {
    cls += ' round'
  }
  return cls
}

const {
  deltaX: swipeActionItemDeltaX,
  distanceX: swipeActionItemDistanceX,
  distanceY: swipeActionItemDistanceY,
  isVertical: swipeActionItemTouchIsVertical,
  updateOptions: updateSwipeActionItemTouchOptions,
  onTouchStart: swipeActionItemTouchStartEvent,
  onTouchMove: swipeActionItemTouchMoveEvent,
  onTouchEnd: swipeActionItemTouchEndEvent,
} = useTouch()

// 当前item的菜单是否为打开状态
const isOptionsOpen = computed<boolean>(() =>
  swipeActionContext!.activeUid.includes(uid)
)

// 点击options后是否自动关闭
const autoClose = computed<boolean>(() =>
  z.isEmptyDoubleVariableInDefault(
    props?.autoClose,
    swipeActionContext?.autoClose,
    true
  )
)

// 禁止滑动
const disabledSwipe = computed<boolean>(
  () => props.disabled || !props.options?.length
)
watch(
  () => disabledSwipe.value,
  (val) => {
    updateSwipeActionItemTouchOptions({
      disabled: val,
    })
  },
  {
    immediate: true,
  }
)

// 操作菜单的长度
const optionsMenuWidth = ref(0)

// 获取当前组件节点信息
let initCount = 0
const getComponentNodeInfo = async () => {
  try {
    const componentRectInfo = await z.getDomInfo(`#${componentId}`, instance)
    let optionsRectInfo: UniApp.NodeInfo[] = []
    if (props.options?.length) {
      optionsRectInfo = await z.getDomInfos(
        `.${optionComponentClass}`,
        instance
      )
    }

    initCount = 0
    updateSwipeActionItemTouchOptions({
      left: componentRectInfo.left,
      right: componentRectInfo.right,
      top: componentRectInfo.top,
      bottom: componentRectInfo.bottom,
    })

    optionsMenuWidth.value = optionsRectInfo.reduce((prev, curr) => {
      return prev + (curr.width || 0)
    }, 0)
  } catch (err) {
    if (initCount > 10) {
      initCount = 0
      z.error(`zSwipeActionItem 获取节点信息失败: ${err}`)
      return
    }
    initCount++
    setTimeout(() => {
      getComponentNodeInfo()
    }, 150)
  }
}

// 内容距离左边移动的距离
const contentRightDistance = ref<number>(0)

// 标记是否正在滑动，正在手动滑动的时候暂停动画
const isSwipe = ref<boolean>(false)

// 内容滑动事件
const onTouchStart = (event: any) => {
  swipeActionItemTouchStartEvent(event)
}
const onTouchMove = (event: any) => {
  event.preventDefault()
  event.stopPropagation()
  swipeActionItemTouchMoveEvent(event)
  isSwipe.value = true
  // 如果垂直方向上的移动距离过大则不允许进行滑动
  if (
    swipeActionItemDistanceX.value < 3 &&
    swipeActionItemDistanceY.value > 5
  ) {
    return
  }

  // 如果当前菜单已经打开了则根据滑动的距离计算内容滑动的距离
  if (isOptionsOpen.value) {
    contentRightDistance.value =
      optionsMenuWidth.value - swipeActionItemDeltaX.value
  } else {
    contentRightDistance.value = -swipeActionItemDeltaX.value
  }
  if (contentRightDistance.value < 0) contentRightDistance.value = 0
  if (contentRightDistance.value > optionsMenuWidth.value)
    contentRightDistance.value = optionsMenuWidth.value
}
const onTouchEnd = (event: any) => {
  swipeActionItemTouchEndEvent(event)
  // 如果垂直方向上的移动距离过大则不允许进行滑动
  if (
    swipeActionItemDistanceX.value < 3 &&
    swipeActionItemDistanceY.value > 5
  ) {
    return
  }
  isSwipe.value = false
  // 如果滑动的距离大于展开阈值则显示操作菜单
  if (-swipeActionItemDeltaX.value > props.threshold) {
    openOptionsMenu()
  } else {
    closeOptionsMenu()
    updateAllItemOptionStatus()
  }

  if (swipeActionItemTouchIsVertical.value) {
    updateAllItemOptionStatus()
  }
}

// 关闭菜单
const closeOptionsMenu = () => {
  isSwipe.value = false
  updateAllItemOptionStatus()
  contentRightDistance.value = 0
}

// 更新所有item的菜单状态
const updateAllItemOptionStatus = () => {
  if (isOptionsOpen.value) {
    swipeActionContext?.setActiveItem(uid)
  } else {
    if (swipeActionContext?.exclusive) {
      swipeActionContext?.closeAllItemOption()
    }
  }
}

// 打开菜单
const openOptionsMenu = () => {
  isSwipe.value = false
  contentRightDistance.value = optionsMenuWidth.value
  swipeActionContext?.setActiveItem(uid)
}

watch(
  () => isOptionsOpen.value,
  (val) => {
    if (!val) {
      closeOptionsMenu()
    }
  }
)

// 监听菜单操作点击事件
const optionClickEvent = (index: number) => {
  const option = props.options![index]
  if (option.disabled) return
  swipeActionContext?.optionClick(uid, index)
  if (autoClose.value) {
    closeOptionsMenu()
  }
}

onMounted(() => {
  swipeActionContext?.addItem({
    uid,
  })
  nextTick(() => {
    getComponentNodeInfo()
  })
})

onUnmounted(() => {
  swipeActionContext?.removeItem(uid)
})

interface ColorInfo {
  style: string
}

interface OptionsData {
  icon: string
  text: string
  textColor: ColorInfo
  bgColor: ColorInfo
  round: boolean
  disabled: boolean
}

type OptionClassValue = (index: number) => string
type OptionStyleValue = (index: number) => CSSProperties

// 菜单配置项
const options = computed<OptionsData[]>(() => {
  return props.options.map((item) => {
    const textColor = ref(item.textColor)
    const bgColor = ref(item.bgColor)
    return {
      icon: item.icon ? item.icon : '',
      text: item.text ? item.text : '',
      textColor: {
        style: item.textColor ? item.textColor : '',
      },
      bgColor: {
        style: item.bgColor ? item.bgColor : '',
      },
      round: item.round ? item.round : false,
      disabled: item.disabled ? item.disabled : false,
    }
  })
})

// 菜单配置项颜色对应样式
const optionColorStyle = computed<OptionStyleValue>(() => {
  return (index: number) => {
    const style: CSSProperties = {}

    const option = options.value[index]

    if (option) {
      style.color = option.textColor.style || '#fff'
      style.backgroundColor =
        option.bgColor.style || zColor.getTypeColor('primary')
    }

    return style
  }
})
</script>

<template>
  <div :id="componentId" class="z-swipe-action-item pr ofh">
    <!-- 操作菜单 -->
    <div class="options pa df aic">
      <div
        v-for="(item, index) in options"
        :key="index"
        :class="[optionComponentClass, optionItemClass(item)]"
        :style="{
          right: `-${optionsMenuWidth - contentRightDistance}px`,
          transitionDuration: `${isSwipe ? 0 : 300}ms`,
        }"
        @tap.stop="optionClickEvent(index)"
      >
        <div class="option-item-content" :style="optionColorStyle(index)">
          <div v-if="item.icon" class="icon">
            <zIcon :name="item.icon"></zIcon>
          </div>
          <div v-if="item.text && !item.round" class="text">
            {{ item.text }}
          </div>
        </div>
      </div>
    </div>

    <!-- 内容 -->
    <div
      class="content pr"
      :style="{
        right: `${contentRightDistance}px`,
        transitionDuration: `${isSwipe ? 0 : 300}ms`,
      }"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <slot></slot>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-swipe-action-item {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  min-height: 75rpx;
  .options {
    top: 0;
    bottom: 0;
    height: 100%;
    right: 0;
    z-index: 1;
    transition-property: right;
    transition-timing-function: ease;
    .option-item {
      position: relative;
      height: 100%;
      .option-item-content {
        height: 100%;
        position: relative;
        display: flex;
        align-items: center;
        padding: 0rpx 24rpx;

        .text {
          margin-left: 8rpx;
        }
      }
    }
    .disabled {
      opacity: 0.4;
    }
    .round {
      width: 90rpx;
      height: 90rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      .option-item-content {
        width: 70rpx;
        height: 70rpx;
        padding: 0rpx;
        justify-content: center;
        border-radius: 50%;
      }
    }
  }
  .content {
    width: 100%;
    background-color: #fff;
    z-index: 1;
    transition-property: right;
    transition-timing-function: ease;
  }
}
</style>
