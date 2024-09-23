<!--
 * @Description: z-subsection-item 分段器子组件
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
import {
  ref,
  onMounted,
  getCurrentInstance,
  computed,
  onBeforeUnmount,
  watch,
  nextTick,
  CSSProperties,
  reactive,
  toRefs,
  inject,
  onUnmounted,
} from 'vue'
import z from '../../libs/z'
import {
  subsectionContextKey,
  SubsectionItemRect,
  subsectionMode,
} from '../../components/z-subsection/z-subsection'
import zColor from '../../libs/zColor'
import { useComponentSize } from '../../libs/use-component-size/use-component-size'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
/**
 * @description: z-subsection-item 分段器子组件传参
 * @param: color 默认颜色
 * @param: activeColor	 激活时的颜色
 * @param: disabled	是否禁用
 * @param: title  标题
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  color?: string
  activeColor?: string
  disabled?: boolean
  title?: string
}

interface EmitsType {
  (e: 'click', index: string): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
})

const emits = defineEmits<EmitsType>()

const instance = getCurrentInstance()
if (!instance) {
  z.error(`zSubsectionItem 请在 setup 中使用 useSubsectionItem`)
}

const { uid } = instance!

const subsectionContext = inject(subsectionContextKey)
if (!subsectionContext) {
  z.error(`zSubsectionItem 请在 zSubsection 中使用 zSubsectionItem`)
}

const componentId = `z-subsection-item-${uid}`

// 标记当前item是否激活
const active = computed(() => subsectionContext?.activeUid === uid)

// 获取节点信息
const componentRectInfo: SubsectionItemRect = {
  left: 0,
  width: 0,
}
let initCount = 0
const getSubsectionItemRectInfo = async () => {
  try {
    const rectInfo = await z.getDomInfo(`#${componentId}`, instance)

    initCount = 0
    componentRectInfo.left = rectInfo.left || 0
    componentRectInfo.width = rectInfo.width || 0

    // 添加item信息
    subsectionContext?.addItem({
      ...props,
      uid,
      element: componentRectInfo,
    })
  } catch (err) {
    if (initCount > 10) {
      initCount = 0
      z.error(`zSubsectionItem 获取节点信息失败: ${err}`)
      return
    }
    initCount++
    setTimeout(() => {
      getSubsectionItemRectInfo()
    }, 150)
  }
}

// item点击事件
const itemClickEvent = () => {
  if (subsectionContext?.disabled || props.disabled) return
  subsectionContext?.setActiveItem(uid)
  emits('click', props.title!)
}

onMounted(() => {
  nextTick(() => {
    getSubsectionItemRectInfo()
  })
})

onUnmounted(() => {
  subsectionContext?.removeItem(uid)
})

const activeColor = computed<string>(() =>
  z.isEmptyDoubleVariableInDefault(
    props.activeColor,
    subsectionContext?.activeColor,
    ''
  )
)
const subsectionMode = computed<subsectionMode>(() =>
  z.isEmptyVariableInDefault(subsectionContext?.mode, 'default')
)
const disabled = computed<boolean>(
  () => subsectionContext?.disabled || props.disabled || false
)

// 分段器Item的类
const subsectionItemClass = computed<string>(() => {
  const cls: string[] = [
    'z-subsection-item',
    `z-subsection-item-${subsectionMode.value}`,
    active.value ? 'z-subsection-item-active' : '',
    disabled.value ? 'z-subsection-item-disabled' : '',
  ]

  return cls.join(' ')
})
// 分段器Item的样式
const subsectionItemStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  if (subsectionMode.value === 'default') {
    style.borderColor = zColor.getTypeColor(
      activeColor.value || zColor.getTypeColor('primary')
    )
    if (active.value) {
      style.color = zColor.getTypeColor('cw')
    } else {
      style.color = zColor.getTypeColor(props.color ? props.color : 'cb')
    }
  }

  if (subsectionMode.value === 'button') {
    if (active.value) {
      style.color = zColor.getTypeColor(
        activeColor.value || zColor.getTypeColor('primary')
      )
    } else {
      style.color = zColor.getTypeColor(props.color ? props.color : 'cb')
    }
  }

  return style
})
</script>

<template>
  <div
    :id="componentId"
    :class="[subsectionItemClass]"
    :style="subsectionItemStyle"
    @tap.stop="itemClickEvent"
  >
    <slot>
      {{ title }}
    </slot>
  </div>
</template>

<style lang="less" scoped>
.z-subsection-item {
  position: relative;
  flex: 1;
  padding: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}
.z-subsection-item-default {
  border-right-width: 1rpx;
  border-right-style: solid;
  &:last-of-type {
    border: none;
  }
}
.z-subsection-item-disabled {
  opacity: 0.4;
}
</style>
