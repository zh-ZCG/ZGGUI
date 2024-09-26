<!--
 * @Description: z-navbar 头部导航栏组件
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
import zType from '../../libs/zType'
import zColor from '../../libs/zColor'
import zIcon from '../../components/z-icon/z-icon.vue'
import { zNavBack, zNavPage } from '@/ZCGUI/libs/zRouter'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
import { useUniAppSystemRectInfo } from '../../libs/use-uniapp-system-rect-info/use-uniapp-system-rect-info'
/**
 * @description: z-navbar 头部导航栏组件传参
 * @param: height 导航栏高度
 * @param: bgColor	导航栏背景色，如设置毛玻璃背景颜色，请选择rgba传递
 * @param: textColor	导航栏字体颜色
 * @param: frosted  开启毛玻璃效果
 * @param: opacity  导航栏透明度
 * @param: backIcon  返回按钮图标
 * @param: backText  返回按钮文字
 * @param: homeIcon  返回首页图标
 * @param: bottomShadow  是否显示底部阴影
 * @param: safeAreaInsetRight  是否预留右边胶囊安全距离
 * @param: center  居中显示内容
 * @param: rightOperationWidth  右边操作区域的宽度
 * @param: beforeBack  返回前回调
 * @param: beforeHome  返回首页前回调
 * @param: indexUrl  首页地址
 * @param: fixed  是否固定在顶部
 * @param: placeholder  在固定模式下是否开启占位
 * @param: zIndex  ZIndex
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */

type NavbackButtonType = 'single' | 'multi' | 'text' | 'custom' | 'none'

type NavbarRectInfo = {
  statusHeight: number
  height: number
}

interface PropsType extends PropsTypeHook {
  height?: string
  bgColor?: string
  textColor?: string
  frosted?: boolean
  opacity?: number | string
  backIcon?: string
  backText?: string
  homeIcon?: string
  bottomShadow?: boolean
  safeAreaInsetRight?: boolean
  center?: boolean
  rightOperationWidth?: string
  beforeBack?: Function
  beforeHome?: Function
  indexUrl?: string
  fixed?: boolean
  placeholder?: boolean
  zIndex?: number
}

interface EmitsType {
  (e: 'initFinish', info: NavbarRectInfo): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  opacity: 1,
  backIcon: 'chevron-left1',
  homeIcon: 'shouye',
  bottomShadow: true,
  safeAreaInsetRight: true,
  center: true,
  indexUrl: '/pages/index/index',
  placeholder: true,
  zIndex: 1300,
})

const emits = defineEmits<EmitsType>()

const { navBarInfo, navBarBoundingInfo } = useUniAppSystemRectInfo()

const { slots } = getCurrentInstance()!

// 返回按钮类型
const navbackButtonType = computed<NavbackButtonType>(() => {
  if (slots?.back) return 'custom'
  if (props?.backText) return 'text'
  if (!!props?.backIcon && !!props?.homeIcon) return 'multi'
  else if (!!props?.backIcon || !!props?.homeIcon) return 'single'

  return 'none'
})

// 是否有右边操作区域
const hasRightOperation = computed<boolean>(() => !!slots?.right)

// 点击返回按钮
const clickBackEvent = () => {
  const { beforeBack } = props

  if (!beforeBack) {
    zNavBack(props.indexUrl)
    return
  }

  const shouldBack = beforeBack()
  const isPromiseOrBool = [
    zType.isPromise(shouldBack),
    zType.isBoolean(shouldBack),
  ].includes(true)
  if (!isPromiseOrBool) {
    z.error('zNavbar beforeBack 返回值必须是 Promise 或者 Boolean 类型')
  }

  if (zType.isPromise(shouldBack)) {
    shouldBack
      .then(res => {
        if (res) zNavBack(props.indexUrl)
      })
      .catch(err => {
        z.error(`zNavbar beforeBack 函数执行出错: ${err}`)
      })
  } else {
    if (shouldBack) zNavBack(props.indexUrl)
  }
}

// 点击返回首页按钮
const clickHomeEvent = () => {
  const { beforeHome } = props

  if (!beforeHome) {
    zNavPage(props.indexUrl, 'reLaunch')
    return
  }

  const shouldBack = beforeHome()
  const isPromiseOrBool = [
    zType.isPromise(shouldBack),
    zType.isBoolean(shouldBack),
  ].includes(true)
  if (!isPromiseOrBool) {
    z.error('zNavbar beforeHome 返回值必须是 Promise 或者 Boolean 类型')
  }

  if (zType.isPromise(shouldBack)) {
    shouldBack
      .then(res => {
        if (res) zNavPage(props.indexUrl, 'reLaunch')
      })
      .catch(err => {
        z.error(`zNavbar beforeHome 函数执行出错: ${err}`)
      })
  } else {
    if (shouldBack) zNavPage(props.indexUrl, 'reLaunch')
  }
}

// 状态栏的高度
const navbarHeight = computed<string>(() =>
  props.height ? z.addUnit(props.height) : `${navBarInfo.height}px`
)

// 导航栏对应的类
const navbarClass = computed<string>(() => {
  const cls: string[] = ['z-navbar']

  // 固定在顶部
  if (props.fixed) cls.push('z-navbar-fixed')

  // 底部阴影
  if (props.bottomShadow) cls.push('z-navbar-shadow')

  return cls.join(' ')
})
// 导航栏对应的样式
const navbarStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  // 设置导航栏的高度
  style.height = navbarHeight.value

  // 设置导航栏的zIndex
  if (props.zIndex) style.zIndex = props.zIndex

  // 设置透明度
  if (props?.opacity !== undefined) style.opacity = props.opacity

  // 设置文字颜色
  style.color = zColor.getTypeColor(props.textColor || zColor.getTypeColor('primary'))

  return style
})

// 背景颜色所属类
const navbarBgClass = computed<string>(() => {
  const cls: string[] = ['z-navbar-bg']

  // 设置毛玻璃
  // #ifndef MP-ALIPAY
  if (props.frosted) cls.push('z-navbar-bg-frosted')
  // #endif

  return cls.join(' ')
})
// 背景颜色所属类
const navbarBgStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  if (props.zIndex) style.zIndex = props.zIndex - 2

  // 设置背景颜色
  style.backgroundColor = zColor.getTypeColor(
    props.bgColor || zColor.getTypeColor('cw')
  )
  // 判断是否为毛玻璃
  // #ifndef MP-ALIPAY
  if (props.frosted) {
    style.backgroundColor = zColor.getTypeColor(
      props.bgColor || 'rgba(255, 255, 255, 0.5)'
    )
  }
  // #endif

  return style
})

// 导航栏占位区域对应的样式
const navbarPlaceholderStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  if (props.zIndex) style.zIndex = props.zIndex - 2

  // 设置导航栏的高度
  style.height = navbarHeight.value

  return style
})

// 导航栏容器区域对应样式
const navbarWrapperStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  if (props.zIndex) style.zIndex = props.zIndex

  // 如果不是自定义高度则设置top值
  if (!props.height) {
    style.top = `${navBarInfo.statusHeight}px`
    style.height = `${navBarInfo.height - navBarInfo.statusHeight}px`
  }

  return style
})

// 返回按钮对应的样式
const backStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  if (props.zIndex) style.zIndex = props.zIndex

  // 设置返回按钮的宽高
  style.width = `${navBarBoundingInfo.width}px`
  style.height = `${navBarBoundingInfo.height}px`

  // 距离左边的距离
  style.left = `${navBarBoundingInfo.marginRight}px`

  return style
})

// 内容区域对应的样式
const contentStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  if (props.zIndex) style.zIndex = props.zIndex - 1

  // 设置高度
  style.height = `${navBarInfo.height - navBarInfo.statusHeight}px`
  if (props.height) style.height = z.addUnit(props.height)

  // 如果设置了右边操作区域的宽度则以当前区域为准设置右边安全区域
  if (hasRightOperation.value && props.rightOperationWidth) {
    style.paddingRight = z.addUnit(props.rightOperationWidth)
  } else if (props.safeAreaInsetRight || hasRightOperation.value) {
    // 判断是否预留右边胶囊安全距离
    style.paddingRight = `${
      navBarBoundingInfo.width + navBarBoundingInfo.marginRight
    }px`
  }

  return style
})

// 右边操作区域对应的样式
const rightOperationStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  // 设置最大宽度，防止出现右边操作区域的内容过多导致右边操作区域的宽度过大
  style.maxWidth = `${navBarBoundingInfo.width}px`

  if (props.zIndex) style.zIndex = props.zIndex

  // 设置高度
  style.height = `${navBarInfo.height - navBarInfo.statusHeight}px`
  if (props.height) style.height = z.addUnit(props.height)

  // 设置宽度
  if (props.rightOperationWidth) style.width = z.addUnit(props.rightOperationWidth)

  return style
})

// 动态调用是返回首页还是返回上一页
const backEvent = (type: 'back' | 'home') => {
  if (type === 'back') {
    clickBackEvent()
  } else {
    clickHomeEvent()
  }
}

// 组件初始化完成
onMounted(() => {
  nextTick(() => {
    emits('initFinish', navBarInfo)
  })
})
</script>

<template>
  <div :class="[navbarClass]" :style="navbarStyle">
    <!-- 背景颜色 -->
    <div :class="navbarBgClass" :style="navbarBgStyle" />
    <!-- 容器 -->
    <div class="wrapper" :style="navbarWrapperStyle">
      <!-- 返回按钮区域 -->
      <div
        v-if="navbackButtonType !== 'none'"
        class="z-navbar-back"
        :style="backStyle"
      >
        <slot name="back">
          <!-- 双图标 -->
          <div v-if="navbackButtonType === 'multi'" class="multi">
            <div class="item" @tap.stop="clickBackEvent">
              <zIcon :name="props.backIcon" />
            </div>
            <div class="item" @tap.stop="clickHomeEvent">
              <zIcon :name="props.homeIcon" />
            </div>
          </div>

          <!-- 单图标 -->
          <div
            v-if="navbackButtonType === 'single'"
            class="single"
            @tap.stop="backEvent(props.backIcon ? 'back' : 'home')"
          >
            <zIcon v-if="props.backIcon" :name="props.backIcon" />
            <zIcon v-else-if="props.homeIcon" :name="props.homeIcon" />
          </div>

          <!-- 文字返回 -->
          <div
            v-if="navbackButtonType === 'text'"
            class="text"
            @tap.stop="clickBackEvent"
          >
            <div class="icon">
              <zIcon :name="backIcon || 'left'" />
            </div>
            <div class="value">
              {{ backText || '返回' }}
            </div>
          </div>
        </slot>
      </div>

      <!-- 内容数据 -->
      <div
        v-if="$slots.default"
        class="content pa"
        :class="props.center ? 'df jcc aic' : ''"
        :style="contentStyle"
      >
        <slot />
      </div>

      <!-- 右边操作区域 -->
      <div
        v-if="$slots.right"
        class="right-operation pa"
        :style="rightOperationStyle"
      >
        <slot name="right" />
      </div>
    </div>
  </div>
  <!-- 固定之后会导致容器塌陷 -->
  <div
    v-if="fixed && placeholder"
    class="z-navbar-placeholder"
    :style="navbarPlaceholderStyle"
  />
</template>

<style lang="less" scoped>
.z-navbar {
  position: relative;
  width: 100%;
  .z-navbar-bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
  /* #ifndef MP-ALIPAY */
  .z-navbar-bg-frosted {
    backdrop-filter: blur(20rpx);
    -webkit-backdrop-filter: blur(20rpx);
  }
  /* #endif */
  .wrapper {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    .z-navbar-back {
      position: absolute;
      left: 15rpx;
      top: 50%;
      transform: translateY(-50%);
      .multi {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1rpx solid rgba(255, 255, 255, 0.4);
        border-radius: 1000rpx;
        background-color: rgba(0, 0, 0, 0.15);
        color: #fff;
        font-size: 36rpx;
        .item {
          flex-grow: 1;
          flex-shrink: 0;
          width: 50%;
          height: 100%;
          line-height: 1;

          display: flex;
          align-items: center;
          justify-content: center;
        }
        &::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          width: 1rpx;
          height: 60%;
          transform: translate(-50%, -50%);
          background-color: #fff;
          opacity: 0.2;
        }
      }
      .single {
        position: relative;
        width: 70%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1rpx solid rgba(255, 255, 255, 0.4);
        border-radius: 1000rpx;
        background-color: rgba(0, 0, 0, 0.15);
        color: #fff;
        font-size: 36rpx;
      }
      .text {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        font-size: 30rpx;

        .value {
          margin-left: 8rpx;
        }
      }
    }
    .content {
      top: 0;
      left: 0;
      width: 100%;
    }
    .right-operation {
      right: 0;
      bottom: 0;
    }
  }
}
.z-navbar-fixed {
  position: fixed;
  left: 0;
  top: 0;
}
.z-navbar-shadow {
  box-shadow: 0px 5px 30px -9.5px rgba(0, 0, 0, 0.1);
}
.z-navbar-placeholder {
  position: relative;
  left: 0;
  top: 0;
  background-color: transparent;
}
</style>
