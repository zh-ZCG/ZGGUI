<!--
 * @Description: z-popup 弹出层组件
 * @Author: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import { ref, getCurrentInstance, watch, computed } from 'vue'
import type { Ref, PropType } from 'vue'
import zOverlay from '@/ZGGUI/components/z-overlay/z-overlay.vue'
import zTransition from '@/ZGGUI/components/z-transition/z-transition.vue'
import z from '@/ZGGUI/libs/z'
import zStatusBar from '@/ZGGUI/components/z-status-bar/z-status-bar.vue'
import zIphoneBottom from '@/ZGGUI/components/z-iphone-bottom/z-iphone-bottom.vue'

/**
 * @description: z-popup 弹出层组件
 * @param: show 是否显示弹窗 默认false
 * @param: overlay  是否显示遮罩层（z-overlay组件），默认true
 * @param: mode 弹出方向 默认底部弹出（bottom），可选值（left、top、right、bottom、center）
 * @param: width 当mode为left||right||center 请设置弹出宽度 默认50vw，最好设置为与插槽宽度相同,否则溢出隐藏
 * @param: duration 弹出层动画时长，默认200ms
 * @param: overlayDuration 遮罩层动画时长，默认300ms
 * @param: overlayOtherStyle 遮罩层自定义样式
 * @param: overlayOpacity 遮罩层透明度（默认0.5）
 * @param: clickCloseOverlay 点击遮罩层关闭（默认true）
 * @param: zoom 是否增加缩放效果在居中(mode==center)时（默认true）
 * @param: zIndex 弹出层层级（默认510）
 * @param: borderRadius 弹出层圆角值（默认0），注意如果是bottom弹出，则圆角为top-left&&top-right,如果居中则四个角都是圆角
 * @param: safeStatus	是否留出顶部安全距离（状态栏高度） （默认 false ）
 * @param: safeBottom	是否为iPhoneX留出底部安全距离 （默认 true ）
 * @param: otherStyle 其他样式
 *
 * @event close 点击遮罩关闭事件回调，请在这个回调中关闭遮罩
 * @event click 点击动画进行回调
 * @event open 遮罩层已打开完成的回调
 * @tutorial: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * @example:
 */
interface PropsType {
  show: boolean
  overlay?: boolean
  mode?: string
  width?: string | number
  duration?: number | string
  overlayDuration?: number | string
  overlayOtherStyle?: object
  overlayOpacity?: number | string
  clickCloseOverlay?: boolean
  zoom?: boolean
  zIndex?: number | string
  borderRadius?: number | string
  safeStatus?: boolean
  safeBottom?: boolean
  otherStyle?: object
}

interface EmitsType {
  (e: 'close'): void //点击遮罩关闭事件回调，
  (e: 'click'): void
  (e: 'open'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  show: false,
  overlay: true,
  mode: 'bottom',
  width: '50vw',
  duration: 200,
  overlayDuration: 300,
  overlayOpacity: 0.5,
  clickCloseOverlay: true,
  zoom: true,
  zIndex: 510,
  borderRadius: 0,
  safeStatus: false,
  safeBottom: true,
})

const emits = defineEmits<EmitsType>()

/**
 * 根据mode判断动画效果
 */
const position = computed(() => {
  if (props.mode === 'center') {
    return props.zoom ? 'fade-zoom' : 'fade'
  }
  if (props.mode === 'left') {
    return 'slide-left'
  }
  if (props.mode === 'right') {
    return 'slide-right'
  }
  if (props.mode === 'bottom') {
    return 'slide-up'
  }
  if (props.mode === 'top') {
    return 'slide-down'
  }
})
/**
 * 动画样式
 */
const transitionStyle = computed(() => {
  let style = {
    zIndex: props.zIndex,
    position: 'fixed',
    display: 'flex',
  } as any
  style[props.mode] = 0
  if (props.mode === 'left') {
    return z.deepMerge(style, {
      bottom: 0,
      top: 0,
    })
  } else if (props.mode === 'right') {
    return z.deepMerge(style, {
      bottom: 0,
      top: 0,
    })
  } else if (props.mode === 'top') {
    return z.deepMerge(style, {
      left: 0,
      right: 0,
    })
  } else if (props.mode === 'bottom') {
    return z.deepMerge(style, {
      left: 0,
      right: 0,
    })
  } else if (props.mode === 'center') {
    return z.deepMerge(style, {
      alignItems: 'center',
      justifyContent: 'center',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    })
  }
})
/**
 * 内容样式
 */
const contentStyle = computed(() => {
  let style = {} as any
  if (props.mode !== 'center') {
    style.flex = 1
  }
  switch (props.mode) {
    case 'left': {
      style.height = '100vh'
      style.width = z.addUnit(props.width)
      style['display'] = 'flex'
      style['flex-direction'] = 'column'
      style['justify-content'] = 'center'
      break
    }
    case 'center': {
      style.width = z.addUnit(props.width)
      style['display'] = 'flex'
      style['flex-direction'] = 'column'
      style['justify-content'] = 'center'
      break
    }
    case 'right': {
      style.height = '100vh'
      style.width = z.addUnit(props.width)
      style['display'] = 'flex'
      style['flex-direction'] = 'column'
      style['justify-content'] = 'center'
      break
    }
    case 'top': {
      style.width = '100vw'
      break
    }
    case 'bottom': {
      style.width = '100vw'
      break
    }
  }
  if (props.borderRadius) {
    const value = z.addUnit(props.borderRadius)
    if (props.mode === 'top') {
      style.borderBottomLeftRadius = value
      style.borderBottomRightRadius = value
    } else if (props.mode === 'bottom') {
      style.borderTopLeftRadius = value
      style.borderTopRightRadius = value
    } else if (props.mode === 'center') {
      style.borderRadius = value
    }
  }
  return z.deepMerge(style, props.otherStyle ? props.otherStyle : {})
})

/**
 * 点击遮罩回调
 */
function clickOverlay() {
  if (props.clickCloseOverlay) {
    emits('close')
  }
}

/**
 * 动画点击回调方法
 */
function clickTransition() {
  if (props.mode === 'center') {
    //如果内容居中，整个动画组件会遮住遮罩层，导致遮罩层点击无效，这里手动调用
    clickOverlay()
  }
  emits('click')
}

/**
 * 弹出层已经打开方法
 */
function afterEnter() {
  emits('open')
}
</script>

<template>
  <div class="z-popup f1" ref="z-popup" id="z-popup">
    <zOverlay
      :show="show"
      @click="clickOverlay"
      v-if="overlay"
      :duration="overlayDuration"
      :customStyle="overlayOtherStyle"
      :opacity="overlayOpacity"
    ></zOverlay>
    <zTransition
      :show="show"
      :name="position"
      :duration="Number(duration)"
      :otherStyle="transitionStyle"
      @click="clickTransition"
      @afterEnter="afterEnter"
    >
      <div :style="[contentStyle]" class="pr bgw ofh" @tap.stop="1">
        <zStatusBar v-if="props.safeStatus"></zStatusBar>
        <slot></slot>
        <zIphoneBottom v-if="props.safeBottom"></zIphoneBottom>
      </div>
    </zTransition>
  </div>
</template>

<style lang="less" scoped></style>
