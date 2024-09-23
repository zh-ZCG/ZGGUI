<!--
 * @Description: z-button 按钮组件
 * @Author: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import { ref, getCurrentInstance, watch, computed } from 'vue'
import type { Ref, PropType } from 'vue'
import z from '../../libs/z'
import zColor from '../../libs/zColor'
import zLoadingIcon from '../../components/z-loading-icon/z-loading-icon.vue'
import zIcon from '../../components/z-icon/z-icon.vue'

/**
 * @description: z-button 按钮组件传参
 * @param: type 按钮的样式，可选success warning error info(默认) primary
 * @param: disabled 禁用（默认false）
 * @param: hairline 按钮是否使用0.5px细边框（默认false）
 * @param: border 按钮边框弧度(默认5px,与原生button相同)
 * @param: size  按钮尺寸大小，large normal(默认) mini
 * @param: height  按钮高度，（不传默认size）
 * @param: width  按钮宽度，（不传默认size）
 * @param: plain 按钮是否镂空处理，背景颜色透明（默认false）
 * @param: loading 按钮左边是否有加载图标（默认false）
 * @param: text					按钮文字
 * @param: color				按钮颜色，支持传入linear-gradient渐变
 * @param: icon					按钮图标
 * @param: iconColor		按钮图标颜色
 * @param: loadingMode 加载中的图标类型 可选flower(默认) circle semicircle
 * @param: loadingSize 加载中的图标大小,默认16
 * @param: loadingText 加载中的文字，(默认'加载中')
 * @param: openType 开放能力 请查看uniapp button open-type部分
 * @param: formType 用于 <form> 组件，点击分别会触发 <form> 组件的 submit/reset 事件
 * @param: appParameter	打开 APP 时，向 APP 传递的参数，open-type=launchApp时有效 （注：只微信小程序、QQ小程序有效）
 * @param: hoverStopPropagation	指定是否阻止本节点的祖先节点出现点击态，微信小程序有效（默认 true ）
 * @param: lang	指定返回用户信息的语言，zh_CN 简体中文，zh_TW 繁体中文，en 英文（默认 en ）
 * @param: sessionFrom	会话来源，openType="contact"时有效
 * @param: sendMessageTitle	会话内消息卡片标题，openType="contact"时有效
 * @param: sendMessagePath	会话内消息卡片点击跳转小程序路径，openType="contact"时有效
 * @param: sendMessageImg	会话内消息卡片图片，openType="contact"时有效
 * @param: showMessageCard	是否显示会话内消息卡片，设置此参数为 true，用户进入客服会话会在右下角显示"可能要发送的小程序"提示，用户点击后可以快速发送小程序消息，openType="contact"时有效（默认false）
 * @param: dataName		额外传参参数，用于小程序的data-xxx属性，通过target.dataset.name获取
 * @param: throttleTime		节流，一定时间内只能触发一次 （默认 0 ，单位ms)
 * @param: hoverStartTime		按住后多久出现点击态（默认 0 ，单位ms)
 * @param: hoverStayTime	手指松开后点击态保留时间 （默认 200 ，单位ms)
 * @param: otherStyle 其他样式
 *
 * @event: click 非禁止非加载可触发
 * @event:  getphonenumber	open-type="getPhoneNumber"时有效
 * @event:	getuserinfo		用户点击该按钮时，会返回获取到的用户信息，从返回参数的detail中获取到的值同uni.getUserInfo
 * @event:	error			当使用开放能力时，发生错误的回调
 * @event:	opensetting		在打开授权设置页并关闭后回调
 * @event:	launchapp		打开 APP 成功的回调
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */
interface PropsType {
  type?: string
  disabled?: boolean
  hairline?: boolean
  border?: number | string
  size?: string
  height?: string | number
  width?: string | number
  plain?: boolean
  text?: string
  color?: string
  icon?: string
  iconColor?: string
  loading?: boolean
  loadingMode?: string
  loadingSize?: number
  loadingText?: string
  openType?: string
  formType?: string
  appParameter?: string
  hoverStopPropagation?: boolean
  lang?: string
  sessionFrom?: string
  sendMessageTitle?: string
  sendMessagePath?: string
  sendMessageImg?: string
  showMessageCard?: boolean
  dataName?: string
  throttleTime?: number
  hoverStartTime?: number
  hoverStayTime?: number
  otherStyle?: object
}

interface EmitsType {
  (e: 'click'): void
  (e: 'getphonenumber', data: any): any
  (e: 'getuserinfo', data: any): any
  (e: 'error', data: any): any
  (e: 'opensetting', data: any): any
  (e: 'launchapp', data: any): any
}

const props = withDefaults(defineProps<PropsType>(), {
  type: 'info',
  disabled: false,
  hairline: false,
  border: 5,
  size: 'normal',
  plain: false,
  text: '按钮',
  icon: '',
  iconColor: '',
  loading: false,
  loadingMode: 'flower',
  loadingSize: 16,
  loadingText: '加载中',
  openType: '',
  formType: '',
  appParameter: '',
  hoverStopPropagation: true,
  lang: 'en',
  sessionFrom: '',
  sendMessageTitle: '',
  sendMessagePath: '',
  sendMessageImg: '',
  showMessageCard: false,
  dataName: '',
  throttleTime: 0,
  hoverStartTime: 0,
  hoverStayTime: 200,
})

const emits = defineEmits<EmitsType>()

const zButtonColorStyle = computed(() => {
  let style = {} as any
  if (props.color) {
    if (props.plain) {
      style.backgroundColor = '#fff'
      style.color = props.color
    } else {
      style.color = '#fff'
      style.backgroundColor = props.color
    }
    if (props.color.indexOf('gadient') !== -1) {
      style.borderTopWidth = 0
      style.borderRightWidth = 0
      style.borderBottomWidth = 0
      style.borderLeftWidth = 0
      if (!props.plain) {
        style.backgroundImage = props.color
      }
    } else {
      style.borderColor = props.color
      style.borderWidth = '1px'
      style.borderStyle = 'solid'
    }
  }
  return style
})

const zButtonStyle = computed(() => {
  let style = {
    height: '40px',
    padding: 0,
    backgroundColor: 'transparent',

    /* #ifndef APP-NVUE */
    boxSizing: 'border-box',
    /* #endif */
    /* #ifndef APP-PLUS */
    fontSize: 'inherit',
    lineHeight: props.height ? props.height : 'inherit',
    color: 'inherit',
    /* #endif */
    /* #ifdef APP-NVUE */
    borderWidth: 1,
    /* #endif */
  } as any
  style.borderRadius = z.addUnit(props.border)
  style.opacity = props.disabled ? 0.5 : 1
  style.backgroundColor = props.plain ? '#fff' : zColor.getTypeColor(props.type)
  style.borderWidth = props.hairline ? '0.5px' : '1px'
  switch (props.size) {
    case 'large': {
      /* #ifndef APP-NVUE */
      style.width = '100%'
      /* #endif */
      style.height = '50px'
      style.padding = '0 15px'
      break
    }
    case 'normal': {
      /* #ifndef APP-NVUE */
      style.minWidth = '70px'
      /* #endif */
      style.padding = '0 12px'
      style.fontSize = '14px'
      break
    }
    case 'small': {
      /* #ifndef APP-NVUE */
      style.minWidth = '60px'
      /* #endif */
      style.height = '30px'
      style.padding = '0px 8px'
      style.fontSize = '12px'
      break
    }
    case 'mini': {
      style.height = '22px'
      style.fontSize = '10px'
      /* #ifndef APP-NVUE */
      style.minWidth = '50px'
      /* #endif */
      style.padding = '0px 8px'
      break
    }
    default: {
      style.padding = '0 12px'
      style.fontSize = '14px'
      break
    }
  }
  if (props.height) {
    style.height = z.addUnit(props.height)
  }
  if (props.width) {
    style.width = z.addUnit(props.width)
  }
  console.log(style)
  return z.deepMerge(style, props.otherStyle ? props.otherStyle : {})
})

const loadingColor = computed(() => {
  if (props.plain) {
    return props.color ? props.color : zColor.getTypeColor(props.type)
  }
  return '#C8C8C8'
})

const iconColor = computed(() => {
  /**镂空有color用color否则用主题 */
  if (props.iconColor) return props.iconColor
  if (props.plain) {
    return props.color ? props.color : zColor.getTypeColor(props.type)
  } else {
    return props.type == 'info' ? '#000000' : '#ffffff'
  }
})

const loadingTextStyle = computed(() => {
  let style = {
    fontSize: '16px',
    marginLeft: '4px',
  }
  style.fontSize = z.addUnit(textSize.value)
  return style
})

const textSize = computed(() => {
  let fontSize = 16
  switch (props.size) {
    case 'large': {
      fontSize = 18
      break
    }
    case 'normal': {
      fontSize = 16
      break
    }
    case 'small': {
      fontSize = 14
      break
    }
    case 'mini': {
      fontSize = 12
      break
    }
  }
  return fontSize
})

const nvueTextStyle = computed(() => {
  let style = {
    color: '',
    fontSize: '16px',
    marginLeft: '0px',
  }
  if (props.color) {
    style.color = props.plain ? props.color : '#fff'
  }
  style.fontSize = z.addUnit(textSize.value)
  if (props.plain) {
    style.color = props.color ? props.color : zColor.getTypeColor(props.type)
  } else {
    style.color = props.type == 'info' ? '#1a1a1a' : '#ffffff'
  }
  if (props.icon) {
    style.marginLeft = '2px'
  }
  return style
})

function clickButton() {
  /**
   * 非禁止非加载可触发
   */
  if (!props.disabled && !props.loading) {
    // 进行节流控制，每this.throttle毫秒内，只在开始处执行
    z.throttle(() => {
      emits('click')
    }, props.throttleTime)
  }
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
function opensetting(res: any) {
  emits('opensetting', res)
}
function launchapp(res: any) {
  emits('launchapp', res)
}
</script>

<template>
  <!-- #ifndef APP-NVUE -->
  <button
    class="pr dfr jcc aic z-button"
    :style="z.deepMerge(zButtonStyle, zButtonColorStyle)"
    :class="props.plain ? 'z-button-type-' + props.type : ''"
    :hover-class="!props.disabled && !props.loading ? 'z-button-active' : ''"
    :hover-start-time="Number(hoverStartTime)"
    :hover-stay-time="Number(hoverStayTime)"
    :form-type="formType"
    :open-type="openType"
    :app-parameter="appParameter"
    :hover-stop-propagation="hoverStopPropagation"
    :send-message-title="sendMessageTitle"
    :send-message-path="sendMessagePath"
    :lang="lang"
    :data-name="dataName"
    :session-from="sessionFrom"
    :send-message-img="sendMessageImg"
    :show-message-card="showMessageCard"
    @tap="clickButton"
    @getphonenumber="getphonenumber"
    @getuserinfo="getuserinfo"
    @error="error"
    @opensetting="opensetting"
    @launchapp="launchapp"
  >
    <template v-if="props.loading">
      <zLoadingIcon
        :mode="loadingMode"
        :size="loadingSize * 1.15"
        :color="loadingColor"
      ></zLoadingIcon>
      <text :style="loadingTextStyle">
        {{ loadingText || text }}
      </text>
    </template>
    <template v-else>
      <zIcon
        v-if="icon"
        :name="icon"
        :color="iconColor"
        :size="textSize * 1.35"
        :otherStyle="{ marginRight: '2px' }"
      ></zIcon>
      <slot>
        <text :style="{ fontSize: textSize + 'px' }">
          {{ text }}
        </text>
      </slot>
    </template>
  </button>
  <!-- #endif -->

  <!-- #ifdef APP-NVUE -->
  <div
    class="pr dfr jcc aic"
    :style="z.deepMerge(zButtonStyle, zButtonColorStyle)"
    :hover-class="!props.disabled && !props.loading ? 'z-button-active' : ''"
    :class="props.plain ? 'z-button-type-' + props.type : ''"
    :hover-start-time="Number(hoverStartTime)"
    :hover-stay-time="Number(hoverStayTime)"
    @tap="clickButton"
  >
    <template v-if="props.loading">
      <zLoadingIcon
        :mode="loadingMode"
        :size="loadingSize * 1.15"
        :color="loadingColor"
      ></zLoadingIcon>
      <text :style="z.deepMerge(nvueTextStyle, loadingTextStyle)">
        {{ loadingText || text }}
      </text>
    </template>
    <template v-else>
      <zIcon
        v-if="icon"
        :name="icon"
        :color="iconColor"
        :size="textSize * 1.35"
      ></zIcon>
      <text class="u-button__text" :style="nvueTextStyle">
        {{ text }}
      </text>
    </template>
  </div>
  <!-- #endif -->
</template>

<style lang="less" scoped>
.z-button {
  width: fit-content;
  line-height: 2.55555556;
  overflow: hidden;
  transition: all 0.3 ease-in-out;
  /* #ifndef APP-NVUE */
  ::after {
    border: 'none';
  }
  /* #endif */
}
.z-button-active {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.2) !important;
  // border-radius: 5px !important;
  // opacity: 0.5 !important;
}
.z-button-type-primary {
  border-width: 1px;
  border-style: solid;
  border-color: @primary;
}
.z-button-type-info {
  border-width: 1px;
  border-style: solid;
  border-color: @info;
}
.z-button-type-success {
  border-width: 1px;
  border-style: solid;
  border-color: @success;
}
.z-button-type-error {
  border-width: 1px;
  border-style: solid;
  border-color: @error;
}
.z-button-type-warning {
  border-width: 1px;
  border-style: solid;
  border-color: @warning;
}
</style>
