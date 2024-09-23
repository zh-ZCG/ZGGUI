<!--
 * @Description: z-cell 单元格组件
 * @Author: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import { ref, onMounted, getCurrentInstance, computed } from 'vue'
import type { Ref } from 'vue'
import z from '../../libs/z'
import zLine from '../../components/z-line/z-line.vue'
import zIcon from '../../components/z-icon/z-icon.vue'
import zTest from '../../libs/zTest'
import { propsHook, PropsTypeHook, openPage } from '../../libs/zHooks'

/**
 * @description: z-cell 单元格组件传参
 * @param: leftIcon 单元格左侧图标
 * @param: leftIconStyle 单元格左侧图标样式
 * @param: title 单元格主要内容
 * @param: titleStyle 单元格主要内容样式
 * @param: detail 单元格主要内容解释（小字号，位于value下方）
 * @param: rightValue 单元格右侧提示
 * @param: rightIcon 单元格右侧图标（默认'jiantouyou'右箭头）
 * @param: rightIconStyle 单元格右侧图标样式
 * @param: disabled 是否禁用（默认false）
 * @param: border 是否显示下边框(默认true)
 * @param: linkType 公共方法跳转方式(默认'navigateTo')
 * @param: url 跳转url地址 (传入则调用公共方法进行跳转)
 * @param: size 单元格尺寸 （large normal(默认) small）
 * @param: canfeedBack 是否开启点击反馈(默认false)
 * @param: stop 是否阻止默认事件传递（默认true）
 * @param: otherStyle 其他外部样式
 *
 * @event: click 点击列表触发（disabled时无效）
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  leftIcon?: string
  leftIconStyle?: object
  title?: string
  titleStyle?: object
  detail?: string
  rightValue?: string
  rightIcon?: string
  rightIconStyle?: object
  disabled?: boolean
  border?: boolean
  size?: 'large' | 'normal' | 'small'
  canfeedBack?: boolean
  stop?: boolean
}

interface EmitsType {
  (e: 'click'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  title: '',
  detail: '',
  rightValue: '',
  leftIcon: '',
  disabled: false,
  border: true,
  canfeedBack: false,
  rightIcon: 'jiantouyou',
  size: 'normal',
  stop: true,
})

const emits = defineEmits<EmitsType>()

const cellStyle = computed(() => {
  let style = {
    padding: '2px 15px',
    fontSize: '16px',
    color: '#1a1a1a',
  } as any
  if (props.size) {
    switch (props.size) {
      case 'large': {
        style.paddingTop = '8px'
        style.paddingBottom = '8px'
        break
      }
      case 'normal': {
        style.paddingTop = '6px'
        style.paddingBottom = '6px'
        break
      }
      case 'small': {
        style.paddingTop = '4px'
        style.paddingBottom = '4px'
        break
      }
    }
  }

  return z.deepMerge(style, props.otherStyle)
})

const cellTitleStyle = computed(() => {
  let style = {
    padding: '2px 15px',
    fontSize: '16px',
    color: '#1a1a1a',
  } as any
  if (props.size) {
    switch (props.size) {
      case 'large': {
        style.paddingTop = '8px'
        style.paddingBottom = '8px'
        style.fontSize = '16px'
        break
      }
      case 'normal': {
        style.paddingTop = '6px'
        style.paddingBottom = '6px'
        style.fontSize = '14px'
        break
      }
      case 'small': {
        style.paddingTop = '4px'
        style.paddingBottom = '4px'
        style.fontSize = '12px'
        break
      }
    }
  }
  if (props.disabled) {
    style.color = '#c8c8c8'
  }

  return z.deepMerge(style, props.titleStyle ? props.titleStyle : {})
})

const cellDetailStyle = computed(() => {
  let style = {
    padding: '2px 15px',
    fontSize: '12px',
    color: '#909399',
  } as any
  if (props.size) {
    switch (props.size) {
      case 'large': {
        style.paddingTop = '8px'
        style.paddingBottom = '8px'
        style.fontSize = '14px'
        break
      }
      case 'normal': {
        style.paddingTop = '6px'
        style.paddingBottom = '6px'
        style.fontSize = '12px'
        break
      }
      case 'small': {
        style.paddingTop = '4px'
        style.paddingBottom = '4px'
        style.fontSize = '10px'
        break
      }
    }
  }
  if (props.disabled) {
    style.color = '#c8c8c8'
  }

  return style
})

const cellRightValueStyle = computed(() => {
  let style = {
    fontSize: '14px',
    color: '#909399',
  } as any
  if (props.size) {
    switch (props.size) {
      case 'large': {
        style.fontSize = '16px'
        break
      }
      case 'normal': {
        style.fontSize = '14px'
        break
      }
      case 'small': {
        style.fontSize = '12px'
        break
      }
    }
  }
  if (props.disabled) {
    style.color = '#c8c8c8'
  }

  return style
})

function clickCell(e: Event) {
  if (props.disabled) return
  emits('click')
  openPage(props.url, props.linkType)
}
</script>

<template>
  <div
    class="dfc aic"
    :class="[props.otherClass]"
    :style="[props.otherStyle]"
    ref="z-cell"
    id="z-cell"
    :hover-class="
      !props.disabled && props.canfeedBack ? 'z-cell-canfeedBack' : ''
    "
    :hover-stay-time="250"
    v-if="props.stop"
    @tap.stop="clickCell"
  >
    <div class="dfr jcc aic f1" :style="cellStyle">
      <div class="dfr aic f1">
        <div
          v-if="$slots.leftIcon || props.leftIcon"
          class="df aic"
          style="font-size: 16px"
        >
          <slot name="leftIcon" v-if="$slots.leftIcon"></slot>
          <zIcon
            v-else-if="props.leftIcon"
            :name="props.leftIcon"
            :otherStyle="props.leftIconStyle"
            :size="
              props.size === 'large' ? 22 : props.size === 'small' ? 14 : 18
            "
          ></zIcon>
        </div>
        <div class="dfc f1">
          <slot name="title">
            <text v-if="props.title" :style="cellTitleStyle">
              {{ props.title }}
            </text>
          </slot>
          <slot name="detail">
            <text :style="cellDetailStyle" v-if="props.detail">
              {{ props.detail }}
            </text>
          </slot>
        </div>
      </div>
      <slot name="rightValue">
        <text
          class="tar"
          :style="cellRightValueStyle"
          v-if="!zTest.empty(props.rightValue)"
        >
          {{ props.rightValue }}
        </text>
      </slot>
      <div
        v-if="$slots.rightIcon || props.rightIcon"
        class="df aic"
        style="font-size: 16px; margin-left: 4px"
      >
        <slot name="rightIcon" v-if="$slots.rightIcon"></slot>
        <zIcon
          v-else
          :name="props.rightIcon"
          :otherStyle="props.rightIconStyle"
          :size="props.size === 'large' ? 22 : props.size === 'small' ? 14 : 18"
        ></zIcon>
      </div>
    </div>
  </div>
  <div
    class="dfc aic"
    :class="[props.otherClass]"
    :style="[props.otherStyle]"
    ref="z-cell"
    id="z-cell"
    :hover-class="
      !props.disabled && props.canfeedBack ? 'z-cell-canfeedBack' : ''
    "
    :hover-stay-time="250"
    v-else
    @tap="clickCell"
  >
    <div class="dfr jcc aic f1" :style="cellStyle">
      <div class="dfr aic f1">
        <div
          v-if="$slots.leftIcon || props.leftIcon"
          class="df aic"
          style="font-size: 16px"
        >
          <slot name="leftIcon" v-if="$slots.leftIcon"></slot>
          <zIcon
            v-else-if="props.leftIcon"
            :name="props.leftIcon"
            :otherStyle="props.leftIconStyle"
            :size="
              props.size === 'large' ? 22 : props.size === 'small' ? 14 : 18
            "
          ></zIcon>
        </div>
        <div class="f1">
          <slot name="title">
            <text v-if="props.title" :style="cellTitleStyle">
              {{ props.title }}
            </text>
          </slot>
          <slot name="detail">
            <text :style="cellDetailStyle" v-if="props.detail">
              {{ props.detail }}
            </text>
          </slot>
        </div>
      </div>
      <slot name="rightValue">
        <text
          class="tar"
          :style="cellRightValueStyle"
          v-if="!zTest.empty(props.rightValue)"
        >
          {{ props.rightValue }}
        </text>
      </slot>
      <div
        v-if="$slots.rightIcon || props.rightIcon"
        class="df aic"
        style="font-size: 16px; margin-left: 4px"
      >
        <slot name="rightIcon" v-if="$slots.rightIcon"></slot>
        <zIcon
          v-else
          :name="props.rightIcon"
          :otherStyle="props.rightIconStyle"
          :size="props.size === 'large' ? 22 : props.size === 'small' ? 14 : 18"
        ></zIcon>
      </div>
    </div>
  </div>
  <zLine :show="true" v-if="props.border"></zLine>
</template>

<style lang="less" scoped>
.z-cell-canfeedBack {
  background-color: @bgDefault;
}
.z-cell-disabled {
  color: #c8c8c8;
}
</style>
