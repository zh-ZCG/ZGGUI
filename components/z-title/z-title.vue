<!--
 * @Description: z-title 标题组件
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
import zColor from '../../libs/zColor'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
import { useComponentSize } from '../../libs/use-component-size/use-component-size'

/**
 * @description: z-title 标题组件传参
 * @param: title 标题内容
 * @param: subTitle	子标题内容，设置 mode 为 subTitle 时生效
 * @param: mode	标题模式
 * @param: size  标题大小
 * @param: align  标题对齐方式
 * @param: color  标题颜色
 * @param: assistColor  辅助元素颜色
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */

type titleModes = 'normal' | 'vLine' | 'dot' | 'hLine' | 'subTitle'
type titleAlign = 'left' | 'center' | 'right'
interface PropsType extends PropsTypeHook {
  title?: string
  subTitle?: string
  mode?: titleModes
  size?: string
  align?: titleAlign
  color?: string
  assistColor?: string
}

interface EmitsType {
  (e: 'click'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  mode: 'normal',
  size: 'normal',
  align: 'left',
})

const emits = defineEmits<EmitsType>()

// 解析尺寸
const { sizeType } = useComponentSize(props.size)

// title对应的类
const titleClass = computed<string>(() => {
  const cls: string[] = ['z-title-content', `z-title-${props.mode}`]

  // 设置尺寸
  if (props.size && sizeType.value === 'inner') cls.push(`z-title-${props.size}`)

  return cls.join(' ')
})
// title对应的样式
const titleStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  // 设置颜色
  style.color = zColor.getTypeColor(props.color || zColor.getTypeColor('cb'))

  // 设置尺寸
  if (props.size && sizeType.value === 'custom')
    style.fontSize = z.addUnit(props.size)

  // 设置对齐方式
  if (props.align) style.textAlign = props.align

  return style
})

// assist颜色对应的样式
const assistColorStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  if (props.mode === 'subTitle') {
    style.color = zColor.getTypeColor(props.assistColor || 'colorPrimaryLight')
  } else {
    style.backgroundColor = zColor.getTypeColor(
      props.assistColor || zColor.getTypeColor('primary')
    )
  }

  return style
})

// 标题点击事件
const titleClickEvent = () => {
  emits('click')
}
</script>

<template>
  <div class="z-title" @tap.stop="titleClickEvent">
    <!-- 内容 -->
    <div :class="[titleClass]" :style="titleStyle">
      <slot>
        <div class="content">
          {{ title }}
        </div>
      </slot>
      <!-- 辅助元素 -->
      <div v-if="mode !== 'normal'" :class="mode" :style="assistColorStyle">
        <template v-if="mode === 'subTitle' && subTitle">
          {{ subTitle }}
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-title {
  position: relative;
  height: fit-content;
  .z-title-content {
    position: relative;
    width: fit-content;
    .vLine {
      position: absolute;
      left: 0;
      top: 50%;
      width: 8rpx;
      height: 92%;
      border-radius: 30rpx;
      transform: translateY(-50%);
    }
    .dot {
      position: absolute;
      left: 0;
      top: 50%;
      width: 14rpx;
      height: 14rpx;
      border-radius: 50%;
      transform: translateY(-50%);
    }
    .hLine {
      position: absolute;
      left: 8rpx;
      bottom: 0;
      width: 40%;
      max-width: 40rpx;
      height: 8rpx;
      border-radius: 40rpx;
    }
    .subTitle {
      position: absolute;
      left: 8rpx;
      top: 20%;
      z-index: -1;
      display: inline-block;
      white-space: nowrap;
    }
  }
  .z-title-vLine {
    padding-left: 18rpx;
  }
  .z-title-dot {
    padding-left: 20rpx;
  }
  .z-title-hLine {
    padding-bottom: 10rpx;
  }
  .z-title-subTitle {
    width: 100%;
    z-index: 1;
    padding-bottom: 10rpx;
  }
  .z-title-small {
    font-size: 24rpx;
  }
  .z-title-normal {
    font-size: 28rpx;
  }
  .z-title-large {
    font-size: 32rpx;
  }
  .z-title-xlarge {
    font-size: 38rpx;
  }
}
</style>
