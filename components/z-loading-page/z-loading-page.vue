<!--
 * @Description: z-loading-page 加载页面组件
 * @Author: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import { ref, onMounted, getCurrentInstance, computed } from 'vue'
import type { Ref } from 'vue'
import z from '../../libs/z'
import zColor from '../../libs/zColor'
import zLoadingIcon from '../../components/z-loading-icon/z-loading-icon.vue'
import zTransition from '../../components/z-transition/z-transition.vue'

import { propsHook, PropsTypeHook, openPage } from '../../libs/zHooks'

/**
 * @description: z-loading-page 加载页面组件
 * @param: 	loadingText		提示内容  (默认 '加载中' )
 * @param: 	image			文字上方用于替换loading动画的图片
 * @param: 	mode		加载动画的模式，circle-圆形，flower-花朵形，semicircle-半圆形 （默认 'circle' ）
 * @param:	show			是否加载中 （默认 false ）
 * @param: 	bgColor			背景色 （默认 '#ffffff' ）
 * @param: 	color			文字颜色 （默认 '#C8C8C8' ）
 * @param: 	fontSize		文字大小 （默认 19 ）
 * @param: 	iconSize		图标大小 （默认 28 ）
 * @param: 	loadingColor	加载中图标的颜色，只能rgb或者十六进制颜色值 （默认 '#C8C8C8' ）
 *
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  loadingText?: string | number
  image?: string
  mode?: 'circle' | 'flower' | 'semicircle'
  show?: boolean
  bgColor?: string
  color?: string
  fontSize?: string | number
  iconSize?: string | number
  loadingColor?: string
}

interface EmitsType {}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  loadingText: '加载中',
  mode: 'circle',
  show: false,
  bgColor: '#ffffff',
  color: '#c8c8c8',
  fontSize: 19,
  iconSize: 28,
  loadingColor: '#409eff',
})

const emits = defineEmits<EmitsType>()
</script>

<template>
  <zTransition
    :show="props.show"
    :otherStyle="{
      position: 'fixed',
      zIndex: 1000,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: zColor.getTypeColor(bgColor),
      display: 'flex',
    }"
  >
    <div class="z-loading-page dfc jcc aic">
      <div class="z-loading-page-wrapper dfc jcc aic">
        <div class="loading-icon">
          <image
            v-if="image"
            :src="image"
            class="img"
            mode="widthFit"
            :style="{
              width: z.addUnit(iconSize),
              height: z.addUnit(iconSize),
            }"
          ></image>
          <zLoadingIcon
            v-else
            :mode="mode"
            :size="z.addUnit(iconSize)"
            :inCircleColor="zColor.getTypeColor(loadingColor)"
          ></zLoadingIcon>
        </div>
        <slot>
          <text
            class="text"
            :style="{
              fontSize: z.addUnit(fontSize),
              color: zColor.getTypeColor(color),
            }"
          >
            {{ loadingText }}
          </text>
        </slot>
      </div>
    </div>
  </zTransition>
</template>

<style lang="less" scoped>
.z-loading-page {
  flex: 1;
  .z-loading-page-wrapper {
    width: 100vw;
    height: 100vh;
    /* #ifndef APP-NVUE */
    color: #fff;
    font-size: 19px;
    /* #endif */
    .loading-icon {
      margin-bottom: 10px;
      .img {
        width: 40px;
        height: 40px;
      }
    }
    .text {
      font-size: 19px;
      color: rgb(200, 200, 200);
    }
  }
}
</style>
