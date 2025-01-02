<!--
 * @Description: z-bubble-box 气泡弹窗组件
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
import z from 'zgg-ui/libs/z'
import zColor from 'zgg-ui/libs/zColor'
import zOverlay from '../../components/z-overlay/z-overlay.vue'
import zIcon from '../../components/z-icon/z-icon.vue'
import {
  BubbleBoxOptionData,
  BubbleBoxOptionItemData,
} from '../../components/z-bubble-box/z-bubble-box'
import { propsHook, PropsTypeHook } from 'zgg-ui/libs/zHooks'
/**
 * @description: z-bubble-box 气泡弹窗组件传参
 * @param: options 气泡弹出框选项数据
 * @param: position		气泡弹出框位置
 * @param: width	气泡弹出框宽度
 * @param: height  气泡弹出框高度
 * @param: bgColor  气泡弹出框背景颜色
 * @param: textColor  气泡弹出框文字颜色
 * @param: optionItemPadding  选项的内边距
 * @param: disabled  是否禁止点击气泡弹出框选项
 * @param: autoClose  点击选项后自动关闭气泡弹出框
 * @param: zIndex  ZIndex
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */

interface BubbleBoxOptionItem {
  /**
   * @description 内容
   */
  text: string
  /**
   * @description 图标
   */
  icon?: string
  /**
   * @description 气泡弹出框文字颜色
   */
  textColor?: string
  /**
   * @description 禁止点击
   */
  disabled?: boolean
}

type BubbleBoxOption = BubbleBoxOptionItem[]

type bubbleBoxPosition = 'top' | 'bottom' | 'left' | 'right'

type OptionsClassType = (item: BubbleBoxOptionItemData) => string
type OptionsStyleType = (item: BubbleBoxOptionItemData) => CSSProperties

interface PropsType extends PropsTypeHook {
  options?: BubbleBoxOption
  position?: bubbleBoxPosition
  width?: string
  height?: string
  bgColor?: string
  textColor?: string
  optionItemPadding?: string
  disabled?: boolean
  autoClose?: boolean
  zIndex?: number
}

interface EmitsType {
  (e: 'open'): void //气泡框打开事件
  (e: 'close'): void //气泡框关闭事件
  (e: 'click', index: number): void //气泡框选项点击事件
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  options: () => [],
  position: 'top',
  autoClose: true,
  zIndex: 12000,
})

const emits = defineEmits<EmitsType>()

// 显示气泡弹出框
const showBubble = ref<boolean>(false)

const openBubbleOptions = () => {
  emits('open')
  showBubble.value = true
}

// 关闭气泡弹出框
const closeBubbleOptions = () => {
  emits('close')
  showBubble.value = false
}

// 气泡框选项点击事件
const bubbleOptionClickEvent = (
  item: BubbleBoxOptionItemData,
  index: number
) => {
  if (props.disabled || item.disabled) return
  emits('click', index)
  if (props.autoClose) closeBubbleOptions()
}

const bubbleOptions = computed<BubbleBoxOptionData>(() => {
  return props.options.map((item) => {
    const textColor = z.isEmptyDoubleVariableInDefault(
      item.textColor,
      props.textColor,
      '#1a1a1a'
    )

    return {
      text: item.text || '',
      icon: item?.icon || '',
      disabled: props.disabled || item.disabled || false,
      color: zColor.getTypeColor(textColor ?? 'primary'),
    }
  })
})

// 选项的类
const optionsClass = computed<string>(() => {
  const cls: string[] = [
    'options',
    `options-${props.position}`,
    showBubble.value ? 'show' : '',
  ]

  return cls.join(' ')
})
// 选项的样式
const optionsStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  style.backgroundColor = zColor.getTypeColor(props.bgColor || 'cw')

  if (props.zIndex) style.zIndex = props.zIndex

  if (props.width) style.width = z.addUnit(props.width)
  if (props.height) style.height = z.addUnit(props.height)

  return style
})

// 选项辅助元素的类
const optionsAuxiliaryElementClass = computed<string>(() => {
  const cls: string[] = ['auxiliary-element']

  return cls.join(' ')
})
// 选项辅助元素的样式
const optionsAuxiliaryElementStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  style.borderColor = zColor.getTypeColor(props.bgColor || 'cw')

  // 根据不同的位置，设置不同的边框样式
  if (props.position === 'top') {
    style.borderRightColor = 'transparent'
    style.borderBottomColor = 'transparent'
    style.borderLeftColor = 'transparent'
  }
  if (props.position === 'right') {
    style.borderTopColor = 'transparent'
    style.borderBottomColor = 'transparent'
    style.borderLeftColor = 'transparent'
  }
  if (props.position === 'bottom') {
    style.borderTopColor = 'transparent'
    style.borderRightColor = 'transparent'
    style.borderLeftColor = 'transparent'
  }
  if (props.position === 'left') {
    style.borderTopColor = 'transparent'
    style.borderRightColor = 'transparent'
    style.borderBottomColor = 'transparent'
  }

  return style
})

// 选项item的类
const optionItemClass = computed<OptionsClassType>(() => {
  return (item: BubbleBoxOptionItemData) => {
    const cls: string[] = ['option-item', item.disabled ? 'disabled' : '']

    return cls.join(' ')
  }
})

// 选项item的样式
const optionItemStyle = computed<OptionsStyleType>(() => {
  return (item: BubbleBoxOptionItemData) => {
    const style: CSSProperties = {}

    style.color = zColor.getTypeColor(item.color ?? 'primary')

    if (props.optionItemPadding) style.padding = props.optionItemPadding

    return style
  }
})
</script>

<template>
  <div class="z-bubble-box pr">
    <!-- 遮罩 -->
    <zOverlay
      :show="showBubble"
      :opacity="0"
      :zIndex="zIndex - 1"
      @click="closeBubbleOptions"
    ></zOverlay>
    <!-- 内容 -->
    <div class="content pr" @tap.stop="openBubbleOptions">
      <slot></slot>
      <!-- 气泡弹框选项 -->
      <div :class="[optionsClass]" :style="optionsStyle">
        <!-- 小三角 -->
        <div
          :class="[optionsAuxiliaryElementClass]"
          :style="optionsAuxiliaryElementStyle"
        ></div>
        <!-- 选项内容 -->
        <scroll-view
          class="scroll-view"
          enhanced="true"
          :show-scrollbar="false"
          scroll-y
        >
          <div class="options-content">
            <div
              v-for="(item, index) in bubbleOptions"
              :key="index"
              :class="[optionItemClass(item)]"
              :style="optionItemStyle(item)"
              @tap.stop="bubbleOptionClickEvent(item, index)"
            >
              <div v-if="item.icon" class="icon">
                <zIcon :name="item.icon"></zIcon>
              </div>
              <div class="text">{{ item.text }}</div>
            </div>
          </div>
        </scroll-view>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-bubble-box {
  .content {
    .options {
      position: absolute;
      width: fit-content;
      border-radius: 15rpx;
      transition-duration: 0.3s;
      transition-timing-function: linear;
      transition-property: opacity, transform;
      opacity: 0;
      visibility: hidden;
      .scroll-view {
        height: 100%;
        .options-content {
          height: fit-content;
          .option-item {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20rpx 38rpx;
            .icon {
              margin-right: 10rpx;
            }
            .text {
              width: fit-content;
              white-space: nowrap;
            }

            &::after {
              content: '';
              position: absolute;
              left: 50%;
              bottom: 0;
              width: 90%;
              height: 1rpx;
              background-color: #f8f7f8;
              transform: translate(-50%, -50%);
            }

            &:last-of-type {
              &::after {
                display: none;
              }
            }
          }
          .disabled {
            opacity: 0.4;
          }
        }
      }
    }
    .options-top {
      box-shadow: 0rpx 10rpx 20rpx -2rpx rgba(0, 0, 0, 0.06),
        0rpx 0rpx 10rpx -4rpx rgba(0, 0, 0, 0.1);
      top: 0px;
      left: 50%;
      transform: translate(-50%, calc(-100% - 12px));
      .auxiliary-element {
        left: 50%;
        bottom: 2rpx;
        transform: translate(-50%, 100%);
      }
    }
    .options-right {
      box-shadow: -10rpx 0rpx 20rpx -2rpx rgba(0, 0, 0, 0.06),
        0rpx 0rpx 10rpx -4rpx rgba(0, 0, 0, 0.1);
      left: calc(100% + 12px);
      top: 50%;
      transform: translateY(-50%);
      .auxiliary-element {
        left: 2rpx;
        top: 50%;
        transform: translate(-100%, -50%);
      }
    }
    .options-bottom {
      box-shadow: 0rpx -10rpx 20rpx -2rpx rgba(0, 0, 0, 0.06),
        0rpx 0rpx 10rpx -4rpx rgba(0, 0, 0, 0.1);
      top: calc(100% + 12px);
      left: 50%;
      transform: translateX(-50%);
      .auxiliary-element {
        left: 50%;
        top: 2rpx;
        transform: translate(-50%, -100%);
      }
    }
    .options-left {
      box-shadow: 10rpx 0rpx 20rpx -2rpx rgba(0, 0, 0, 0.06),
        0rpx 0rpx 10rpx -4rpx rgba(0, 0, 0, 0.1);
      top: 50%;
      left: calc(-100% + 12px);
      transform: translate(-50%, -50%);
      .auxiliary-element {
        right: 2rpx;
        top: 50%;
        transform: translate(100%, -50%);
      }
    }
    .show {
      opacity: 1;
      visibility: visible;
    }

    .auxiliary-element {
      width: 0rpx;
      height: 0rpx;
      position: absolute;
      z-index: inherit;
      border-width: 18rpx;
      border-style: solid;
    }
  }
}
</style>
