<!--
 * @Description: z-avatar 头像组件
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
} from 'vue'
import z from '../../libs/z'
import zMath from '../../libs/zMath'
import zColor from '../../libs/zColor'
import zText from '../../components/z-text/z-text.vue'
import zIcon from '../../components/z-icon/z-icon.vue'
import { zImage, isImage } from '../../libs/types/zImage'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
/**
 * @description: z-avatar 头像组件传参
 * @param: src 头像路径（绝对路径），默认显示默认头像
 * @param: text		 文字代替图片，优先级高于src
 * @param: shape		头像形状  （ circle (默认) | square）
 * @param: size  头像大小（默认40）
 * @param: mode   图片裁剪类型，与image标签的属性一致
 * @param: bgColor 背景颜色（默认'#666666'）
 * @param: color   文字颜色（默认'#fff）
 * @param: fontSize		文字大小（默认16px）
 * @param: icon		图标
 * @param: mpAvatar		是否显示小程序头像（默认false）(注意，此功能被回收了展示的是灰色头像)
 * @param: randomBgColor		是否使用随机背景颜色（默认false）
 * @param: defaultUrl		加载失败的默认头像
 * @param: otherStyle 其他的样式
 *
 * @event: click 点击触发
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  src?: string
  text?: string
  shape?: 'circle' | 'square'
  size?: string | number
  mode?: zImage['mode']
  bgColor?: string
  color?: string
  fontSize?: string | number
  icon?: string
  mpAvatar?: boolean
  randomBgColor?: boolean
  defaultUrl?: string
}

interface EmitsType {
  (e: 'click'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  src: '',
  text: '',
  shape: 'circle',
  size: 40,
  mode: 'scaleToFill',
  bgColor: '#666666',
  color: '#ffffff',
  fontSize: 16,
  icon: '',
  mpAvatar: false,
  randomBgColor: false,
  defaultUrl: '',
})

const emits = defineEmits<EmitsType>()

onMounted(() => {
  // #ifdef MP-WEIXIN || MP-QQ || MP-BAIDU
  isMP.value = true
  // #endif
})

/**
 * 给randomBgColor为true时配置的颜色数组，会从这里面随机选择
 */
const colorArray = ref<string[]>([
  '#FFA07A',
  '#FF7F50',
  '#FF69B4',
  '#DB7093',
  '#DA70D6',
  '#BA55D3',
  '#9370DB',
  '#87CEFA',
  '#87CEEB',
  '#7B68EE',
  '#6A5ACD',
  '#4682B4',
  '#5F9EA0',
  '#66CDAA',
  '#8FBC8F',
  '#20B2AA',
  '#48D1CC',
  '#40E0D0',
  '#AFEEEE',
  '#E0FFFF',
])

const avatarUrl = ref<string>(props.src)

/**
 * 默认base64图像
 */
const base64Avartar = ref<string>(
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAMAAAAOusbgAAAASFBMVEX09Pby8vTe3uDPz9DJycm/v8C9vb3BwcLLy8vR0dLp6evn5+i1tbWysrLb29zu7vDNzc7r6+26urrg4OG3t7fj4+TFxcbV1dY8QE/jAAABo0lEQVRo3u2Yi3KCMBBFCY8EIWs0Iv7/n7Y4djqFZEXCTVtnzw+cYZfsqygEQRAEQRAEQRCEt0OVVd1o0x66rNq+tvRFc8ymdSf6gTnn8XaeZthLDm8/0JIM5s5SiCvaq3TQS96BxRVFaLHeM0XBPuhTXAz9ZGfjYkJm+ch4CVnBak5cA8UDJx5wXkUsCiY+82Jcr+h5cf9+4o4X42qX48XACsIVLrI4b6E5sQaKW06M7BIlJy6BYsUk2eIKV8EMIEQV0lu4aJsYwENXtCPD9wkT9hq0NzJX2wy72/FXAj0xLr1jDm9g1LToNeLBYS4+5PEu23Kuq8Bi5oMWy78gvs7F8OX4QTMXN3m8gY3xlEHrgvtTDX/JF09BPPb80o0UZQSO1cw94J5pTLzVzdIT7A3wokv/THtP9d6jZm/WaCfMnquba9dqJ9rdUv08ufNU7xPl5jXtRLNDvG+vaydSP1qN27yf9STpZanVP/MSk2LeGOf0aG/4r75J6dKrqlUML+L/INYp4pQrUJUiTrlNqEr7jegq15gvCIIgCIIgCIIg7M4HkS5rj/A3dbUAAAAASUVORK5CYII='
)

/**
 * 是否是小程序变量
 */
const isMP = ref<boolean>(false)

const imageStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {
    width: z.addUnit(props.size),
    height: z.addUnit(props.size),
  }
  return style
})

watch(
  () => props.src,
  (newVal) => {
    avatarUrl.value = newVal
    if (!newVal) {
      errorHandler()
    }
  },
  {
    immediate: true,
  }
)

/**图片加载失败替换 */
function errorHandler() {
  avatarUrl.value = props.defaultUrl || base64Avartar.value
}

function clickAvatar() {
  emits('click')
}
</script>

<template>
  <div
    class="df jcc aic z-avatar"
    :class="[`z-avatar-${shape}`]"
    :style="[
      {
        backgroundColor:
          text || icon
            ? randomBgColor
              ? colorArray[zMath.random(0, 19)]
              : bgColor
            : 'transparent',
        width: z.addUnit(size),
        height: z.addUnit(size),
      },
      z.addStyle(otherStyle),
    ]"
    @tap="clickAvatar"
  >
    <slot>
      <!-- #ifdef MP-WEIXIN || MP-QQ || MP-BAIDU  -->
      <open-data
        v-if="mpAvatar && isMP"
        :class="[`z-avatar-image-${shape}`]"
        type="userAvatarUrl"
        :style="[
          {
            width: z.addUnit(size),
            height: z.addUnit(size),
          },
        ]"
      />
      <!-- #endif -->
      <!-- #ifndef MP-WEIXIN && MP-QQ && MP-BAIDU  -->
      <template v-if="mpAvatar && isMP"></template>
      <!-- #endif -->
      <zIcon
        v-else-if="icon"
        :name="icon"
        :size="fontSize"
        :color="color"
      ></zIcon>
      <zText
        v-else-if="text"
        :text="text"
        :size="fontSize"
        :color="color"
        :align="'center'"
        otherStyle="justify-content: center"
      ></zText>
      <image
        class="z-avatar-image"
        v-else
        :class="[`z-avatar-image-${shape}`]"
        :src="avatarUrl || defaultUrl"
        :mode="mode"
        @error="errorHandler"
        :style="imageStyle"
      ></image>
    </slot>
  </div>
</template>

<style lang="less" scoped>
.z-avatar {
}
.z-avatar-circle {
  border-radius: 100px;
}
.z-avatar-square {
  border-radius: 4px;
}
.z-avatar-image {
}
.z-avatar-image-circle {
  border-radius: 100px;
}
.z-avatar-image-square {
  border-radius: 4px;
}
</style>
