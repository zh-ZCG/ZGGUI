<!--
 * @Description: z-swipe-action 滑动菜单组件
 * @Author: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import { ref, CSSProperties, provide, toRefs, shallowRef, reactive } from 'vue'
import z from '../../libs/z'
import zType from '../../libs/zType'
import { swipeActionContextKey } from '../../components/z-swipe-action/z-swipe-action'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
/**
 * @description: z-swipe-action 滑动菜单组件传参
 * @param: autoClose 自动关闭菜单
 * @param: exclusive	只允许一个item处于打开状态
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  autoClose: boolean
  exclusive: boolean
}

interface EmitsType {
  (e: 'open', index: number): void
  (e: 'select', index: number, optionIndex: number): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  autoClose: true,
  exclusive: true,
})

const emits = defineEmits<EmitsType>()

const useOrderedChildren = <T extends { uid: number }>() => {
  const children: Record<number, T> = {}
  const orderedChildren = shallowRef<T[]>([])

  const addChild = (child: T) => {
    children[child.uid] = child
    orderedChildren.value.push(child)
  }
  const removeChild = (uid: number) => {
    delete children[uid]
    orderedChildren.value = orderedChildren.value.filter(
      (child) => child.uid !== uid
    )
  }

  return {
    children: orderedChildren,
    addChild,
    removeChild,
  }
}

type SwipeActionItemContext = {
  uid: number
}

const {
  children: items,
  addChild: addItem,
  removeChild: removeItem,
} = useOrderedChildren<SwipeActionItemContext>()

// 当前激活的UID
const activeUid = ref<number[]>([])

// 设置当前激活的item
const setActiveItem = (uid: number) => {
  const itemIndex = items.value.findIndex((item) => item.uid === uid)
  const index = activeUid.value.indexOf(uid)
  if (props.exclusive) {
    activeUid.value = index !== -1 ? [] : [uid]
  } else {
    if (index !== -1) {
      activeUid.value.splice(index, 1)
    } else {
      activeUid.value.push(uid)
    }
  }

  emits('open', itemIndex)
}

// 关闭所有item的菜单
const closeAllItemOption = () => {
  activeUid.value = []
}

// 回调当前点击的选项
const optionClick = (uid: number, optionIndex: number) => {
  const itemIndex = items.value.findIndex((item) => item.uid === uid)
  emits('select', itemIndex, optionIndex)
}

provide(
  swipeActionContextKey,
  reactive({
    ...toRefs(props),

    items,
    addItem,
    removeItem,

    activeUid,
    setActiveItem,
    closeAllItemOption,
    optionClick,
  })
)
</script>

<template>
  <div class="z-swipe-action pr">
    <slot></slot>
  </div>
</template>

<style lang="less" scoped>
.z-swipe-action {
  width: 100%;
}
</style>
