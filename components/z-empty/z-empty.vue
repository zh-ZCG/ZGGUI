<!--
 * @Description: z-empty 空白组件
 * @Author: ZGGUI & ui.zggui.cn & zcgamazing@163.com
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
  useSlots,
} from 'vue'
import z from '@/ZGGUI/libs/z'
import zColor from '@/ZGGUI/libs/zColor'
import { propsHook, PropsTypeHook } from '@/ZGGUI/libs/zHooks'
import zIcon from '@/ZGGUI/components/z-icon/z-icon.vue'
import { useComponentSize } from '@/ZGGUI/libs/use-component-size/use-component-size'
/**
 * @description: z-empty 空白组件传参
 * @param: mode 空白提示类型
 * @param: color 内容颜色
 * @param: size	内容尺寸
 * @param: showTips  是否显示提示
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * @example:
 */
type TextIconStyleType = (type: 'icon' | 'tips') => CSSProperties

type emptyMode =
  | 'cart'
  | 'page'
  | 'search'
  | 'address'
  | 'network'
  | 'order'
  | 'coupon'
  | 'favor'
  | 'permission'
  | 'history'
  | 'message'
  | 'list'
  | 'data'
  | 'comment'

const emptyDefaultTips: Record<emptyMode, string> = {
  cart: '购物车为空',
  page: '页面不存在',
  search: '搜索结果为空',
  address: '地址为空',
  network: '网络不通',
  order: '订单为空',
  coupon: '优惠券为空',
  favor: '暂无收藏',
  permission: '无权限',
  history: '历史记录为空',
  message: '暂无消息',
  list: '列表为空',
  data: '暂无数据',
  comment: '暂无评论',
}

interface PropsType extends PropsTypeHook {
  mode: emptyMode
  color?: string
  size?: string
  showTips?: boolean
}

interface EmitsType {}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  size: 'normal',
  showTips: true,
})

const emits = defineEmits<EmitsType>()

const { sizeType } = useComponentSize(props.size)

const slots = useSlots()
// 判断是否自定义icon或者tips的插槽
const customIconContent = computed<boolean>(() => !!slots?.icon)
const customTipsContent = computed<boolean>(() => !!slots?.tips)

// 根据类型获取默认提示
const emptyTips = computed<string>(() =>
  props.mode ? emptyDefaultTips[props.mode] : ''
)

// empty对应的类
const emptyClass = computed<string>(() => {
  const cls: string[] = ['z-empty']

  // 设置尺寸
  if (props.size && sizeType.value === 'inner')
    cls.push(`z-empty-${props.size}`)

  return cls.join(' ')
})
// empty对应的样式
const emptyStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  // 设置背景颜色=
  style.color = props.color
    ? zColor.getTypeColor(props.color)
    : zColor.getTypeColor('disabled')

  return style
})

// 设置icon和text的样式
const iconTextStyle = computed<TextIconStyleType>(() => {
  return (type: 'icon' | 'tips') => {
    const style: CSSProperties = {}

    // 设置用户自定义尺寸
    if (props.size && sizeType.value === 'custom') {
      if (type === 'icon' && !customIconContent.value) {
        style.fontSize = z.addUnit(props.size)
        style.width = style.height = z.addUnit(props.size)
      }
      if (type === 'tips' && !customTipsContent.value) {
        style.fontSize = `calc(${z.addUnit(props.size)} * 0.35)`
      }
    }

    return style
  }
})

//获取图标大小
const iconSize = computed<string>(() => {
  let size = ''

  if (props.size && sizeType.value === 'custom') {
    if (!customIconContent.value) {
      size = z.addUnit(props.size)
    }
  } else {
    if (sizeType.value === 'inner') {
      switch (props.size) {
        case 'normal': {
          size = '80rpx'
          break
        }
        case 'small': {
          size = '60rpx'
          break
        }
        case 'large': {
          size = '100rpx'
          break
        }
        case 'xlarge': {
          size = '120rpx'
          break
        }
      }
    } else if (sizeType.value === 'none') {
      size = '80rpx'
    }
  }
  return size
})
</script>

<template>
  <div :class="[emptyClass]" :style="emptyStyle">
    <!-- 图标 -->
    <div
      class="icon"
      :class="customIconContent ? 'custom' : ''"
      :style="iconTextStyle('icon')"
    >
      <slot name="icon">
        <zIcon :size="iconSize" :name="`empty-${mode}`"></zIcon>
      </slot>
    </div>
    <!-- 提示文字 -->
    <div
      v-if="showTips || $slots.tips"
      class="tips"
      :class="customTipsContent ? 'custom' : ''"
      :style="iconTextStyle('tips')"
    >
      <slot name="tips">
        {{ emptyTips }}
      </slot>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-empty {
  position: relative;
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1;
  .custom {
    font-size: inherit;
    width: auto;
    height: auto;
  }
}
.z-empty-small {
  .icon {
    font-size: 60rpx;
    width: 60rpx;
    height: 60rpx;
  }
}
.z-empty-normal {
  .icon {
    font-size: 80rpx;
    width: 80rpx;
    height: 80rpx;
  }
}
.z-empty-large {
  .icon {
    font-size: 100rpx;
    width: 100rpx;
    height: 100rpx;
  }
}
.z-empty-xlarge {
  .icon {
    font-size: 120rpx;
    width: 120rpx;
    height: 120rpx;
  }
}
</style>
