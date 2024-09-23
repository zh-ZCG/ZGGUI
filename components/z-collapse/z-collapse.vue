<!--
 * @Description: z-collapse 折叠面板组件
 * @Author: ZGGUI & ui.zggui.cn & zggamazing@163.com
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
  provide,
  toRefs,
  reactive,
} from 'vue'
import z from '@/ZGGUI/libs/z'
import zType from '@/ZGGUI/libs/zType'
import {
  CollapseModelValue,
  CollapseItemContext,
  useOrderedChildren,
  collapseContextKey,
} from '@/ZGGUI/components/z-collapse/z-collapse'
import { propsHook, PropsTypeHook } from '@/ZGGUI/libs/zHooks'
/**
 * @description: z-collapse 折叠面板组件传参
 * @param: modelValue 当前激活的面板，如果是手风琴效果则传递string，否则传递string[]
 * @param: accordion 是否开启手风琴效果，每次只能打开一个面板
 * @param: showArrow	是否显示折叠面板的箭头
 * @param: arrowColor  折叠面板箭头的颜色，show-arrow为true时生效
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zggui.cn & zggamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  modelValue: CollapseModelValue
  accordion?: boolean
  showArrow?: boolean
  arrowColor?: string
}

interface EmitsType {
  (e: 'update:modelValue', value: CollapseModelValue): void
  (e: 'change', value: CollapseModelValue): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  accordion: true,
  showArrow: true,
})

const emits = defineEmits<EmitsType>()

const {
  children: items,
  addChild: addItem,
  removeChild: removeItem,
} = useOrderedChildren<CollapseItemContext>()
// 当前已激活的面板对应的uid
const activeUid = ref<number[]>([])
const currentActiveIndex = ref<CollapseModelValue>()

// 根据modelValue更新activeUID的值
const updateActiveUIDWithModelValue = (val?: CollapseModelValue) => {
  nextTick(() => {
    let activeIndex: number[]
    if (val === undefined || val === -1) {
      activeIndex = []
    } else if (zType.isNumber(val)) {
      activeIndex = [val]
    } else {
      activeIndex = [...val]
    }

    activeUid.value = items.value
      .filter((uid, index) => activeIndex.includes(index))
      .map((item) => item.uid)
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
    currentActiveIndex.value = val
    updateActiveUIDWithModelValue(val)
  },
  {
    immediate: true,
  }
)

// 处理CollapseItem点击事件
const handleItemClick = (uid: number) => {
  const { accordion } = props
  // 获取对应uid对应的索引
  const uidIndex = items.value.findIndex((item) => item.uid === uid)
  const isActive = activeUid.value.includes(uid)
  let value: CollapseModelValue

  // 判断是否为手风琴效果
  if (accordion) {
    // 判断是否已经为激活状态，如果是激活状态则取消激活，否则设置为其他面板激活
    if (isActive) {
      value = -1
    } else {
      value = uidIndex
    }
  } else {
    // 判断是否存在于激活面板中，如果存在则取消激活，否则添加到激活面板中
    if (isActive) {
      value = (currentActiveIndex.value as number[]).filter(
        (item) => item !== uidIndex
      )
    } else {
      if (currentActiveIndex.value && zType.isArray(currentActiveIndex.value)) {
        value = [...currentActiveIndex.value, uidIndex]
      } else {
        value = !currentActiveIndex.value
          ? [uidIndex]
          : [currentActiveIndex.value, uidIndex]
      }
    }
  }

  // 触发更新事件
  innerUpdate = true
  currentActiveIndex.value = value
  emits('update:modelValue', value)
  updateActiveUIDWithModelValue(value)
  nextTick(() => {
    emits('change', value)
  })
}

provide(
  collapseContextKey,
  reactive({
    ...toRefs(props),

    items,
    addItem,
    removeItem,

    activeUid,
    handleItemClick,
  })
)
</script>

<template>
  <div class="z-collapse">
    <slot></slot>
  </div>
</template>

<style lang="less" scoped></style>
