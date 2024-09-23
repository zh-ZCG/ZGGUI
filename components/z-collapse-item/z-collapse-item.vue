<!--
 * @Description: z-collapse-item 折叠面板子组件
 * @Author: ZGGUI & ui.zggui.cn & zcgamazing@163.com
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
  inject,
  toRef,
} from 'vue'
import z from '@/ZGGUI/libs/z'
import zIcon from '@/ZGGUI/components/z-icon/z-icon.vue'
import zColor from '@/ZGGUI/libs/zColor'
import { collapseContextKey } from '@/ZGGUI/components/z-collapse/z-collapse'
import { propsHook, PropsTypeHook } from '@/ZGGUI/libs/zHooks'
/**
 * @description: z-collapse-item 折叠面板子组件传参
 * @param: title CollapseItem标题
 * @param: disabled	CollapseItem是否禁用
 *
 * @tutorial: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  title?: string
  disabled?: boolean
}

interface EmitsType {}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
})

const emits = defineEmits<EmitsType>()

const instance = getCurrentInstance()
if (!instance) {
  z.error('zCollapseItem 请在 setup 函数中使用 zCollapseItem')
}
const { uid } = instance!

const collapse = inject(collapseContextKey)
if (!collapse) {
  z.error('zCollapseItem 请在 zCollapse 中使用 zCollapseItem')
}

collapse?.addItem({ uid })

const componentContentId = `z-collapse-${instance?.uid}`

// 当前组件是否为激活状态
const isActive = computed<boolean>(() => {
  if (!collapse) return false
  return collapse.activeUid.includes(uid)
})

// 是否显示折叠面板箭头
const showArrow = computed<boolean>(() =>
  z.isEmptyVariableInDefault(collapse?.showArrow, false)
)

// 组件内容的高度
const compoenntContentDefaultHeight = ref<number>(0)
const componentTitleHeight = ref<number>(uni.upx2px(100))
const componentHeight = computed<string>(() => {
  if (!isActive.value) return `${componentTitleHeight.value}px`
  else
    return `${
      componentTitleHeight.value + compoenntContentDefaultHeight.value
    }px`
})

let initCount = 0
// 获取内容容器高度
const getComponentContentHeight = async () => {
  try {
    const rectInfo = await z.getDomInfo(`#${componentContentId}`, instance)

    initCount = 0
    compoenntContentDefaultHeight.value = rectInfo.height || 0
  } catch (err) {
    if (initCount > 10) {
      initCount = 0
      z.error(`zCollapseItem 获取内容高度失败: ${err}`)
      return
    }
    initCount++
    setTimeout(() => {
      getComponentContentHeight()
    }, 150)
  }
}

// CollapseItem 点击事件
const collapseItemClick = () => {
  if (props.disabled) return
  collapse?.handleItemClick(uid)
}

onMounted(() => {
  nextTick(() => {
    getComponentContentHeight()
  })
})

// 折叠面板图标对应样式
const arrowStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}
  style.color = zColor.getTypeColor(
    z.isEmptyVariableInDefault(
      toRef(collapse!, 'arrowColor'),
      zColor.getTypeColor('info')
    ).value
  )

  return style
})
</script>

<template>
  <div
    class="z-collapse-item pr ofh"
    :class="[
      isActive ? 'z-collapse-item-active' : '',
      disabled ? 'z-collapse-item-disabled' : '',
    ]"
    :style="{ height: componentHeight }"
  >
    <!-- 标题 -->
    <div class="title" @tap.stop="collapseItemClick">
      <div class="content">
        <slot name="title">
          {{ title }}
        </slot>
      </div>
      <div v-if="showArrow" class="arrow" :style="arrowStyle">
        <zIcon name="chevron-right1"></zIcon>
      </div>
    </div>

    <!-- 内容区域 -->
    <div :id="componentContentId" class="content">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-collapse-item {
  width: 100%;
  transition: height 0.3s ease;
  .title {
    position: relative;
    height: 100rpx;
    padding: 0rpx 30rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .arrow {
      transition: transform 0.3s;
      transform: rotate(0deg);
    }
  }
  .content {
    position: relative;
    padding: 0 30rpx;
    height: auto;
    transition: opacity 0.3s ease;
  }
}
.z-collapse-item-active {
  .title {
    .arrow {
      transform: rotate(90deg);
    }
  }
  .content {
    opacity: 1;
  }
}
.z-collapse-item-disabled {
  opacity: 0.6;
  background-color: @bgDefault;
}
</style>
