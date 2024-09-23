<!--
 * @Description: z-link 超链接组件
 * @Author: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import { ref, getCurrentInstance, watch, computed } from 'vue'
import type { Ref, PropType } from 'vue'
import z from '../../libs/z'
import zColor from '../../libs/zColor'

/**
 * @description: z-link 超链接组件，小程序为复制到剪贴板，h5为打开超链接，app为用内置浏览器打开链接
 * @param: href 跳转的链接（完整路径）
 * @param: color 链接文本颜色(默认不传，优先级高于type)
 * @param: type 颜色设置主题色（默认primary）
 * @param: fontSize 字体大小（默认16）px
 * @param: underLine 是否显示下划线（默认false）
 * @param: lineColor 下划线颜色，默认与链接颜色相同
 * @param: tips 平台复制粘贴板提示词
 * @param: text 使用slot导致nvue无法修改颜色，直接传入
 * @param: otherstyle 其他样式
 *
 * @event: click 点击链接
 * @tutorial: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * @example:
 */
interface PropsType {
  href?: string
  color?: string
  type?: string
  fontSize?: string | number
  underLine?: boolean
  lineColor?: string
  tips?: string
  text?: string
  otherstyle?: object // 其他样式
}

interface EmitsType {
  (e: 'click'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  href: '',
  color: '',
  type: 'primary',
  fontSize: 16,
  underLine: false,
  lineColor: '',
  tips: '链接已复制，请使用浏览器打开',
  text: '',
})

const emits = defineEmits<EmitsType>()

const zLinkStyle = computed(() => {
  let style = {
    color: '',
    fontSize: z.addUnit(props.fontSize),
    lineHeight: z.addUnit((z.getPx(props.fontSize) as number) + 2),
    textDecoration: props.underLine ? 'underline' : 'none',
  }
  if (props.type) {
    style.color = zColor.getTypeColor(props.type)
  }
  if (props.color) {
    style.color = props.color
  }
  return z.deepMerge(style, props.otherstyle ? props.otherstyle : {})
})

function clickLink() {
  emits('click')
}
</script>

<template>
  <text class="df f1 fww" :style="zLinkStyle" @tap.stop="clickLink">
    {{ props.text }}
  </text>
</template>

<style lang="less" scoped></style>
