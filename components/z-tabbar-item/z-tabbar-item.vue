<!--
 * @Description: z-tabbar-item 自定义底部导航组件的子组件
 * @Author: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
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
  watch,
  nextTick,
  inject,
  CSSProperties,
} from 'vue'
import z from '../../libs/z'
import { propsHook, PropsTypeHook, openPage } from '../../libs/zHooks'

import zBadge from '../../components/z-badge/z-badge.vue'
import zIcon from '../../components/z-icon/z-icon.vue'
import { tabbarContextKey } from '../../components/z-tabbar/z-tabbar'
import zColor from '../../libs/zColor'
/**
 * @description: z-tabbar-item 自定义底部导航组件的子组件传参
 * @param: name z-tabbarde value参数
 * @param: activeIcon 选中图标
 * @param: activeIconColor 选中图标颜色
 * @param: inActiveIcon 未选中图标
 * @param: inActiveIconColor 未选中图标颜色
 * @param: badge 右上角徽标
 * @param: zIndex 元素层级z-index（默认 1 ）
 * @param: text tabbar标题
 * @param: bulge 是否突起显示按钮
 * @param: bulgeBgColor 突起按钮得背景颜色（type|string）
 * @param: bulgeTextColor 突起按钮得图标颜色（type|string）
 * @param: disabled 是否禁止点击
 * @param: fontSize tabbar标题大小
 * @param: otherStyle 其他样式
 *
 * @event: click 点击回调
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  name?: string | number
  activeIcon?: string
  activeIconColor?: string
  inActiveIcon?: string
  inActiveIconColor?: string
  badge?: number
  dot?: boolean
  text?: string
  bulge?: boolean
  bulgeBgColor?: string
  bulgeTextColor?: string
  disabled?: boolean
  iconSize?: number | string
  fontSize?: number | string
  badgeStyle?: any
}

interface EmitsType {
  (e: 'click'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  name: '',
  badge: 0,
  activeIcon: 'settings3',
  inActiveIcon: 'settings',
  inActiveIconColor: '#1a1a1a',
  activeIconColor: '#409eff',
  dot: false,
  text: '',
  bulge: false,
  bulgeBgColor: '#409eff50',
  bulgeTextColor: 'primary',
  disabled: false,
  iconSize: '28px',
  fontSize: '12px',
})

const emits = defineEmits<EmitsType>()

interface TabbarItemRect {
  width: number
  height: number
  left: number
  maxWidth?: number
}

const current = getCurrentInstance()!

const tabbarContext = inject(tabbarContextKey)

const itemRectInfo = ref<TabbarItemRect>({
  width: 0,
  height: 0,
  left: 0,
})

let initRectCount = 0

const getItemRectInfo = async () => {
  try {
    const rectInfo = await z.getDomInfo(`#z${uid}`, current)
    if (rectInfo.width && rectInfo.width < 30) {
      throw new Error('获取TabbarItem节点宽度失败')
    }
    initRectCount = 0
    itemRectInfo.value.width = rectInfo.width || 0
    itemRectInfo.value.height = rectInfo.height || 0
    itemRectInfo.value.left = rectInfo.left || 0

    if (itemRectInfo.value.width > 80) {
      itemRectInfo.value.maxWidth = 80
    }
    tabbarContext?.setBulgeCircle(itemRectInfo.value)
  } catch (err) {
    if (initRectCount > 10) {
      initRectCount = 0
      z.error(`zTabbarItem,获取TabbarItem节点信息失败: ${err}`)
      return
    }
    initRectCount++
    setTimeout(() => {
      getItemRectInfo()
    }, 150)
  }
}

onMounted(() => {
  nextTick(() => {
    if (props.bulge) getItemRectInfo()
  })
})

const uid = current.uid

const isActive = computed<boolean>(() => {
  return tabbarContext?.activeUid === uid
})

tabbarContext?.addItem({
  uid: current?.uid,
  name: props.name,
})

const tabbarItemStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {
    padding: '0px',
    textAlign: 'center',
    height: '100%',
  }
  /**
   * 设置样式
   */
  if (isActive.value) {
    style.color = zColor.getTypeColor(props.activeIconColor)
  } else {
    style.color = zColor.getTypeColor(props.inActiveIconColor)
  }

  // 判断是否只有图标或者文字
  if (
    (props.inActiveIcon && props.activeIcon && !props.text) ||
    (props.text && !props.inActiveIcon && !props.activeIcon)
  )
    style.justifyContent = 'center'

  //控制动画显示与隐藏
  if (tabbarContext?.switchAnimation) {
    if (isActive.value) {
      style.animation = 'tabbarItemAnimation 0.3s ease'
    } else {
      style.animation = ''
    }
  }

  return style
})

function clickTabbarItem() {
  if (isActive.value || props.disabled) return
  tabbarContext?.setActiveItem(uid)
  emits('click')
}

type TabbarItemBulgeElementStyleValue = (
  rectInfo: TabbarItemRect
) => CSSProperties

// 凸起按钮对应的样式
const bulgeStyle = computed<TabbarItemBulgeElementStyleValue>(() => {
  return (rectInfo: TabbarItemRect) => {
    const style: CSSProperties = {}

    // 设置容器信息
    let width = rectInfo.width
    if (rectInfo?.maxWidth) {
      width = rectInfo.maxWidth
    }
    style.width = `${width * 0.6}px`
    style.height = style.width
    style.top = `-${width * 0.3}px`

    // 设置背景
    if (props.bulgeBgColor) {
      style.backgroundColor = zColor.getTypeColor(props.bulgeBgColor)
    } else {
      if (isActive.value) {
        style.color = zColor.getTypeColor(props.activeIconColor)
      } else {
        style.color = zColor.getTypeColor(props.inActiveIconColor)
      }
    }

    // 设置文字颜色
    style.color = zColor.getTypeColor(props.bulgeTextColor)

    return style
  }
})

const zTabbarItemTextStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}
  style.fontSize = z.addUnit(props.fontSize)
  if (props.bulge) {
  }
  return style
})
</script>

<template>
  <div
    class="f1 dfc jcfe"
    :id="'z' + uid.toString()"
    :style="tabbarItemStyle"
    @tap.stop="clickTabbarItem"
  >
    <slot>
      <!-- 图标 -->
      <template v-if="props.bulge">
        <div class="z-tabbar-item-bulge" :style="bulgeStyle(itemRectInfo)">
          <zIcon
            :name="isActive ? props.activeIcon : props.inActiveIcon"
            :size="props.iconSize"
          ></zIcon>
        </div>
      </template>
      <template v-else>
        <div
          v-if="props.activeIcon && props.inActiveIcon"
          class="z-tabbar-item-icon"
        >
          <zIcon
            :name="isActive ? props.activeIcon : props.inActiveIcon"
            :size="props.iconSize"
          ></zIcon>
          <!-- 角标 -->
          <zBadge
            absolute
            :position="[
              0,
              props.dot ? '34rpx' : props.badge > 9 ? '14rpx' : '20rpx',
            ]"
            :otherStyle="props.badgeStyle"
            :dot="props.dot"
            :value="props.badge || (props.dot ? 1 : 0)"
            :show="props.dot || props.badge > 0"
          ></zBadge>
        </div>
      </template>
      <!-- 文字 -->
      <div
        v-if="props.text"
        class="z-tabbar-item-text"
        :style="zTabbarItemTextStyle"
      >
        {{ props.text }}
      </div>
    </slot>
  </div>
</template>

<style lang="less" scoped>
.z-tabbar-item-bulge {
  position: absolute;
  left: 50%;
  border-radius: 50%;
  color: #fff;
  font-size: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  transform: translateX(-50%);
}
.z-tabbar-item-icon {
  position: relative;
  font-size: 40rpx;
  line-height: 1;
  margin: 4rpx 0rpx;
  transition: all 0.3s ease;
  transform-origin: center center;
}
.z-tabbar-item-text {
  font-size: 22rpx;
  margin: 2rpx 0rpx 6rpx 0rpx;
  transition: all 0.3s ease;
  transform-origin: center center;
}
</style>
