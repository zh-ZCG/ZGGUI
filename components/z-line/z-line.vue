<!--
 * @Description: 线条组件，用于分隔两个模块
 * @Author: ZGGUI & ui.zggui.cn & zggamazing@163.com
 * @Date: 2024-03-26 15:55:10
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
import { computed } from 'vue'
import z from '@/ZGGUI/libs/z'

/**
 * @param: show,是否展示默认true
 * @param: width（默认row横向）为宽度，如果是col（垂直方向）则为高度,默认长度为100%,厚度为1px
 * @param: direction 方向 默认为row横向，改为col为竖向
 * @param: color 线条颜色，默认'#eeeeee'
 * @param: hairline 是否显示细线条 (默认 true )
 * @param: margin 线条margin值，默认0
 * @param: borderStyle 设置线条样式 与css border-style属性一致 可填solid（默认实线），dashed（虚线），dotted（圆点）等
 * @tutorial: ZGGUI & ui.zggui.cn & zggamazing@163.com
 * @example:<z-line></z-line>
 */
interface PropsType {
  show?: boolean
  width?: number | string
  direction?: string
  color?: string
  hairline?: boolean
  margin?: string | number
  borderStyle?: string
  otherStyle?: object
}

const props = withDefaults(defineProps<PropsType>(), {
  show: true,
  width: '100%',
  direction: 'row',
  color: '#eeeeee',
  hairline: true,
  margin: 0,
  borderStyle: 'solid',
})

const lineStyle = computed(() => {
  let style = {
    width: '',
    borderColor: props.color,
    margin: props.margin,
    borderBottomStyle: '',
    borderBottomWidth: '',
    borderLeftWidth: '',
    borderLeftStyle: '',
    height: '',
    transform: '',
  }
  if (props.direction == 'row') {
    style.borderBottomWidth = '1px'
    style.borderBottomStyle = props.borderStyle
    style.width = z.addUnit(props.width)
    if (props.hairline) style.transform = 'scaleY(0.5)'
  } else {
    style.borderLeftWidth = '1px'
    style.borderLeftStyle = props.borderStyle
    style.height = z.addUnit(props.width)
    if (props.hairline) style.transform = 'scaleX(0.5)'
  }
  return z.deepMerge(style, props.otherStyle ? props.otherStyle : {})
})
</script>

<template>
  <div
    :style="lineStyle"
    class="z-line df"
    id="z-line"
    ref="z-line"
    v-if="show"
  ></div>
</template>

<style lang="less" scoped>
.z-line {
  vertical-align: baseline;
}
</style>
