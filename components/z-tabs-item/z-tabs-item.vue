<!--
 * @Description: z-tabs-item 标签栏子组件
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
  computed,
  onBeforeUnmount,
  watch,
  nextTick,
  CSSProperties,
  onUnmounted,
  inject,
} from 'vue'
import z from '../../libs/z'
import zColor from '../../libs/zColor'
import zBadge from '../../components/z-badge/z-badge.vue'
import zType from '../../libs/zType'
import {
  ztabsContextKey,
  zTabsItemContext,
  zTabsItemRect,
} from '../../components/z-tabs/z-tabs'

import { propsHook, PropsTypeHook } from '../../libs/zHooks'
/**
 * @description: z-gap 间隔传参
 * @param: color 默认颜色
 * @param: activeColor	选中颜色
 * @param: fontSize	字体大小
 * @param: activeFontSize  选中字体大小
 * @param: name  唯一标识
 * @param: title  标题
 * @param: badgeConfig  角标配置,参考z-badge
 * @param: disabled  是否禁用
 * @param: otherStyle 其他的样式
 *
 * @event: click
 * @tutorial: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * @example:
 */

interface BadgeProps {
  value: number | string
  fontSize?: number | string
  show?: boolean
  showZero?: boolean
  dot?: boolean
  dotSize?: number
  rightAngle?: boolean
  bgColor?: string
  color?: string
  maxNum?: number | string
  type?: string
  reversal?: boolean
  absolute?: boolean
  position?: [number | string, number | string]
  otherStyle?: object
}

type zTabsItemBadgeConfig = Partial<Pick<BadgeProps, 'dot'>> & {
  value?: string | number
  fontSize?: number | string
  show?: boolean
  showZero?: boolean
  dot?: boolean
  dotSize?: number
  rightAngle?: boolean
  bgColor?: string
  color?: string
  maxNum?: number | string
  type?: string
  reversal?: boolean
  absolute?: boolean
  position?: [number | string, number | string]
  otherStyle?: object
}

interface PropsType extends PropsTypeHook {
  color?: string
  activeColor?: string
  fontSize?: string
  activeFontSize?: string
  name?: string | number
  title: string
  badgeConfig?: zTabsItemBadgeConfig
  disabled?: boolean
}

interface EmitsType {
  (e: 'click'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  badgeConfig: () => ({}),
})

const emits = defineEmits<EmitsType>()

const instance = getCurrentInstance()
if (!instance) {
  z.error('zTabsItem 请在 setup 中使用 useTabsItem')
}

const { emit, uid } = instance!

const componentId = `z-tabs-item-${instance?.uid}`

const tabsContext = inject(ztabsContextKey)

// 当前节点是否被激活
const isActive = computed<boolean>(() => tabsContext?.activeUid === uid)

// 判断是否有角标
const hasBadge = computed<boolean>(() => !zType.isEmpty(props.badgeConfig))

// tabsItem节点信息
const tabsItemRect: zTabsItemRect = {
  width: 0,
  height: 0,
  left: 0,
}

let initCount = 0
// 初始化、获取节点信息
const initTabsItemRectInfo = async () => {
  try {
    const rectInfo = await z.getDomInfo(`#${componentId}`, instance)

    tabsItemRect.width = rectInfo.width || 0
    tabsItemRect.height = rectInfo.height || 0
    tabsItemRect.left = rectInfo.left || 0

    // 添加item
    // #ifndef APP-PLUS || MP-ALIPAY
    tabsContext?.addItem({
      uid,
      elementRect: tabsItemRect,
      name: props.name,
    })
    // #endif
    // #ifdef APP-PLUS || MP-ALIPAY
    setTimeout(() => {
      tabsContext?.addItem({
        uid,
        elementRect: tabsItemRect,
        name: props.name,
      })
    }, 250)
    // #endif
  } catch (err) {
    if (initCount > 10) {
      initCount = 0
      z.error(`zTabsItem 获取tabsItem节点信息失败: ${err}`)
      return
    }
    initCount++
    setTimeout(() => {
      initTabsItemRectInfo()
    }, 150)
  }
}

// item点击事件
const itemClickEvent = () => {
  if (props.disabled) return
  emit('click')
  tabsContext?.setActiveItem(uid)
}

onMounted(() => {
  nextTick(() => {
    // 初始化节点
    setTimeout(() => {
      initTabsItemRectInfo()
    }, 200)
  })
})

onUnmounted(() => {
  // 移除item
  tabsContext?.removeItem(uid)
})

const normalColor = computed<string | undefined>(
  () => props.color || tabsContext?.color
)
const activeColor = computed<string | undefined>(
  () => props.activeColor || tabsContext?.activeColor
)
const activeBold = computed<boolean>(() =>
  z.isEmptyVariableInDefault(tabsContext?.activeBold, true)
)
const activeFontSize = computed<string | undefined>(
  () => props.activeFontSize || tabsContext?.activeFontSize
)

// tabsItem对应的类
const tabsItemClass = computed<string>(() => {
  const cls: string[] = ['z-tabs-item']

  // 设置颜色
  if (isActive.value) {
    if (activeBold.value) {
      cls.push('bold')
    }
  } else {
  }

  // 设置可以滚动
  if (tabsContext?.scroll) cls.push('scroll')

  // 是否有设置滑块
  if (!tabsContext?.showBar) cls.push('no-bar')

  return cls.join(' ')
})
// tabsItem样式
const tabsItemStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  // 设置字体大小
  if (props.fontSize || tabsContext?.fontSize) {
    style.fontSize = z.addUnit(props.fontSize || tabsContext?.fontSize || '')
  }

  // 设置颜色
  if (isActive.value) {
    if (activeColor.value) {
      style.color = activeColor.value || zColor.getTypeColor('primary')
    }
    if (activeFontSize.value) {
      style.fontSize = z.addUnit(activeFontSize.value)
    }
  } else {
    if (normalColor.value) {
      style.color = normalColor.value || zColor.getTypeColor('primary')
    }
  }

  return style
})
</script>

<template>
  <div
    :id="componentId"
    class="f1 pr fwn"
    :class="[tabsItemClass]"
    :style="tabsItemStyle"
    @tap.stop="itemClickEvent"
  >
    <slot>
      <div class="content pr df aic jcc">
        <div class="pr">
          <!-- 角标 -->
          <zBadge
            :show="hasBadge"
            :value="badgeConfig.value ? badgeConfig.value : 0"
            :dot="badgeConfig.dot"
            :dotSize="badgeConfig.dotSize ? badgeConfig.dotSize : 16"
            :type="badgeConfig.type"
            :absolute="badgeConfig.absolute"
            :position="badgeConfig.position"
            :fontSize="badgeConfig.fontSize"
            :showZero="badgeConfig.showZero"
            :rightAngle="badgeConfig.rightAngle"
            :bgColor="badgeConfig.bgColor"
            :color="badgeConfig.color"
            :maxNum="badgeConfig.maxNum"
            :reversal="badgeConfig.reversal"
            :otherStyle="badgeConfig.otherStyle"
            @click="itemClickEvent"
          ></zBadge>
          {{ title }}
        </div>
      </div>
    </slot>
  </div>
</template>

<style lang="less" scoped>
.z-tabs-item {
  height: 100%;

  transition-property: color, font-size;
  transition-duration: 0.3s;
  transition-timing-function: linear;
  .content {
    width: 100%;
    height: 100%;
  }
}
.bold {
  font-weight: 800;
}
.scroll {
  flex: auto;
  flex-grow: 1;
  flex-shrink: 0;
  padding: 0rpx 30rpx;
}
.no-bar {
  .content {
    align-items: flex-end;
  }
}
</style>
