<!--
 * @Description: z-badge 徽标组件
 * @Author: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import { ref, getCurrentInstance, watch, computed } from 'vue'
import type { Ref, PropType } from 'vue'
import z from '../../libs/z'

/**
 * @description: z-badge 徽标组件
 * @param: value 徽标内容
 * @param: fontSize 徽标内容字体大小，默认8px
 * @param: show 是否展示徽标
 * @param: showZero 当value为0时，是否展示徽标
 * @param: dot 是否只显示dot，优先级高于value
 * @param: dotSize dot大小，为一个圆，值为高度或者宽度
 * @param: rightAngle 徽标（左下角）是否为直角
 * @param: bgColor 徽标背景颜色
 * @param: color 徽标内容颜色
 * @param: maxNum 当value有效时，超过这个数时，自动变为{maxNum}+的形式
 * @param: type 徽标主题 primary error success info warning可选，优先级低于bgColor和color（如果传了任意一个，则type失效）
 * @param: reversal 背景与字体颜色反转
 * @param: absolute 是否启用绝对定位(记得给父级增加position:relative属性)
 * @param: position absolute启用后，该参数生效，[number:top,number:right]:第一个是距离父元素顶部的位置，第二个是距离父元素右部的位置
 * @param: otherstyle 其他样式
 * @event:
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */
interface PropsType {
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

interface EmitsType {}

const props = withDefaults(defineProps<PropsType>(), {
  show: false,
  rightAngle: false,
  showZero: false,
  fontSize: 8,
  dot: false,
  dotSize: 8,
  type: 'primary',
  reversal: false,
})

const emits = defineEmits<EmitsType>()

const showValue = computed(() => {
  if (props.maxNum && Number(props.value) > Number(props.maxNum)) {
    return props.maxNum + '+'
  } else return props.value
})

const badgeStyle = computed(() => {
  let style = {
    borderRadius: '100px',
    borderBottomLeftRadius: '100px',
    height: props.dot ? z.addUnit(props.dotSize) : 'auto',
    width: props.dot ? z.addUnit(props.dotSize) : 'auto',
    padding: '2px 5px',
    fontSize: z.addUnit(props.fontSize),
  } as any
  if (props.dot) {
    style.borderRadius = '50%'
    style.borderBottomLeftRadius = null
    style.padding = '2px 2px'
  } else {
    style.borderBottomLeftRadius = props.rightAngle ? '0px' : '100px'
  }
  if (props.absolute && props.position) {
    style.position = 'absolute'
    style.top = z.addUnit(props.position[0])
    style.right = z.addUnit(props.position[0])
  }
  if (props.bgColor) style.backgroundColor = props.bgColor
  if (props.color) style.color = props.color

  return z.deepMerge(style, props.otherStyle ? props.otherStyle : {})
})
</script>

<template>
  <div
    :style="badgeStyle"
    class="z-badge-class"
    id="z-badge"
    ref="z-badge"
    v-if="show && ((Number(value) === 0 ? showZero : true) || dot)"
    :class="reversal ? z.getColorClass(type) : z.getBGColorClass(type)"
  >
    {{ props.dot ? '' : showValue }}
  </div>
</template>

<style lang="less" scoped>
.z-badge-class {
  text-align: center;
  display: inline-block;
}
</style>
