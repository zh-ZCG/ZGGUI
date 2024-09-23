<!--
 * @Description: z-notice-bar 通知栏组件
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
  reactive,
  toRefs,
  InjectionKey,
} from 'vue'
import z from '../../libs/z'
import zIcon from '../../components/z-icon/z-icon.vue'
import { noticeBarKey } from '../../components/z-notice-bar/index'
import zColumnNoticeBar from '../../components/z-column-notice-bar/z-column-notice-bar.vue'
import zRowNoticeBar from '../../components/z-row-notice-bar/z-row-notice-bar.vue'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
/**
 * @description: z-notice-bar 通知栏组件传参
 * @param: show 是否显示通知栏
 * @param: data	通知栏显示的数据
 * @param: bgColor	背景颜色
 * @param: textColor  文字颜色
 * @param: fontSize  字体大小
 * @param: leftIcon  通知栏左边显示的图标
 * @param: leftIconColor   左图标颜色
 * @param: leftIconSize   左图标大小
 * @param: rightIcon   通知栏右边显示的图标
 * @param: rightIconColor   右图标颜色
 * @param: rightIconSize   右图标大小
 * @param: pause   通知暂停播放
 * @param: autoPlay   自动播放
 * @param: direction   滚动方向
 * @param: loop   是否采用衔接滚动，在 direction 为 horizontal 时有效
 * @param: speed   滚动速度，在 direction 为 horizontal 以及 loop 为 true 时表示 每秒滚动的像素数，在 direction 为 vertical 或者 direction 为 horizontal 且 loop 为 false 时表示 切换的时间间隔单位ms
 * @param: autoHide   在data为空时是否自动隐藏123
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */

type noticeBarScrollDirection = 'horizontal' | 'vertical'

interface PropsType extends PropsTypeHook {
  show?: boolean
  data?: Array<string>
  bgColor?: string
  textColor?: string
  fontSize?: string | number
  leftIcon?: string
  leftIconColor?: string
  leftIconSize?: string | number
  rightIcon?: string
  rightIconColor?: string
  rightIconSize?: string | number
  pause?: boolean
  autoPlay?: boolean
  direction?: noticeBarScrollDirection
  loop?: boolean
  speed?: number
  autoHide?: boolean
}

interface EmitsType {
  (e: 'click', index: number): void
  (e: 'left-icon-click'): void
  (e: 'right-icon-click'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  show: true,
  data: () => [],
  autoPlay: true,
  direction: 'horizontal',
  loop: true,
  autoHide: true,
})

const emits = defineEmits<EmitsType>()

type NoticeBarCommonColorStyle = (
  type: 'normal' | 'leftIcon' | 'rightIcon'
) => CSSProperties

// 公共样式
const commonStyle = computed<NoticeBarCommonColorStyle>(() => {
  return (type: 'normal' | 'leftIcon' | 'rightIcon' = 'normal') => {
    const style: CSSProperties = {}

    if (type === 'normal') {
      // 设置颜色
      if (props.bgColor) {
        style.backgroundColor = props.bgColor || '#fff'
      }
      if (props.textColor) {
        style.color = props.textColor
      } else if (props.bgColor) {
        style.color = '#409eff'
      }
      // 如果有设置字体大小，则设置字体大小
      if (props.fontSize) style.fontSize = z.addUnit(props.fontSize)
    } else if (type === 'leftIcon') {
      if (props.leftIconColor) {
        style.color = props.leftIconColor || '#409eff'
      }
      if (props.fontSize) style.fontSize = z.addUnit(props.fontSize)
      if (props.leftIconSize) style.fontSize = z.addUnit(props.leftIconSize)
    } else if (type === 'rightIcon') {
      if (props.rightIconColor) {
        style.color = props.rightIconColor || '#409eff'
      }
      if (props.fontSize)
        style.fontSize = `calc(${z.addUnit(props.fontSize)} * 1.2)`
      if (props.rightIconSize) style.fontSize = z.addUnit(props.rightIconSize)
    }

    return style
  }
})

// 显示通知栏
const showNoticeBar = computed(() => {
  return props.show && !(props.autoHide && props.data.length === 0)
})

// 播放状态
const play = computed(() => !props.pause)

// 通知栏点击事件
const click = (index: number) => {
  emits('click', index)
}
// 左图标点击事件
const leftIconClick = () => {
  emits('left-icon-click')
}
// 右图标点击事件
const rightIconClick = () => {
  emits('right-icon-click')
}

provide(
  noticeBarKey,
  reactive({
    ...toRefs(props),
    play,
    click,
  })
)
</script>

<template>
  <div
    v-if="showNoticeBar"
    class="pr df aic z-notice-bar"
    :style="commonStyle('normal')"
  >
    <!-- 左图标 -->
    <div
      v-if="leftIcon"
      class="left-icon"
      :style="commonStyle('leftIcon')"
      @tap.stop="leftIconClick"
    >
      <zIcon :name="leftIcon"></zIcon>
    </div>

    <!-- 内容 -->
    <div class="content ofh">
      <zColumnNoticeBar
        v-if="direction === 'vertical' || (direction === 'horizontal' && !loop)"
      ></zColumnNoticeBar>
      <zRowNoticeBar v-else></zRowNoticeBar>
    </div>

    <!-- 右图标 -->
    <div
      v-if="rightIcon"
      class="right-icon"
      :style="commonStyle('rightIcon')"
      @tap.stop="rightIconClick"
    >
      <zIcon :name="rightIcon"></zIcon>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-notice-bar {
  width: auto;
  padding: 10rpx 20rpx;
  .left-icon {
    padding-right: 20rpx;
  }
  .right-icon {
    padding-left: 20rpx;
  }
  .content {
    flex-grow: 1;
    flex-shrink: 1;
  }
}
</style>
