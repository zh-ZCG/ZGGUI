<!--
 * @Description: z-tabbar 自定义底部导航组件
 * @Author: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import {
  ref,
  onMounted,
  getCurrentInstance,
  computed,
  watch,
  nextTick,
  provide,
  shallowRef,
  ExtractPropTypes,
  reactive,
  toRefs,
  CSSProperties,
} from 'vue'
import z from '../../libs/z'
import zType from '../../libs/zType'
import zColor from '../../libs/zColor'
import zIphoneBottom from '../../components/z-iphone-bottom/z-iphone-bottom.vue'
import { propsHook, PropsTypeHook, openPage } from '../../libs/zHooks'
import { useOrderedChildren } from '../../libs/Hooks/z-use-order-children'
import {
  TabbarContext,
  tabbarContextKey,
} from '../../components/z-tabbar/z-tabbar'

/**
 * @description: z-tabbar 自定义底部导航组件传参
 * @param: modelValue 当前匹配项的name
 * @param: safeAreaInsetBottom 是否为iPhoneX留出底部安全距离（默认 true ）
 * @param: border 是否显示上方边框（默认 false ）
 * @param: topShadow 是否显示上方阴影（默认 true ）
 * @param: height 导航栏高度(单位默认px)
 * @param: zIndex 元素层级z-index（默认 1 ）
 * @param: bgColor 背景颜色(可选主色,或者传入颜色)
 * @param: switchAnimation 是否切换时显示动画
 * @param: frosted 背景毛玻璃效果(默认false，支付宝小程序无效)
 * @param: activeColor 选中标签的颜色（默认 '#409eff' ）
 * @param: inactiveColor 未选中标签的颜色（默认 '#1a1a1a' ）
 * @param: beforeSwitch 切换前回调
 * @param: fixed 是否固定在底部（默认 true ）
 * @param: placeholder fixed定位固定在底部时，是否生成一个等高元素防止塌陷（默认 true ）
 * @param: otherStyle lable的样式
 *
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */

type TabbarSwitchBeforeSwitchFunc = (
  index: number
) => Promise<boolean> | boolean

interface PropsType extends PropsTypeHook {
  modelValue?: string | number
  safeAreaInsetBottom?: boolean
  border?: boolean
  topShadow?: boolean
  height?: string | number
  zIndex?: number
  bgColor?: string
  switchAnimation?: boolean
  frosted?: boolean
  activeColor?: string
  inactiveColor?: string
  beforeSwitch?: TabbarSwitchBeforeSwitchFunc
  fixed?: boolean
  placeholder?: boolean
}

interface EmitsType {
  (e: 'update:modelValue', data: string | number): void
  (e: 'change', data: string | number): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  modelValue: '',
  safeAreaInsetBottom: true,
  border: false,
  topShadow: true,
  height: '100rpx',
  zIndex: 999,
  bgColor: '#fff',
  switchAnimation: false,
  frosted: false,
  activeColor: '#409eff',
  inactiveColor: '#1a1a1a',
  fixed: true,
  placeholder: true,
})

const emits = defineEmits<EmitsType>()

const current = getCurrentInstance()!

watch(
  () => props.modelValue,
  (val) => {
    nextTick(() => {
      setActiveItemByValue(val)
    })
  }
)

onMounted(() => {
  setPlaceholderHeight()
})

const placeholderHeight = ref(0)

const tabbarStyle = computed(() => {
  let style = {
    zIndex: props.zIndex,
  } as any
  if (props.zIndex) style.zIndex = props.zIndex
  if (props.height) style.height = z.addUnit(props.height)
  if (props.border) {
    style.borderTopWidth = '0.5px'
    style.borderColor = '#eeeeee'
    style.borderTopStyle = 'solid'
  }
  if (props.topShadow)
    style.boxShadow = '0rpx 0rpx 30rpx 0rpx rgba(0, 0, 0, 0.07)'
  if (props.fixed) {
    style.position = 'fixed'
    style.bottom = '0'
    style.left = '0'
    style.right = '0'
  } else {
    style.position = 'relative'
  }
  return z.deepMerge(style, props.otherStyle)
})

const updatePlaceholder = computed(() => {
  return [props.fixed, props.placeholder]
})

watch(updatePlaceholder, (newVal) => {
  setPlaceholderHeight()
})

// 设置用于防止塌陷元素的高度
async function setPlaceholderHeight() {
  if (!props.fixed || !props.placeholder) return
  // 延时一定时间
  await z.sleep(20)
  // #ifndef APP-NVUE
  z.getDomInfo('#z-tabbar-content', current as any).then((res: any) => {
    // 修复IOS safearea bottom 未填充高度
    placeholderHeight.value = res.height ? res.height : 50
  })
  // #endif

  // #ifdef APP-NVUE
  z.getDomInfoNvue('#z-tabbar-content').then((res: any) => {
    // 修复IOS safearea bottom 未填充高度
    placeholderHeight.value = res.height ? res.height : 50
  })
  // #endif
}

// 添加Item
function addItem(item: TabbarItemContext) {
  if (props.modelValue !== undefined && activeUid.value === -1) {
    if (
      props.modelValue === item.name ||
      props.modelValue === items.value.length
    ) {
      nextTick(() => {
        updateActiveId(item.uid)
        setTimeout(() => {
          if (activeUid.value !== -1) return
          activeUid.value = item.uid
        }, 50)
      })
    }
  }
  addChild(item)
}

const {
  children: items,
  addChild,
  removeChild: removeItem,
} = useOrderedChildren<TabbarItemContext>()

const activeUid = ref<number>(-1)

// 更新当前激活的Uid
const updateActiveId = (uid: number, changeEmit = false) => {
  activeUid.value = uid
  const itemIndex = items.value.findIndex((item) => item.uid === uid)

  const value = items.value[itemIndex]?.name || itemIndex

  emits('update:modelValue', value)
  if (changeEmit) {
    nextTick(() => {
      emits('change', value)
    })
  }
}
// 设置当前被点击Item
const setActiveItem = (uid: number) => {
  // 是否有切换拦截
  if (!props.beforeSwitch) {
    updateActiveId(uid, true)
    return
  }

  const index = items.value.findIndex((item) => item.uid === uid)
  const shouldSwitch = props.beforeSwitch(index)
  const isPromiseOrBoolean = [
    zType.isPromise(shouldSwitch),
    zType.isBoolean(shouldSwitch),
  ].includes(true)

  if (!isPromiseOrBoolean) {
    z.error('zTabbar beforeSwitch切换前拦截函数必须返回Promise或者Boolean')
    return
  }

  if (zType.isPromise(shouldSwitch)) {
    shouldSwitch.then((res) => {
      if (res) updateActiveId(uid, true)
    })
  } else {
    if (shouldSwitch) updateActiveId(uid, true)
  }
}

// 根据modelValue设置当前激活的Item
const setActiveItemByValue = (value?: string | number) => {
  if (value === undefined) {
    // 如果没有传递任何值则设置第一个Item为激活状态
    updateActiveId(items.value[0].uid)
    return
  }
  let item: TabbarItemContext | undefined
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
    updateActiveId(items.value[0].uid)
  } else {
    updateActiveId(item.uid)
  }
}

defineExpose({
  setActiveItem: setActiveItemByValue,
})

interface TabbarItemContext {
  uid: number
  name?: string | number
}

interface TabbarItemRect {
  width: number
  height: number
  left: number
  maxWidth?: number
}

const bulgeRectInfo = ref<TabbarItemRect>({
  width: 0,
  height: 0,
  left: 0,
})

// 是否设置凸起按钮
const hasBulgeButton = ref<boolean>(false)
// 设置凸起按钮的位置
const setBulgeCircle = async (itemRectInfo: TabbarItemRect) => {
  const { left } = itemRectInfo
  try {
    const rectInfo = await z.getDomInfo(`#z-tabbar-content`, current as any)

    const { left: tabbarRectLeft } = rectInfo
    let width = itemRectInfo.width
    if (itemRectInfo?.maxWidth) {
      width = itemRectInfo.maxWidth
    }
    bulgeRectInfo.value.width = width * 0.75
    bulgeRectInfo.value.height = bulgeRectInfo.value.width
    bulgeRectInfo.value.left =
      left - (tabbarRectLeft || 0) + itemRectInfo.width / 2

    hasBulgeButton.value = true
  } catch (err) {
    z.error(`z-tabbar,获取Tabbar节点信息失败: ${err}`)
  }
}

/**
 * 突出按钮样式
 */
const zTabbarContentBulge = computed<CSSProperties>(() => {
  const style: CSSProperties = {
    width: `${bulgeRectInfo.value.width}px`,
    height: `${bulgeRectInfo.value.height}px`,
    left: `${bulgeRectInfo.value.left}px`,
    top: `-${bulgeRectInfo.value.height * 0.5}px`,
  }

  if (props.zIndex) style.zIndex = props.zIndex - 1
  else style.zIndex = 'inherit'
  // 设置背景颜色
  style.backgroundColor = '#fff'
  // #ifndef MP-ALIPAY
  if (props.frosted)
    style.backgroundColor =
      zColor.getTypeColor(props.bgColor) || 'rgba(255, 255, 255, 0.5)'
  // #endif
  return style
})

/**
 * 占位容器样式
 */
const zTabbarPlaceholderStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {
    position: 'relative',
    left: 0,
    top: 0,
    backgroundColor: 'transparent',
  }

  if (props.zIndex) style.zIndex = props.zIndex - 2

  if (hasBulgeButton.value) {
    style.height = `calc(${z.addUnit(props.height)} + ${
      bulgeRectInfo.value.height / 2
    }px)`
  } else style.height = z.addUnit(props.height)
  return style
})

const zTabbarContentDetailStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}
  // 设置zIndex
  if (props.zIndex) style.zIndex = props.zIndex - 1

  // 设置背景颜色
  style.backgroundColor = '#fff'
  // #ifndef MP-ALIPAY
  if (props.frosted)
    style.backgroundColor =
      zColor.getTypeColor(props.bgColor) || 'rgba(255, 255, 255, 0.5)'
  // #endif

  return style
})

provide(
  tabbarContextKey,
  reactive({
    ...toRefs(props),
    items,
    activeUid,
    addItem,
    removeItem,
    setActiveItem,
    setBulgeCircle,
  })
)
</script>

<template>
  <div
    class="dfc z-tabbar-content"
    ref="z-tabbar-content"
    id="z-tabbar-content"
    :class="props.frosted ? 'frosted' : ''"
    @tap.stop="1"
    :style="[tabbarStyle]"
  >
    <div
      v-if="hasBulgeButton"
      class="z-tabbar-content-bulge"
      :style="zTabbarContentBulge"
    ></div>
    <div :style="zTabbarContentDetailStyle"></div>
    <div class="pa dfr jcsa aic fwnw z-tabbar-content-detail">
      <slot></slot>
    </div>
  </div>
  <div
    v-if="props.fixed && props.placeholder"
    :style="zTabbarPlaceholderStyle"
  ></div>
  <zIphoneBottom v-if="props.safeAreaInsetBottom"></zIphoneBottom>
</template>

<style lang="less" scoped>
.z-tabbar-content-bulge {
  position: absolute;
  left: 50%;
  border-radius: 50%;
  color: #fff;
  font-size: 40rpx;

  display: flex;
  align-items: center;
  justify-content: center;

  transition: all 0.3s ease;

  transform: translateX(-50%);
}
.z-tabbar-content-detail {
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: inherit;
}
.frosted {
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
}
</style>
