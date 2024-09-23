<!--
 * @Description: z-subsection 分段器组件
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
  reactive,
  toRefs,
  provide,
} from 'vue'
import z from '../../libs/z'
import {
  subsectionMode,
  subsectionContextKey,
  SubsectionItemContext,
  SubsectionSliderRect,
  useOrderedChildren,
} from '../../components/z-subsection/z-subsection'
import zColor from '../../libs/zColor'
import { useComponentSize } from '../../libs/use-component-size/use-component-size'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
/**
 * @description: z-subsection 分段器组件传参
 * @param: color 默认颜色
 * @param: activeColor	 激活时的颜色
 * @param: disabled	是否禁用
 * @param: modelValue  当前选中item索引的绑定值
 * @param: mode  分段器模式，`default`为默认模式，`button`为按钮模式
 * @param: size  分段器尺寸，可选small normal large 或size
 * @param: radius  圆角的值，只作用在最外层的两个选择器上
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  color?: string
  activeColor?: string
  disabled?: boolean
  modelValue?: number
  mode?: subsectionMode
  size?: string
  radius?: string
}

interface EmitsType {
  (e: 'update:modelValue', index: number): void
  (e: 'change', index: number): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  modelValue: 0,
  mode: 'default',
  radius: '8',
})

const emits = defineEmits<EmitsType>()

const instance = getCurrentInstance()
if (!instance) {
  z.error('zSubsection 请在 setup 中使用 useSubsection')
}

const {
  children: items,
  addChild,
  removeChild: removeItem,
} = useOrderedChildren<SubsectionItemContext>()

const componentId = `z-subsection-${instance?.uid}`

// 当前激活的item的uid
const activeUid = ref<number>(0)
// 当前选中的Index
const currentActiveIndex = ref<number>(0)

// 添加ChildrenItem
const addItem = (item: SubsectionItemContext) => {
  if (props.modelValue !== undefined) {
    if (props.modelValue === items.value.length) {
      currentActiveIndex.value = props.modelValue
      activeUid.value = item.uid
      // #ifndef APP-PLUS || MP-ALIPAY
      nextTick(() => {
        updateSliderRectInfo(item)
      })
      // #endif
      // #ifdef APP-PLUS || MP-ALIPAY
      setTimeout(() => {
        updateSliderRectInfo(item)
      }, 50)
      // #endif
    }
  }
  addChild(item)
}

// 根据当前激活的Index更新activeUid
const updateActiveUidWithIndex = () => {
  nextTick(() => {
    const item = items.value[currentActiveIndex.value]
    if (item) {
      activeUid.value = item.uid
      updateSliderRectInfo(item)
    }
  })
}

let innerUpdate = false
watch(
  () => props.modelValue,
  (val) => {
    if (innerUpdate) {
      innerUpdate = false
      return
    }
    if (val === undefined || val > items.value.length - 1) {
      currentActiveIndex.value = 0
    } else {
      currentActiveIndex.value = val
    }
    updateActiveUidWithIndex()
  }
)

// 获取组件节点信息
let componentLeft = 0
let initCount = 0
const getComponentRectInfo = async () => {
  try {
    const rectInfo = await z.getDomInfo(`#${componentId}`, instance)

    initCount = 0
    componentLeft = rectInfo.left || 0
  } catch (err) {
    if (initCount > 10) {
      initCount = 0
      z.error(`zSubsection 获取组件节点信息失败: ${err}`)
      return
    }
    initCount++
    setTimeout(() => {
      getComponentRectInfo()
    }, 150)
  }
}

// 设置当前被点击的activeUID
const setActiveItem = (uid: number) => {
  const index = items.value.findIndex((item) => item.uid === uid)
  if (index !== -1) {
    innerUpdate = true
    activeUid.value = uid
    currentActiveIndex.value = index
    updateSliderRectInfo(items.value[index])
    emits('update:modelValue', index)
    nextTick(() => {
      emits('change', index)
    })
  }
}

// 更新滑动样式容器信息
const activeColor = ref<string>('')
const sliderRectInfo = ref<SubsectionSliderRect>({
  left: 0,
  width: 0,
})
const updateSliderRectInfo = (item: SubsectionItemContext) => {
  if (!item) return

  sliderRectInfo.value.left = item.element.left - componentLeft
  sliderRectInfo.value.width = item.element.width
  if (props.mode === 'default') {
    sliderRectInfo.value.left -= 1
    if (props.modelValue === items.value.length - 1) {
      sliderRectInfo.value.width += 2
    }
  }
  activeColor.value = z.isEmptyDoubleVariableInDefault(
    item.activeColor,
    props.activeColor,
    ''
  )
}

onMounted(() => {
  nextTick(() => {
    getComponentRectInfo()
  })
})

provide(
  subsectionContextKey,
  reactive({
    ...toRefs(props),
    items,
    addItem,
    removeItem,

    activeUid,
    setActiveItem,
  })
)

// 解析尺寸
const { sizeType } = useComponentSize(props.size)

// 分段器的类
const subsectionClass = computed<string>(() => {
  const cls: string[] = ['z-subsection', `z-subsection-${props.mode}`]

  // 设置尺寸
  if (props.size && sizeType.value === 'inner')
    cls.push(`z-subsection-${props.size}`)

  return cls.join(' ')
})
// 分段器的样式
const subsectionStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  // 如果是按钮模式，则设置背景颜色
  if (props.mode === 'button') {
    style.backgroundColor = zColor.getTypeColor('info')
  }

  // 如果是默认模式，设置激活颜色的边框
  if (props.mode === 'default') {
    style.borderColor = zColor.getTypeColor(
      activeColor.value || zColor.getTypeColor('primary')
    )
  }

  // 设置尺寸
  if (props.size && sizeType.value === 'custom')
    style.fontSize = z.addUnit(props.size)

  // 设置圆角
  if (props.radius) {
    style.borderRadius = z.addUnit(props.radius)
  }

  return style
})

// 滑块的类
const subsectionSliderClass = computed<string>(() => {
  const cls: string[] = [
    'z-subsection-slider',
    `z-subsection-slider-${props.mode}`,
  ]

  return cls.join(' ')
})
// 滑块的样式
const subsectionSliderStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  if (props.mode === 'default') {
    style.backgroundColor = zColor.getTypeColor(
      activeColor.value || zColor.getTypeColor('primary')
    )
  } else {
    style.backgroundColor = zColor.getTypeColor('cw')
  }

  // 滑动的位置
  if (sliderRectInfo.value) {
    style.left = `${sliderRectInfo.value.left}px`
    style.width = `${sliderRectInfo.value.width}px`
  }

  return style
})
</script>

<template>
  <div :id="componentId" :class="[subsectionClass]" :style="subsectionStyle">
    <!-- 滑块 -->
    <div :class="[subsectionSliderClass]" :style="subsectionSliderStyle"></div>
    <!-- 内容区域 -->
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-subsection {
  position: relative;
  width: 100%;
  overflow: hidden;
  .content {
    position: relative;
    width: 100%;
    display: flex;
  }
}
.z-subsection-small {
  font-size: 24rpx;
}
.z-subsection-normal {
  font-size: 28rpx;
}
.z-subsection-large {
  font-size: 32rpx;
}
.z-subsection-xlarge {
  font-size: 36rpx;
}
.z-subsection-default {
  border-width: 1rpx;
  border-style: solid;
}
.z-subsection-button {
}
.z-subsection-slider {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;

  transition-property: left, width, background-color;
  transition-duration: 0.3s;
  transition-timing-function: ease;
}
.z-subsection-slider-default {
}
.z-subsection-slider-button {
  transform-origin: center center;
  transform: scale(0.85);
  border-radius: 10rpx;
}
</style>
