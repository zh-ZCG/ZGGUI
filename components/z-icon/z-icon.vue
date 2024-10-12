<!--
 * @Description: z-icon 图标组件
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
import type { Ref, PropType } from 'vue'
import z from '../../libs/z'

/**
 * @description: z-icon 图标组件传参
 * @param: name 图片名称或者链接，如果传入的字符串中有'/'则为图片链接,使用图标记得全局引入css文件
 * @param: badge  是否展示右上角徽标,默认false
 * @param: color 图标颜色，图片无效，不传则为iconfont默认灰色
 * @param: bold 是否加粗，默认false
 * @param: size 图标大小,默认16px
 * @param: width name为图片路径时图片宽度,单位px
 * @param: height name为图片路径时图片高度,单位px
 * @param: classPrefix 类名前缀，用于自定义图标,默认'icon'
 * @param: iconFamilyName 类名，用于自定义图标,默认'iconfont'
 * @param: mode 图片裁剪、缩放的模式，与原生image mode属性相同
 * @param: stop 是否阻止事件传播 (默认 false)
 * @param: otherStyle 其他样式
 *
 * @slot: 具名插槽badge,与z-badge用法一样，最好使用absolute和position字段控制位置
 * @event: click 点击图标，只判断是否点击，如果是循环请在父组件或页面中接收想要传入的index，不进行组件的传入传出
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */
interface PropsType {
  name: string
  badge?: boolean
  color?: string
  bold?: boolean
  size?: string | number
  width?: string | number
  height?: string | number
  classPrefix?: string
  iconFamilyName?: string
  mode?: string
  stop?: boolean
  otherStyle?: object
}

interface EmitsType {
  (e: 'click'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  badge: false,
  bold: false,
  width: 40,
  height: 40,
  classPrefix: 'icon',
  iconFamilyName: 'iconfont',
  stop: false,
})

const emits = defineEmits<EmitsType>()

/**
 * 判断是否是图片链接
 */
const isImage = computed(() => {
  return props.name.indexOf('/') !== -1
})

/**
 * 点击图标或链接事件
 */
function clickIcon(e: Event) {
  emits('click')
}

const imageStyle = computed(() => {
  let style = {
    width: '0',
    height: '0',
  }
  style.width = props.width
    ? z.addUnit(props.width)
    : props.size
    ? z.addUnit(props.size)
    : 'inherit'
  style.height = props.height
    ? z.addUnit(props.height)
    : props.size
    ? z.addUnit(props.size)
    : 'inherit'
  return z.deepMerge(style, props.otherStyle ? props.otherStyle : {})
})

const iconClass = computed(() => {
  let classes: string[] = []
  let classesCopy: string = ''

  classes.push(props.classPrefix + '-' + props.name)
  classes.push(props.iconFamilyName)
  // classes.push(props.classPrefix) 在使用自定义图标时，记得带上iconfont（与官网相似）

  classesCopy = classes.join(' ')
  return classesCopy
})

const iconStyle = computed(() => {
  let style = {
    fontSize: '',
    fontWeight: '',
  } as any
  style.fontSize = props.size ? z.addUnit(props.size) : 'inherit'
  style.fontWeight = props.bold ? 'bold' : 'normal'
  // style.width = props.width ? z.addUnit(props.width) : z.addUnit(props.size)
  // style.height = props.height ? z.addUnit(props.height) : z.addUnit(props.size)

  if (props.color) {
    style.color = props.color
  }
  return z.deepMerge(style, props.otherStyle ? props.otherStyle : {})
})

/**
 * 判断是否是unicode编码
 */
const icon = computed(() => {
  if (props.name.startsWith('&#') && props.name.endsWith(';')) return props.name
})

const otherStyle = computed(() => {
  let style = {}
  return z.deepMerge(style, props.otherStyle ? props.otherStyle : {})
})
</script>

<template>
  <div
    class="df jcc aic pr"
    v-if="props.stop"
    @tap.stop="clickIcon"
    ref="z-icon"
    id="z-icon"
    :style="otherStyle"
  >
    <image
      v-if="isImage"
      :src="props.name"
      :mode="props.mode"
      :style="imageStyle"
    ></image>
    <div class="pr df jcc aic" :class="iconClass" :style="iconStyle" v-else>
      {{ icon }}
    </div>
    <slot name="badge"></slot>
  </div>
  <div
    class="df jcc aic pr"
    v-else
    @tap="clickIcon"
    ref="z-icon"
    id="z-icon"
    :style="otherStyle"
  >
    <image
      v-if="isImage"
      :src="props.name"
      :mode="props.mode"
      :style="imageStyle"
    ></image>
    <div class="pr df jcc aic" :class="iconClass" :style="iconStyle" v-else>
      {{ icon }}
    </div>
    <slot name="badge"></slot>
  </div>
</template>

<style lang="less" scoped></style>
