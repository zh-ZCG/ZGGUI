<!--
 * @Description: z-steps 步骤条组件
 * @Author: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import {
  ref,
  getCurrentInstance,
  watch,
  nextTick,
  CSSProperties,
  provide,
  toRefs,
  reactive,
} from 'vue'
import z from '../../libs/z'
import {
  stepModes,
  stepsContextKey,
  StepContext,
  useOrderedChildren,
} from '../../components/z-steps/z-steps'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
/**
 * @description: z-steps 步骤条组件传参
 * @param: color 默认颜色
 * @param: activeColor	激活时颜色
 * @param: disabled	禁止点击
 * @param: modelValue  当前激活步骤绑定的index
 * @param: mode  步骤条模式
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
  mode?: stepModes
}

interface EmitsType {
  (e: 'update:modelValue', index: number): void
  (e: 'change', index: number): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  mode: 'dot',
})

const emits = defineEmits<EmitsType>()

const instance = getCurrentInstance()

if (!instance) {
  z.error('zSteps 请在 setup 中使用 useSteps')
}

const {
  children: items,
  addChild,
  removeChild: removeItem,
} = useOrderedChildren<StepContext>()

// 当前已激活的Uid列表
const activeUidList = ref<number[]>([])

let innerUpdate = false
// 更新当前激活的Uid列表
const setActiveUidList = (uid?: number, changeEmit = false) => {
  if (uid === undefined) {
    activeUidList.value = []
    return
  }
  // 查找出当前激活的uid的index
  const index = items.value.findIndex((item) => item.uid === uid)
  if (index === -1) return

  // 根据index查找出当前激活的uid列表
  activeUidList.value = items.value.slice(0, index + 1).map((item) => item.uid)

  // 触发更新事件
  emits('update:modelValue', index)
  if (changeEmit) {
    emits('change', index)
  }
}

// 设置当前激活的Step
const setActiveItem = (uid: number) => {
  if (props.disabled) return
  innerUpdate = true
  setActiveUidList(uid, true)
}

watch(
  () => props.modelValue,
  (val) => {
    if (innerUpdate) {
      innerUpdate = false
      return
    }
    if (val !== undefined) {
      const uid = items.value?.[val]?.uid
      setActiveUidList(uid)
    }
  }
)

// 添加item到items
const addItem = (item: StepContext) => {
  addChild(item)
  if (
    !activeUidList.value.length &&
    props.modelValue !== undefined &&
    props.modelValue >= 0
  ) {
    setActiveUidList(items.value?.[props.modelValue]?.uid)
  }
}

provide(
  stepsContextKey,
  reactive({
    ...toRefs(props),

    items,
    activeUidList,
    addItem,
    removeItem,
    setActiveItem,
  })
)
</script>

<template>
  <div class="z-steps">
    <slot></slot>
  </div>
</template>

<style lang="less" scoped>
.z-steps {
  position: relative;
  width: 100%;
  display: flex;
  flex-wrap: nowrap;
}
</style>
