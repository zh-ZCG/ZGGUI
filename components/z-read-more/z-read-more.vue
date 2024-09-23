<!--
 * @Description: z-read-more 展开更多组件
 * @Author: ZGGUI & ui.zggui.cn & zggamazing@163.com
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
  PropType,
} from 'vue'
import type { Ref } from 'vue'
import z from '@/ZGGUI/libs/z'
import zColor from '@/ZGGUI/libs/zColor'
import zIcon from '@/ZGGUI/components/z-icon/z-icon.vue'
import { isPromise } from '@vue/shared'
import { isBoolean } from '@/ZGGUI/libs/lodash/is-boolean'
import { propsHook, PropsTypeHook } from '@/ZGGUI/libs/zHooks'
/**
 * @description: z-read-more 展开更多组件传参
 * @param: expand 默认是否展开（false）
 * @param: height 默认显示内容的高度（125px）
 * @param: showFold 是否显示收起按钮 （true）
 * @param: expandText 展开显示的提示（默认 显示更多）
 * @param: expandIcon 展开显示的提示图标
 * @param: foldText 展开显示的提示（默认 收起）
 * @param: foldIcon 展开显示的提示图标（默认'up'）
 * @param: tipColor 提示文案的颜色(可选主题色 例：primary(默认)...)
 * @param: beforeExpand  展开前回调
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zggui.cn & zggamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  expand?: boolean
  height?: string | number
  showFold?: boolean
  expandText?: string
  expandIcon?: string
  foldText?: string
  foldIcon?: string
  tipColor?: string
  beforeExpand?: Function
}

interface EmitsType {
  /**
   * 展开
   */
  (e: 'expand'): boolean
  /**
   * 收起
   */
  (e: 'fold'): boolean
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  expand: false,
  height: 125,
  showFold: true,
  expandText: '显示更多',
  expandIcon: 'jiantouxia',
  foldText: '收起',
  foldIcon: 'jiantoushang',
  tipColor: 'primary',
})

const emits = defineEmits<EmitsType>()

onMounted(() => {
  nextTick(() => {
    console.log(999)
    getContentRectInfo()
  })
})

const current = getCurrentInstance()!

const readMoreId = current?.uid

const readMoreContentId = 'z-readMore-' + readMoreId + '-content'

const useToggle = (initState: boolean): [Ref<boolean>, () => void] => {
  const state = ref<boolean>(initState)
  const toggle = () => {
    state.value = !state.value
  }

  return [state, toggle]
}

// 是否展开状态
const [expandStatus, toggleExpand] = useToggle(props.expand || false)

watch(
  () => props.expand,
  (val) => {
    expandStatus.value = val
  }
)

// 是否显示操作区域
const showOperationArea = computed<boolean>(
  () => !expandStatus.value || (expandStatus.value && props.showFold)
)
// 操作区域高度
const foldOperationAreaHeight = 40

// 容器高度
const containerHeight = computed<string>(() => {
  if (!expandStatus.value) {
    return z.addUnit(props.height)
  } else {
    return `calc(${z.addUnit(
      contentHeight.value
    )} + ${foldOperationAreaHeight}rpx)`
  }
})

// 内容区域的高度
let contentHeight = ref(0)

// 获取内容区域容器信息
let initCount = 0

const getContentRectInfo = async () => {
  try {
    const rectInfo = await z.getDomInfo(`#${readMoreContentId}`, current)
    initCount = 0
    contentHeight.value = rectInfo.height || 0
  } catch (err) {
    if (initCount > 10) {
      initCount = 0
      z.error(`zReadMore 获取内容容器信息失败: ${err}`)
      return
    }
    initCount++
    setTimeout(() => {
      getContentRectInfo()
    }, 150)
  }
}

// 重置内容容器的高度
const resetContentHeight = () => {
  nextTick(() => {
    getContentRectInfo()
  })
}

// 设置为展开
const setExpand = () => {
  emits('expand')
  toggleExpand()
}
// 设置为折叠
const setFold = () => {
  emits('fold')
  toggleExpand()
}

// 切换折叠、展开状态
const toggleExpandStatus = () => {
  if (expandStatus.value) {
    setFold()
  } else {
    const { beforeExpand } = props
    if (!beforeExpand) {
      setExpand()
      return
    }

    const shouldExpand = beforeExpand()
    const isPromiseOrBoolean = [
      isPromise(shouldExpand),
      isBoolean(shouldExpand),
    ].includes(true)

    if (!isPromiseOrBoolean) {
      z.error('zreadMore,beforeExpand 必须返回 Promise 或者 boolean 类型')
      return
    }

    if (isPromise(shouldExpand)) {
      shouldExpand.then((res) => {
        if (res) {
          setExpand()
        }
      })
    } else {
      if (shouldExpand) {
        setExpand()
      }
    }
  }
}

const operationAreaStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {
    left: 0,
    bottom: 0,
    width: '100%',
    height: 'auto',
  }
  if (props.tipColor) {
    style.color = zColor.getTypeColor(props.tipColor)
  }
  return style
})

defineExpose({
  /**
   * 重新设置高度
   */
  resetContentHeight,
})
</script>

<template>
  <div class="pr ofh z-read-more" :style="{ height: containerHeight }">
    <!-- 内容区域 -->
    <div :id="readMoreContentId">
      <slot></slot>
    </div>

    <!-- 操作区域 -->
    <div
      v-if="showOperationArea"
      class="pa"
      :class="[expandStatus ? 'fold' : 'expand']"
      :style="operationAreaStyle"
      @tap.stop="toggleExpandStatus"
    >
      <template v-if="!expandStatus">
        <slot name="expand">
          <div class="expand z-operation-content">
            <div class="text">{{ expandText }}</div>
            <div class="icon">
              <zIcon :name="expandIcon"></zIcon>
            </div>
          </div>
        </slot>
      </template>
      <template v-else>
        <slot name="fold">
          <div
            class="fold df jcc aic z-operation-content"
            :style="{ height: `${foldOperationAreaHeight}rpx` }"
          >
            <div class="text">{{ foldText }}</div>
            <div class="icon">
              <zIcon :name="foldIcon"></zIcon>
            </div>
          </div>
        </slot>
      </template>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-read-more {
  width: 100%;
  transition: height 0.3s ease;
  .fold {
    background-color: transparent;
  }
  .expand {
    align-items: flex-end;
    padding-bottom: 10rpx;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.1) 0%,
      #fff 70%,
      #fff 100%
    );
  }
  .z-operation-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
