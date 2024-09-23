<!--
 * @Description: z-load-more 获取更多组件
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
  PropType,
} from 'vue'
import type { Ref } from 'vue'
import z from '../../libs/z'
import zLine from '../../components/z-line/z-line.vue'
import zLoadingIcon from '../../components/z-loading-icon/z-loading-icon.vue'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
/**
 * @description: z-load-more 获取更多组件传参
 * @param 	status			组件状态（默认 'loadmore'、'loading'、'nomore'' ）
 * @param 	bgColor			组件的背景颜色（默认 'transparent' ）
 * @param 	icon			加载中时是否显示图标（默认 true ）
 * @param 	fontSize		字体大小（默认 16 ）
 * @param 	iconSize		图标大小（默认 19 ）
 * @param 	color			字体颜色（默认 '#666666' ）
 * @param 	loadingIcon		加载图标（默认 'circle' ）
 * @param 	loadmoreText	加载前的提示语（默认 '加载更多' ）
 * @param 	loadingText		加载中提示语（默认 '正在加载···' ）
 * @param 	nomoreText		没有更多的提示语（默认 '没有更多了' ）
 * @param		isDot			是否显示一个点 （默认 false ）
 * @param 	iconColor		加载中图标的颜色 （默认 '#409eff' ）
 * @param 	lineColor		线条颜色（默认 #bbbbbb ）
 * @param 	marginTop		上边距 （默认 10 ）
 * @param 	marginBottom	下边距 （默认 10 ）
 * @param 	height			高度，单位px （默认 'auto' ）
 * @param 	line			是否显示左边分割线  （默认 false ）
 * @param		dashed		与css border-style属性一致 可填solid（默认实线），dashed（虚线），dotted（圆点）等
 *
 * @event {Function} loadmore status为loadmore时，点击组件会发出此事件
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  status?: 'loadmore' | 'loading' | 'nomore'
  bgColor?: string
  icon?: boolean
  fontSize?: string | number
  iconSize?: string | number
  color?: string
  loadingIcon?: string
  loadmoreText?: string
  loadingText?: string
  nomoreText?: string
  isDot?: boolean
  iconColor?: string
  marginTop?: string | number
  marginBottom?: string | number
  height?: string
  line?: boolean
  lineColor?: string
  dashed?: string
}

interface EmitsType {
  (e: 'loadmore'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  status: 'loadmore',
  bgColor: 'transparent',
  icon: true,
  fontSize: 16,
  iconSize: 19,
  color: '#666666',
  loadingIcon: 'flower',
  loadmoreText: '加载更多',
  loadingText: '正在加载···',
  nomoreText: '没有更多了',
  isDot: false,
  iconColor: '#409eff',
  marginTop: 10,
  marginBottom: 10,
  height: 'auto',
  line: false,
  lineColor: '#bbbbbb',
  dashed: 'dashed',
})

const emits = defineEmits<EmitsType>()

/**
 * 展示的粗点
 */
const dot = ref<string>('●')

const loadTextStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {
    color: props.color,
    fontSize: z.addUnit(props.fontSize),
    lineHeight: z.addUnit(props.fontSize),
    backgroundColor: props.bgColor,
  }
  return style
})

const showText = computed<string>(() => {
  let text = ''
  if (props.status == 'loadmore') text = props.loadmoreText
  else if (props.status == 'loading') text = props.loadingText
  else if (props.status == 'nomore' && props.isDot) text = dot.value
  else text = props.nomoreText
  return text
})

function loadMore() {
  /**
   * 当状态为加载更多时，才会调用事件，内容不满一屏时无法触发底部上拉事件，所以需要点击来触发
   */
  if (props.status == 'loadmore') emits('loadmore')
}
</script>

<template>
  <div
    class="dfr jcc aic f1 z-loadmore"
    :style="[
      z.addStyle(otherStyle),
      {
        backgroundColor: bgColor,
        marginBottom: z.addUnit(marginBottom),
        marginTop: z.addUnit(marginTop),
        height: z.addUnit(height),
      },
    ]"
  >
    <zLine
      :width="'140rpx'"
      :color="lineColor"
      :borderStyle="dashed"
      v-if="line"
    ></zLine>
    <!-- 加载中和没有更多的状态才显示两边的横线 -->
    <div
      :class="status == 'loadmore' || status == 'nomore' ? 'z-more' : ''"
      class="dfr jcc aic z-loadmore-content"
    >
      <div class="z-loadmore-content-icon" v-if="status === 'loading' && icon">
        <zLoadingIcon
          :color="iconColor"
          :size="iconSize"
          :mode="loadingIcon"
        ></zLoadingIcon>
      </div>
      <!-- 如果没有更多的状态下，显示内容为dot（粗点），加载特定样式 -->
      <text
        class="tac"
        :style="loadTextStyle"
        :class="[
          status == 'nomore' && isDot == true
            ? 'z-loadmore-content-dot'
            : 'z-loadmore-content-text',
        ]"
        @tap="loadMore"
      >
        {{ showText }}
      </text>
    </div>
    <zLine
      :width="'140rpx'"
      :color="lineColor"
      :borderStyle="dashed"
      v-if="line"
    ></zLine>
  </div>
</template>

<style lang="less" scoped>
.z-loadmore {
  .z-loadmore-content {
    margin: 0 15px;
    .z-loadmore-content-icon {
      margin-right: 8px;
    }
    .z-loadmore-content-dot {
      font-size: 17px;
      color: @info;
    }
    .z-loadmore-content-text {
      font-size: 16px;
      color: #666666;
    }
  }
}
</style>
