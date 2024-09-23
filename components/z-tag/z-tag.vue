<!--
 * @Description: z-tag 标签组件
 * @Author: ZGGUI & ui.zggui.cn & zggamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import { ref, onMounted, getCurrentInstance, computed } from 'vue'
import type { Ref } from 'vue'
import z from '@/ZGGUI/libs/z'
import zTest from '@/ZGGUI/libs/zTest'
import zTransition from '@/ZGGUI/components/z-transition/z-transition.vue'
import zIcon from '@/ZGGUI/components/z-icon/z-icon.vue'

import { propsHook, PropsTypeHook, openPage } from '@/ZGGUI/libs/zHooks'
import zColor from '@/ZGGUI/libs/zColor'

/**
 * @description: z-tag 标签组件传参
 * @param: show 是否显示标签
 * @param: icon 内容前方图标
 * @param: title 标签内容
 * @param: bgColor 背景颜色（默认''）
 * @param: color 内容颜色（默认''）
 * @param: size 标签大小(可选large ，normal（默认），small)
 * @param: radius 边框弧度（默认3px）
 * @param: type 主题色（可选info、primary（默认）、success、warning、error）
 * @param: disabled 是否不可用（默认false）
 * @param: plain 是否镂空
 * @param: plainFill 镂空是否填充颜色（默认false）
 * @param: plainBorderColor 镂空时边框颜色
 * @param: canclose 是否可以关闭，右上角关闭按钮
 * @param: closeColor 关闭按钮颜色（默认#c7c7c7）
 *
 * @event: click 点击列表触发（disabled时无效）
 * @event: close 点击关闭按钮触发（disabled时无效）
 * @tutorial: ZGGUI & ui.zggui.cn & zggamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  show?: boolean
  icon?: string
  title?: string
  bgColor?: string
  color?: string
  size?: 'large' | 'normal' | 'small'
  radius?: number | string
  type?: 'info' | 'primary' | 'success' | 'warning' | 'error'
  disabled?: boolean
  plain?: boolean
  plainFill?: boolean
  plainBorderColor?: string
  canclose?: boolean
  closeColor?: string
}

interface EmitsType {
  (e: 'click'): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  show: false,
  type: 'primary',
  size: 'normal',
  radius: '3px',
  disabled: false,
  plain: false,
  canclose: false,
  closeColor: '#c6c6c6',
})

const emits = defineEmits<EmitsType>()

const zTagStyle = computed(() => {
  let style = {
    borderRadius: z.addUnit(props.radius),
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: props.plainBorderColor
      ? props.plainBorderColor
      : zColor.getTypeColor(props.type),
    padding: '0 10px',
  }
  return style
})

const zTagCloseStyle = computed(() => {
  let style = {
    backgroundColor: props.closeColor,
    width: '21px',
    height: '21px',
  }
  if (props.size) {
    switch (props.size) {
      case 'large': {
        style.width = '24px'
        style.height = '24px'
        break
      }
      case 'normal': {
        style.width = '21px'
        style.height = '21px'
        break
      }
      case 'small': {
        style.width = '18px'
        style.height = '18px'
        break
      }
    }
  }
  return style
})

const zTagImageStyle = computed(() => {
  let style = {
    width:
      props.size === 'large'
        ? '18px'
        : props.size === 'normal'
        ? '16px'
        : '14px',
    height: 'same-as-width',
  }
  return style
})

const zTagIconStyle = computed(() => {
  let style = {
    fontSize:
      props.size === 'large'
        ? '18px'
        : props.size === 'normal'
        ? '16px'
        : '14px',
    color: props.plain ? zColor.getTypeColor(props.type) : '#fff',
  }
  return style
})

const zTagTextStyle = computed(() => {
  let style = {
    fontSize:
      props.size === 'large'
        ? '16px'
        : props.size === 'normal'
        ? '14px'
        : '12px',
    color: props.color ? props.color : '',
    padding: '1px 2px',
    backgroundColor: '',
  }
  style.color = props.plain ? zColor.getTypeColor(props.type) : '#fff'
  return style
})

function clickClose(e: Event) {
  if (props.disabled) return
  emits('close')
}

function clickTag(e: Event) {
  if (props.disabled) return
  emits('click')
}
</script>

<template>
  <zTransition :show="props.show">
    <div class="pr" style="display: inline-block">
      <div
        class="dfr aic"
        :class="
          props.plain
            ? props.plainFill
              ? 'bg' + props.type.substring(0, 1) + '1'
              : '#fff'
            : 'bg' + props.type.substring(0, 1) + '5'
        "
        :style="zTagStyle"
        id="z-tag"
        ref="z-tag"
        @tap.stop="clickTag"
      >
        <slot name="icon">
          <div style="margin-right: 4px" v-if="props.icon">
            <image
              v-if="zTest.image(props.icon)"
              :src="props.icon"
              :style="zTagImageStyle"
            ></image>
            <zIcon
              v-else
              :name="props.icon"
              :otherStyle="zTagIconStyle"
            ></zIcon>
          </div>
        </slot>
        <text :style="zTagTextStyle">
          {{ props.title }}
        </text>
      </div>
      <div
        :style="zTagCloseStyle"
        class="z-tag-close pa dfr aic jcc"
        v-if="props.canclose"
        @tap.stop="clickClose"
      >
        <zIcon name="cuowu" color="#fff"></zIcon>
      </div>
    </div>
  </zTransition>
</template>

<style lang="less" scoped>
.z-tag-close {
  z-index: 200;
  top: 0px;
  right: 0px;
  border-radius: 100px;
  /* #ifndef APP-NVUE */
  transform: scale(0.6) translate(80%, -80%);
  /* #endif */
  /* #ifdef APP-NVUE */
  transform: scale(0.6) translate(50%, -50%);
  /* #endif */
}
</style>
