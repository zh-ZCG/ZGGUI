<!--
 * @Description: z-tabs 标签栏组件
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
  provide,
  toRefs,
  reactive,
  useSlots,
  shallowRef,
} from 'vue'
import {
  ztabsContextKey,
  zTabsItemContext,
  zTabsItemRect,
} from '../../components/z-tabs/z-tabs'
import zType from '../../libs/zType'
import z from '../../libs/z'
import zColor from '../../libs/zColor'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
/**
 * @description: z-tabs 标签栏组件传参
 * @param: color 默认颜色
 * @param: activeColor	选中颜色
 * @param: fontSize	字体大小
 * @param: activeFontSize  选中字体大小
 * @param: modelValue  tabs绑定的值，与tabsItem name属性对应值，如果tabsItem没有设置name，则默认为索引值
 * @param: height  tabs高度
 * @param: barWidth  滑块的宽度
 * @param: bgColor 背景颜色
 * @param: barColor  bar滑块颜色
 * @param: bottomShadow  显示底部阴影
 * @param: scroll  是否可以滚动
 * @param: bar  是否显示滑块
 * @param: activeBold  选中后的字体是否加粗
 * @param: offsetTop  距离顶部的距离，默认单位 px
 * @param: beforeSwitch  切换前回调
 * @param: otherStyle 其他的样式
 *
 * @event: update:modelValue
 * @event: change
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */
type TabsSwitchBeforeFunc = (index: number) => Promise<boolean> | boolean

interface PropsType extends PropsTypeHook {
  color?: string
  activeColor?: string
  fontSize?: string
  activeFontSize?: string
  modelValue?: string | number
  height?: string
  barWidth?: string
  bgColor?: string
  barColor?: string
  bottomShadow?: boolean
  scroll?: boolean
  bar?: boolean
  activeBold?: boolean
  offsetTop?: number
  beforeSwitch?: TabsSwitchBeforeFunc
}

interface EmitsType {
  (e: 'update:modelValue'): void
  (e: 'change'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  modelValue: 0,
  height: '80rpx',
  barWidth: '40rpx',
  bottomShadow: true,
  scroll: true,
  bar: true,
  activeBold: true,
  offsetTop: 0,
})

const emits = defineEmits<EmitsType>()

const instance = getCurrentInstance()

if (!instance) {
  z.error('z-tabs 请在 setup 函数中使用 useTabs ')
}
const slots = useSlots()

const useOrderedChildren = <T extends { uid: number }>() => {
  const children: Record<number, T> = {}
  const orderedChildren = shallowRef<T[]>([])

  const addChild = (child: T) => {
    children[child.uid] = child
    orderedChildren.value.push(child)
  }
  const removeChild = (uid: number) => {
    delete children[uid]
    orderedChildren.value = orderedChildren.value.filter(
      (child) => child.uid !== uid
    )
  }

  return {
    children: orderedChildren,
    addChild,
    removeChild,
  }
}

const {
  children: items,
  addChild,
  removeChild: removeItem,
} = useOrderedChildren<zTabsItemContext>()

const componentId = `z-tabs-${instance?.uid}`
const barComponentId = `${componentId}-bar`

// 是否需要显示bar滑块
const showBar = computed<boolean>(() => props.bar || !!slots.bar)

// 当前被激活的ItemUid
const activeUid = ref<number>(-1)

// 添加tabsItem到items容器中
const addItem = (item: zTabsItemContext) => {
  if (props.modelValue !== undefined && activeUid.value === -1) {
    if (
      props.modelValue === item.name ||
      props.modelValue === items.value.length
    ) {
      nextTick(() => {
        updateActiveUid(item.uid)
      })
    }
  }
  addChild(item)
}

// tabs容器节点信息
const tabsRect: zTabsItemRect = {
  width: 0,
  height: 0,
  left: 0,
}

// bar滑块的容器节点信息
const barRect: zTabsItemRect = {
  width: 0,
  height: 0,
  left: 0,
}
// 滑块滑动的距离
const barOffsetLeft = ref<number>(0)
// scrollView的滚动距离
const scrollLeft = ref<number>(0)

// 更新偏移位置信息
const updateOffsetPosition = (index: number) => {
  if (!props.scroll && !props.bar && !slots.bar) return

  // 获取当前Item
  const item = items.value[index].elementRect

  if (props.bar || slots.bar) {
    // 更新滑块的偏移位置
    barOffsetLeft.value =
      item.left - tabsRect.left + (item.width - barRect.width) / 2
  }
  if (props.scroll) {
    // 更新scrollView的偏移位置
    const scrollLeftValue =
      item.left - tabsRect.left - (tabsRect.width - item.width) / 2
    scrollLeft.value = scrollLeftValue < 0 ? 0 : scrollLeftValue
  }
}

// 更新当前激活的ItemUid
const updateActiveUid = (uid: number, changeEmit = false) => {
  activeUid.value = uid
  const itemIndex = items.value.findIndex((item) => item.uid === uid)
  const value = items.value[itemIndex].name
    ? items.value[itemIndex].name
    : itemIndex

  updateOffsetPosition(itemIndex)

  emits('update:modelValue')
  if (changeEmit) {
    emits('change')
  }
}

// 设置当前被点击Item
const setActiveItem = (uid: number) => {
  if (!props.beforeSwitch) {
    updateActiveUid(uid, true)
    return
  }

  const itemIndex = items.value.findIndex((item) => item.uid === uid)
  const shouldSwitch = props.beforeSwitch(itemIndex)
  const isPromiseOrBoolean = [
    zType.isPromise(shouldSwitch),
    zType.isBoolean(shouldSwitch),
  ].includes(true)

  if (!isPromiseOrBoolean) {
    z.error('z-tabs beforeSwitch返回值必须是Promise或者Boolean')
    return
  }

  if (zType.isPromise(shouldSwitch)) {
    shouldSwitch
      .then((res) => {
        if (res) {
          updateActiveUid(uid, true)
        }
      })
      .catch((err) => {
        z.error(`z-tabs 执行beforeSwitch出错：${err}`)
      })
  } else {
    if (shouldSwitch) {
      updateActiveUid(uid, true)
    }
  }
}

// 通过索引更新当前激活的ActiveItem
const updateActiveItemByValue = (value?: string | number) => {
  if (value === undefined) {
    // 如果没有传递任何值则设置第一个Item为激活状态
    updateActiveUid(items.value[0].uid)
    return
  }
  let item: zTabsItemContext | undefined
  // 如果类型是number，则先通过索引进行查找
  if (typeof value === 'number') {
    item = items.value?.[value]
  }
  // 如果没有找到，则通过name查找
  if (!item) {
    item = items.value.find((item) => item.name === value)
  }
  if (!item) {
    // 设置第一个Item为激活状态
    updateActiveUid(items.value[0].uid)
  } else {
    updateActiveUid(item.uid)
  }
}

watch(
  () => props.modelValue,
  (val) => {
    updateActiveItemByValue(val)
  }
)

let initCount = 0
// 获取Tabs容器节点信息
const getTabsRectInfo = async () => {
  try {
    const rectInfo = await z.getDomInfo(`#${componentId}`, instance)

    initCount = 0
    tabsRect.width = rectInfo.width || 0
    tabsRect.height = rectInfo.height || 0
    tabsRect.left = rectInfo.left || 0
  } catch (err) {
    if (initCount > 10) {
      initCount = 0
      z.error(`z-tabs 获取Tabs容器节点信息出错: ${err}`)
      return
    }
    initCount++
    setTimeout(() => {
      getTabsRectInfo()
    }, 150)
  }
}
// 获取Bar滑块的容器节点信息
const getBarRectInfo = async () => {
  if (!props.bar && !slots.bar) return

  try {
    const rectInfo = await z.getDomInfo(`#${barComponentId}`, instance)

    initCount = 0
    barRect.width = rectInfo.width || 0
    barRect.height = rectInfo.height || 0
    barRect.left = rectInfo.left || 0
  } catch (err) {
    if (initCount > 10) {
      initCount = 0
      z.error(`z-tabs 获取Bar滑块节点信息出错: ${err}`)
      return
    }
    initCount++
    setTimeout(() => {
      getBarRectInfo()
    }, 150)
  }
}

onMounted(() => {
  nextTick(() => {
    // #ifndef MP-ALIPAY
    getTabsRectInfo()
    // #endif
    // #ifdef MP-ALIPAY
    setTimeout(() => {
      getTabsRectInfo()
    }, 50)
    // #endif
    getBarRectInfo()
  })
})

provide(
  ztabsContextKey,
  reactive({
    ...toRefs(props),

    items,
    activeUid,
    showBar,
    addItem,
    removeItem,
    setActiveItem,
  })
)

// tabs的样式
const tabsStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  // 设置底部阴影
  if (props.bottomShadow) {
    style.boxShadow = '0rpx 5rpx 16rpx 0rpx rgba(0, 0, 0, 0.05)'
  }

  // 设置背景颜色
  if (props.bgColor) {
    style.backgroundColor = props.bgColor || '#fff'
  }

  // 设置高度
  if (props.height) {
    style.height = z.addUnit(props.height)
    if (props.offsetTop) {
      style.height = `calc(${style.height} + ${props.offsetTop}px)`
    }
  }

  return style
})

// bar的样式
const barStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  // 设置滑块颜色
  style.backgroundColor = props.barColor || zColor.getTypeColor('primary')

  // 设置滑块的宽度
  if (props.barWidth) style.width = z.addUnit(props.barWidth)

  return style
})
</script>

<template>
  <div :id="componentId" class="pr z-tabs" :style="tabsStyle">
    <!-- 距离顶部的距离占位 -->
    <div v-if="offsetTop" :style="{ height: `${offsetTop}px` }"></div>
    <!-- 内容区域 -->
    <scroll-view
      class="scroll pr"
      :style="{
        height: z.addUnit(height || '100%'),
      }"
      :scroll-x="scroll"
      scroll-with-animation
      :scroll-left="scrollLeft"
    >
      <div
        class="container pr df aife ofh"
        :class="scroll ? 'container-scroll' : ''"
      >
        <slot></slot>
        <!-- 滑块 -->
        <div
          v-if="props.bar || $slots.bar"
          :id="barComponentId"
          class="bar-container pa"
          :style="{
            left: `${barOffsetLeft}px`,
            opacity: `${barOffsetLeft && items.length ? 1 : 0}`,
          }"
        >
          <slot name="bar">
            <div class="pr bar" :style="barStyle"></div>
          </slot>
        </div>
      </div>
    </scroll-view>
  </div>
</template>

<style lang="less" scoped>
.z-tabs {
  width: 100%;
  .scroll {
    width: 100%;
    height: 100%;
    .container {
      width: 100%;
      max-width: 100%;
      height: 100%;
      .bar-container {
        left: 0;
        bottom: 0;

        transition-property: left, opacity;
        transition-duration: 0.3s;
        transition-timing-function: ease;
        .bar {
          height: 10rpx;
          border-radius: 3000rpx;
        }
      }
    }
  }
  .container-scroll {
    width: max-content;
    max-width: none;
    overflow: unset;
  }
}
</style>
