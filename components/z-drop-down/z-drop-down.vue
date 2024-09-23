<!--
 * @Description: z-drop-dow 下拉菜单组件
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
import zOverlay from '../../components/z-overlay/z-overlay.vue'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
/**
 * @description: z-drop-dow 下拉菜单组件传参
 * @param: open 下拉菜单打开状态
 * @param: bgColor	下拉框背景颜色
 * @param: height	下拉框的高度
 * @param: overlay	是否显示遮罩
 * @param: borderRadius  下拉框是否带圆角
 * @param: shadow  下拉框的阴影
 * @param: menuContentGap  下拉菜单和内容之间的距离，默认单位px
 * @param: zIndex  下拉容器zIndex
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  open?: boolean
  bgColor?: string
  height?: string | number
  overlay?: boolean
  borderRadius?: boolean
  shadow?: boolean
  menuContentGap?: string
  zIndex?: number
}

interface EmitsType {
  (e: 'update:open', value: boolean): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  open: false,
  bgColor: '#fff',
  overlay: true,
  borderRadius: true,
  shadow: false,
  zIndex: 1200,
})

const emits = defineEmits<EmitsType>()

// 标记是否为第一次初始化
const firstInit = ref<boolean>(true)
const openContent = ref<boolean>(false)
watch(
  () => props.open,
  (val) => {
    openContent.value = val
  },
  {
    immediate: true,
  }
)

onMounted(() => {
  nextTick(() => {
    firstInit.value = false
  })
})

// 关闭下拉框
const closeDropdown = () => {
  emits('update:open', false)
  if (props.open === undefined) openContent.value = false
  emits('close')
}

// 内容对应的样式
const contentStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  style.backgroundColor = zColor.getTypeColor(props.bgColor)

  if (props.height) {
    style.height = z.addUnit(props.height)
  }

  if (props.menuContentGap) {
    style.top = `calc(100% + ${z.addUnit(props.menuContentGap)})`
  }

  return style
})
</script>

<template>
  <div
    class="z-drop-down pr"
    :class="openContent ? 'open' : ''"
    :style="{ zIndex }"
  >
    <div class="menu pr">
      <slot name="menu"></slot>
      <div
        class="content pa"
        :class="[
          borderRadius ? 'round' : '',
          firstInit ? 'first-init' : '',
          shadow ? 'shadow' : '',
        ]"
        :style="contentStyle"
      >
        <scroll-view class="scroll-view" scroll-y>
          <slot></slot>
        </scroll-view>
      </div>
    </div>

    <zOverlay
      :show="openContent"
      :opacity="!overlay ? 0 : 0.5"
      :duration="250"
      :z-index="zIndex - 1"
      @click="closeDropdown"
    ></zOverlay>
  </div>
</template>

<style lang="less" scoped>
.z-drop-down {
  width: 100%;
  .menu {
    z-index: inherit;
    width: 100%;
    .content {
      left: 0;
      top: 100%;
      width: 100%;
      height: auto;
      z-index: inherit;
      transform-origin: center top;
      transform: scaleY(0);
      transition: transform 0.25s linear;
      .scroll-view {
        width: 100%;
        height: inherit;
      }
    }
    .round {
      border-radius: 0rpx 0rpx 16rpx 16rpx;
      overflow: hidden;
    }
    .first-init {
      transition-duration: 0s;
    }
    .shadow {
      box-shadow: 0rpx 21rpx 30rpx -6rpx rgba(0, 0, 0, 0.03);
    }
  }
}
.open {
  .menu {
    .content {
      transform: scaleY(1);
    }
  }
}
</style>
