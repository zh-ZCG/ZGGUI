<!--
 * @Description: z-popup-bar 弹出层的操作栏
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
import { ref, getCurrentInstance, watch, computed } from 'vue'
import zLine from '../../components/z-line/z-line.vue'
import z from '../../libs/z'
import zColor from '../../libs/zColor'

/**
 * @description: z-popupBar 弹出层的操作栏传参
 * @param: show 是否展示操作栏
 * @param: disabled 是否可点击事件（用于控制picker-view的滚动开始与结束状态可否点击）
 * @param: leftValue  操作栏左侧内容
 * @param: leftColor 操作栏左侧内容颜色
 * @param: centerValue 操作栏中间内容，超出宽度显示省略号
 * @param: rightValue 操作栏右侧内容
 * @param: rightColor 操作栏右侧内容颜色
 * @param: borderBottom 是否具有下边框
 * @param: borderRadius 操作栏左右两边顶部的弧度
 * @param: bgColor 操作栏背景颜色
 *
 *
 * @event: clickLeft 点击操作栏左侧
 * @event: clickRight 点击操作栏右侧
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */
interface PropsType {
  show?: boolean
  disabled?: boolean
  leftValue?: string
  leftColor?: string
  centerValue?: string
  rightValue?: string
  rightColor?: string
  borderBottom?: boolean
  borderRadius?: number | string
  bgColor?: string
  otherStyle?: object
}

interface EmitsType {
  (e: 'clickLeft'): void
  (e: 'clickRight'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  show: false,
  disabled: false,
  leftValue: '取消',
  leftColor: '#666666',
  rightValue: '确认',
  rightColor: '#409eff',
  borderBottom: false,
  bgColor: '#fff',
})

const emits = defineEmits<EmitsType>()

const leftStyle = computed(() => {
  let style = {
    color: zColor.getTypeColor(props.leftColor),
  }

  return style
})

const rightStyle = computed(() => {
  let style = {
    color: zColor.getTypeColor(props.rightColor),
  }

  return style
})

const popupBarStyle = computed(() => {
  let style = {
    borderTopLeftRadius: z.addUnit(props.borderRadius ?? 0),
    borderTopRightRadius: z.addUnit(props.borderRadius ?? 0),
    fontSize: '16px',
    height: '42px',
    width: '100%',
  } as any

  style.backgroundColor = zColor.getTypeColor(props.bgColor)

  return z.deepMerge(style, props.otherStyle ? props.otherStyle : {})
})
</script>

<template>
  <div class="dfc aic" style="width: 100%">
    <div
      ref="z-popupBar"
      id="z-popupBar"
      :style="[popupBarStyle]"
      class="dfr jcsb aic"
      v-if="props.show"
      @touchmove.stop.prevent="1"
    >
      <div
        class="leftClass"
        :style="[leftStyle]"
        @tap="props.disabled ? 1 : emits('clickLeft')"
      >
        <div :style="props.disabled ? 'opacity:0.5' : ''">
          {{ props.leftValue }}
        </div>
      </div>
      <div class="f1 valueClass tac ofh wsnw tofe" style="">
        {{ props.centerValue }}
      </div>
      <div
        class="rightClass"
        :style="[rightStyle]"
        @tap="props.disabled ? 1 : emits('clickRight')"
      >
        <div :style="props.disabled ? 'opacity:0.5' : ''">
          {{ props.rightValue }}
        </div>
      </div>
    </div>
    <zLine :show="props.borderBottom"></zLine>
  </div>
</template>

<style lang="less" scoped>
.leftClass {
  padding: 0 15px;
}

.valueClass {
  padding: 0 15px;
}

.rightClass {
  padding: 0 15px;
}
</style>
