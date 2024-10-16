<!--
 * @Description: z-text 文本组件
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
import { ref, getCurrentInstance, watch, computed, CSSProperties } from 'vue'
import type { Ref, PropType } from 'vue'
import z from '../../libs/z'
import zTest from '../../libs/zTest'
import zColor from '../../libs/zColor'
import zIcon from '../../components/z-icon/z-icon.vue'
import zLink from '../../components/z-link/z-link.vue'

/**
 * @description: z-text 文本组件
 * @param: show 是否显示内容（默认true）
 * @param: text 文本内容
 * @param: type 颜色设置主题色
 * @param: color 文本颜色（默认#1a1a1a）
 * @param: size 文本大小（默认16）
 * @param: lines 文本显示行数，超出显示省略号
 * @param: bold 文本是否粗体（默认false）
 * @param: block 文本是否块状（默认false）
 * @param: prefixIcon 前置图标
 * @param: suffixIcon 后置图标
 * @param: mode 文本样式mode 可选（text-普通文本(默认)，price-价格，phone-手机号，name-姓名，date-日期，link-超链接）
 * @param: href mode=='link'下的链接
 * @param: call mode==phone,点击文本是否拨打电话（默认false）
 * @param: decoration 是否显示下划线，中划线等，可选（none(默认),underline,line-through）
 * @param: iconStyle 图标样式 （默认 {fontSize: '16px'} ）
 * @param: lineHeight 文本行高
 * @param: align 文本对其方式，可选(left（默认）|center|right)
 * @param: wordWrap 文字换行，可选(break-word|normal（默认）|anywhere)
 * @param: margin 外边距，与原生外边距设置相同
 * @param: format 格式化规则
 * @param: openType 小程序的打开方式
 * @param: otherstyle 其他样式
 * @param://以下为button开放功能，详情查看官网openType
  lang?: string
  sessionFrom?: string
  sendMessageTitle?: string
  sendMessagePath?: string
  sendMessageImg?: string
  showMessageCard?: boolean
  appParameter?: string
  formType?: string
 *
 * @event: click 点击文本
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */
interface PropsType {
  show?: boolean // 是否显示内容（默认true）
  text: string // 文本内容
  type?: string // 颜色设置主题色
  color?: string // 文本颜色（默认#1a1a1a）
  size?: number | string // 文本大小（默认16）
  lines?: number | string // 文本显示行数，超出显示省略号
  bold?: boolean // 文本是否粗体（默认false）
  block?: boolean // 文本是否块状（默认false）
  prefixIcon?: string // 前置图标
  suffixIcon?: string // 后置图标
  mode?: 'text' | 'price' | 'phone' | 'name' | 'date' | 'link' // 文本样式mode 可选
  href?: string // mode=='link'下的链接
  call?: boolean // mode==phone,点击文本是否拨打电话（默认false）
  decoration?: 'none' | 'underline' | 'line-through' // 是否显示下划线，中划线等
  iconStyle?: object // 图标样式 （默认 {fontSize: '16px'} ）
  lineHeight?: number | string // 文本行高
  align?: 'left' | 'center' | 'right' // 文本对其方式
  wordWrap?: 'break-word' | 'normal' | 'anywhere' // 文字换行
  margin?: string | number | object // 外边距，与原生外边距设置相同
  format?: string | Function // 格式化规则,设为'encrypt'为脱敏
  openType?: string // 小程序的打开方式
  otherstyle?: object // 其他样式
  //以下为button开放功能
  lang?: string
  sessionFrom?: string
  sendMessageTitle?: string
  sendMessagePath?: string
  sendMessageImg?: string
  showMessageCard?: boolean
  appParameter?: string
  formType?: string
}

interface EmitsType {
  (e: 'click'): void
  (e: 'getphonenumber', data: any): any
  (e: 'getuserinfo', data: any): any
  (e: 'error', data: any): any
  (e: 'contact', data: any): any
  (e: 'opensetting', data: any): any
  (e: 'launchapp', data: any): any
}

const props = withDefaults(defineProps<PropsType>(), {
  show: true,
  text: '',
  type: '',
  color: '#1a1a1a',
  size: 16,
  lines: '',
  bold: false,
  block: false,
  prefixIcon: '',
  suffixIcon: '',
  mode: 'text',
  href: '',
  call: false,
  decoration: 'none',
  iconStyle: () => ({
    fontSize: '16px',
  }),
  lineHeight: '',
  align: 'left',
  wordWrap: 'normal',
  margin: '0',
  format: '',
  openType: '',
})

const emits = defineEmits<EmitsType>()

const textStyle = computed(() => {
  let style = {
    margin: props.margin,
    justifyContent:
      props.align === 'left'
        ? 'flex-start'
        : props.align === 'center'
        ? 'center'
        : 'flex-end',
  } as any
  return style
})

const textContentStyle = computed<any>(() => {
  let style: any = {
    textDecoration: props.decoration,
    fontWeight: props.bold ? 'bold' : 'normal',
    wordWrap: props.wordWrap,
    fontSize: z.addUnit(props.size),
    display: !isNvue.value && props.block ? 'block' : '',
    color: props.type ? zColor.getTypeColor(props.type) : zColor.getTypeColor(props.color),
    lines: isNvue.value && props.lines ? props.lines : '',
    lineHeight: props.lineHeight ? z.addUnit(props.lineHeight) : '',
  }

  if (props.lines) {
    if (!isNvue.value) {
        style['display']= '-webkit-box !important'
        style['overflow']= 'hidden'
        style['text-overflow']= 'ellipsis'
        style['word-break']= 'break-all'
        style['-webkit-line-clamp']= props.lines
        style['-webkit-box-orient']= 'vertical !important'
    } else if (isNvue.value) {
     style.textOverflow='ellipsis'
     style.overflow= 'hidden'
      style.flex= '1'
    }
  }

  return z.deepMerge(style, props.otherstyle ? props.otherstyle : {})
})

/**
 * 判断是否是nvue
 */
const isNvue = computed(() => {
  // #ifdef APP-NVUE
  return true
  // #endif
  return false
})

/**
 * 判断是否是wx
 */
const isWx = computed(() => {
  // #ifdef MP_WEIXIN
  return true
  // #endif
  return false
})

/**
 * 处理显示的数据
 */
const showValue = computed(() => {
  // 价格
  if (props.mode === 'price') {
    // 如果text不为金额进行提示
    if (!/^\d+(\.\d+)?$/.test(props.text)) {
      console.log('text参数需要为金额格式')
    }
    // 进行格式化，判断用户传入的format参数为正则，或者函数，如果没有传入format，则使用默认的金额格式化处理
    if (zTest.func(props.format)) {
      // 如果用户传入的是函数，使用函数格式化
      return (props.format as Function)(props.text)
    }
    // 如果format非正则，非函数，则使用默认的金额格式化方法进行操作
    return z.priceFormat(props.text, 2)
  }
  if (props.mode === 'date') {
    // 判断是否合法的日期或者时间戳
    !zTest.date(props.text) &&
      console.log('日期模式下，text参数需要为日期或时间戳格式')
    // 进行格式化，判断用户传入的format参数为正则，或者函数，如果没有传入format，则使用默认的格式化处理
    if (zTest.func(props.format)) {
      // 如果用户传入的是函数，使用函数格式化
      return (props.format as Function)(props.text)
    }
    if (props.format) {
      // 如果format非正则，非函数，则使用默认的时间格式化方法进行操作
      return z.timeFormat(props.text, props.format as string)
    }
    // 如果没有设置format，则设置为默认的时间格式化形式
    return z.timeFormat(props.text, 'yyyy-mm-dd')
  }
  if (props.mode === 'phone') {
    // 判断是否合法的手机号
    // !zTest.mobile(text) && console.log('手机号模式下，text参数需要为手机号码格式')
    if (zTest.func(props.format)) {
      // 如果用户传入的是函数，使用函数格式化
      return (props.format as Function)(props.text)
    }
    if (props.format === 'encrypt') {
      // 如果format为encrypt，则将手机号进行星号加密处理
      return `${props.text.substring(0, 3)}****${props.text.substring(7)}`
    }
    return props.text
  }
  if (props.mode === 'name') {
    // 判断是否合法的字符粗
    !(typeof props.text === 'string') &&
      console.log('姓名模式下，text参数需要为字符串格式')
    if (zTest.func(props.format)) {
      // 如果用户传入的是函数，使用函数格式化
      return (props.format as Function)(props.text)
    }
    if (props.format === 'encrypt') {
      // 如果format为encrypt，则将姓名进行星号加密处理
      return z.formatName(props.text)
    }
    return props.text
  }
  if (props.mode === 'link') {
    // 判断是否合法的字符粗
    !zTest.url(props.href) && console.log('href参数需要为URL')
    return props.text
  }
  return props.text
})

function clickText() {
  if (props.call && props.mode === 'phone') {
    uni.makePhoneCall({
      phoneNumber: props.text,
    })
  }
  emits('click')
}

function getphonenumber(res: any) {
  emits('getphonenumber', res)
}
function getuserinfo(res: any) {
  emits('getuserinfo', res)
}
function error(res: any) {
  emits('error', res)
}
function contact(res: any) {
  emits('contact', res)
}
function opensetting(res: any) {
  emits('opensetting', res)
}
function launchapp(res: any) {
  emits('launchapp', res)
}
</script>

<template>
  <div
    class="dfr aic fwn f1"
    v-if="props.show"
    @tap="clickText"
    :style="textStyle"
  >
    <text class="" v-if="mode === 'price'" :style="textContentStyle">￥</text>
    <div v-if="props.prefixIcon">
      <zIcon :name="prefixIcon" :otherStyle="props.iconStyle"></zIcon>
    </div>
    <zLink
      v-if="mode === 'link'"
      :text="showValue"
      :href="href"
      underLine
    ></zLink>
    <button
      v-else-if="props.openType && isWx"
      class="z-reset-button df fww toe"
      style="font-size: 16px; color: #1a1a1a"
      :style="textContentStyle"
      :openType="props.openType"
      @getuserinfo="getuserinfo"
      @contact="contact"
      @getphonenumber="getphonenumber"
      @error="error"
      @launchapp="launchapp"
      @opensetting="opensetting"
      :lang="props.lang"
      :session-from="props.sessionFrom"
      :send-message-title="props.sendMessageTitle"
      :send-message-path="props.sendMessagePath"
      :send-message-img="props.sendMessageImg"
      :show-message-card="props.showMessageCard"
      :app-parameter="props.appParameter"
    >
      {{ showValue }}
    </button>
    <text v-else class="df fww aic toe" :style="textContentStyle">
      {{ showValue }}
    </text>
    <div v-if="props.suffixIcon">
      <zIcon :name="prefixIcon" :otherStyle="props.iconStyle"></zIcon>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-reset-button {
  padding: 0;
  background-color: transparent;

  /* #ifndef APP-PLUS */
  font-size: inherit;
  line-height: inherit;
  color: inherit;
  /* #endif */
  border-width: 0;
}
button::after{
  border:none
}

/* #ifndef APP-NVUE */
.u-reset-button::after {
  border: none;
}
/* #endif */
</style>
