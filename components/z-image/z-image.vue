<!--
 * @Description: z-image 图片组件
 * @Author: ZCGUI & ui.zcgui.cn & zcgamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import { ref, getCurrentInstance, watch, computed, onMounted } from 'vue'
import type { Ref, PropType } from 'vue'
import z from '@/ZCGUI/libs/z'
import zTransition from '@/ZCGUI/components/z-transition/z-transition.vue'
import zIcon from '@/ZCGUI/components/z-icon/z-icon.vue'
import { zImage } from '@/ZCGUI/libs/types/zImage'

/**
 * @description: z-image 图片组件传参
 * @param: fade 是否开启图片淡入效果 默认 true
 * @param: src 图片路径/地址
 * @param: mode image裁剪模式，与原生相同(默认 'aspectFill')
 * @param: width 图片宽度，默认150
 * @param: height 图片高度，默认150
 * @param: iconWidth 图标宽度，默认50（当为有色图时，width，height生效，否则size生效）
 * @param: iconHeight 图标高度，默认50
 * @param: iconSize 图标高度，默认50
 * @param: radius 圆角值，默认0
 * @param: lazyLoad 是否开启懒加载(微信小程序、App、百度小程序、字节跳动小程序有效)，默认true
 * @param: loadingIcon 加载中使用得图片或者图标（z-icon组件）
 * @param: errorIcon 加载失败使用得图片或者图标（z-icon组件）
 * @param: showLoading 是否展示加载中图标（默认true）
 * @param: showError 是否展示加载失败图标（默认true）
 * @param: bgColor 背景颜色，防止加载图片时只有图标，背景消失，(默认'#eeeeee')
 * @param: otherStyle 其他样式
 *
 * @slot: 具名插槽badge,与z-badge用法一样，最好使用absolute和position字段控制位置
 * @event: click 点击图片
 * @event: error 加载图片失败触发
 * @event: success 加载图片成功触发
 * @tutorial: ZCGUI & ui.zcgui.cn & zcgamazing@163.com
 * @example:
 */
interface PropsType {
  fade?: boolean
  src: string
  mode?: zImage['mode']
  width?: number | string
  height?: number | string
  iconWidth?: number | string
  iconHeight?: number | string
  iconSize?: number | string
  radius?: number | string
  lazyLoad?: boolean
  loadingIcon?: string
  errorIcon?: string
  showLoading?: boolean
  showError?: boolean
  bgColor?: string
  otherStyle?: object
}

interface EmitsType {
  (e: 'click'): void
  (e: 'error'): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  fade: true,
  mode: 'aspectFill',
  width: 150,
  height: 150,
  iconWidth: 50,
  iconHeight: 50,
  iconSize: 50,
  radius: 0,
  lazyLoad: true,
  showLoading: true,
  showError: true,
  bgColor: '#eeeeee',
})

const emits = defineEmits<EmitsType>()

/**
 * 等待挂载完成，控制组件是否展示
 */
const show = ref(false)

/**
 * 图片是否加载错误
 */
const isError = ref(false)

/**
 * 图片是否正在加载
 */
const isLoading = ref(false)

/**
 * 当前背景颜色
 */
const bgColor = ref({})

onMounted(() => {
  //挂载完成展示
  show.value = true
  isLoading.value = true
})

function clickImage() {
  emits('click')
}

const imageStyle = computed(() => {
  let style = {
    borderRadius: z.addUnit(props.radius),
    width: z.addUnit(props.width),
    height: z.addUnit(props.height),
  }
  return z.deepMerge(style, bgColor.value)
})

const imageStyleImage = computed(() => {
  let style = {
    borderRadius: z.addUnit(props.radius),
    width: z.addUnit(props.width),
    height: z.addUnit(props.height),
  }
  return style
})

const imageStyleLoading = computed(() => {
  let style = {
    borderRadius: z.addUnit(props.radius),
    backgroundColor: props.bgColor,
    width: z.addUnit(props.width),
    height: z.addUnit(props.height),
    top: 0,
  }
  return style
})

const imageStyleError = computed(() => {
  let style = {
    borderRadius: z.addUnit(props.radius),
    width: z.addUnit(props.width),
    height: z.addUnit(props.height),
  }
  return style
})

/**
 * 图片加载成功回调
 */
function onLoadHandler(e: Event) {
  isLoading.value = false
  isError.value = false
  emits('success')
}

/**
 * 图片加载失败回调
 */
function onErrorHandler(e: Event) {
  isLoading.value = false
  isError.value = true
  emits('error')
  bgColor.value = {
    backgroundColor: 'transparent',
  }
}
</script>

<template>
  <zTransition :show="show" :mode="'fade'" :duration="props.fade ? 300 : 0">
    <div
      class="pr ofh"
      :style="imageStyle"
      id="z-image"
      ref="z-image"
      @tap="clickImage"
    >
      <image
        v-if="!isError"
        :src="props.src"
        :mode="props.mode"
        :lazy-load="props.lazyLoad"
        @error="onErrorHandler"
        @load="onLoadHandler"
        :style="imageStyleImage"
      ></image>
      <div
        v-if="props.showLoading && isLoading"
        class="pa df jcc aic"
        :style="imageStyleLoading"
      >
        <slot name="loading">
          <zIcon
            :name="props.loadingIcon ? props.loadingIcon : 'loading'"
            :width="z.addUnit(props.iconWidth ? props.iconWidth : 0)"
            :height="z.addUnit(props.iconHeight ? props.iconHeight : 0)"
            :classPrefix="'t-icon'"
            :size="z.addUnit(props.iconSize ? props.iconSize : 0)"
            :otherStyle="
              isLoading
                ? {
                    animation: 'rotate 1.5s linear infinite',
                    transformOrigin: 'center',
                  }
                : {}
            "
          ></zIcon>
        </slot>
      </div>
      <div
        v-if="showError && isError && !isLoading"
        :style="imageStyleError"
        class="pa df jcc aic"
      >
        <slot name="error">
          <zIcon
            :name="props.errorIcon ? props.errorIcon : 'image-error'"
            :width="z.addUnit(props.iconWidth ? props.iconWidth : 0)"
            :height="z.addUnit(props.iconHeight ? props.iconHeight : 0)"
            :size="z.addUnit(props.iconSize ? props.iconSize : 0)"
          ></zIcon>
        </slot>
      </div>
    </div>
  </zTransition>
</template>

<style lang="less" scoped></style>
