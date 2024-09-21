<!-- z-sticky 该组件用作粘性布局（吸顶操作） -->
<script lang="ts" setup>
import {
  ref,
  getCurrentInstance,
  watch,
  nextTick,
  onMounted,
  onUnmounted,
  computed,
} from 'vue'
import type { Ref, PropType, CSSProperties } from 'vue'
import z from '@/ZCGUI/libs/z'
import { useObserver } from '@/ZCGUI/libs/Hooks/z-use-observe'
import { useStickySupport } from '@/ZCGUI/libs/Hooks/z-use-sticky-support'
import { propsHook, PropsTypeHook } from '@/ZCGUI/libs/zHooks'
/**
 * @description: z-sticky 吸顶组件传参
 * @param: enabled 是否开启粘性布局
 * @param: offsetTop	粘性布局的距离顶部的距离
 * @param: zIndex	zIndex
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZCGUI & ui.zcgui.cn & zcgamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  enabled?: boolean
  offsetTop?: number
  zIndex?: number
}

interface EmitsType {
  (e: 'change', fixed: boolean): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  bgColor: 'transparent',
  enabled: true,
  offsetTop: 0,
  zIndex: 5000,
})

const emits = defineEmits<EmitsType>()

const instance = getCurrentInstance()

if (!instance) {
  z.error('z-sticky useSticky 必须在 setup 中使用')
}
const { emit } = instance!

// 组件id
const componentId = `z-${instance?.uid}`

// 吸顶的距离
const stickyDistance = computed<number>(() => {
  return props.offsetTop ? props.offsetTop : 0
})

// 是否吸顶
const stickyStatus = ref<boolean>(false)
// 设置吸顶的状态
const setStickyStatus = (status: boolean) => {
  if (status) {
    emit('change', true)
  } else if (stickyStatus.value) {
    emit('change', false)
  }
  stickyStatus.value = status
}

type StickyRectInfo = {
  width: string | number
  height: string | number
  left: number
}

// 初始化节点次数
let initCount = 0
// sticky容器节点信息，防止在js模式下设置为fixed后元素塌陷无法进行交互
const stickyContainerRect = ref<StickyRectInfo>({
  width: 'auto',
  height: 'auto',
  left: 0,
})

const { connectObserver, disconnectObserver } = useObserver(instance)
const { supportCSSSticky, checkCSSStickySupport } = useStickySupport()

// 监听节点信息
const monitorNodeInfo = () => {
  connectObserver(
    `#${componentId}`,
    observerRes => {
      if (!props.enabled) return
      setStickyStatus(observerRes.boundingClientRect.top <= stickyDistance.value)
    },
    {
      type: 'relativeToViewport',
      margins: {
        top: -stickyDistance.value,
      },
    },
    {
      thresholds: [0.95, 0.98, 1],
    }
  )
}
// 初始化Observer
const initObserver = async () => {
  disconnectObserver()
  try {
    const rectInfo = await z.getDomInfo(`#${componentId}`, instance)

    initCount = 0
    // 设置容器信息
    stickyContainerRect.value.width = rectInfo.width || 0
    stickyContainerRect.value.height = rectInfo.height || 0
    stickyContainerRect.value.left = rectInfo.left || 0

    nextTick(() => {
      monitorNodeInfo()
    })
  } catch (err) {
    if (initCount > 10) {
      initCount = 0
      z.error(`z-sticky 获取sticky节点信息失败: ${err}`)
      return
    }
    initCount++
    setTimeout(() => {
      initObserver()
    }, 150)
  }
}

watch(
  () => supportCSSSticky.value,
  val => {
    if (val === false && props.enabled) {
      initObserver()
    }
  }
)

// 如果修改了吸顶高度则重新进行监听
watch(
  () => props.offsetTop,
  () => {
    nextTick(() => {
      initSticky()
    })
  }
)

// 监听是否动态设置吸顶状态
watch(
  () => props.enabled,
  val => {
    if (!val) {
      setStickyStatus(false)
      disconnectObserver()
    } else {
      disconnectObserver()
      monitorNodeInfo()
    }
  }
)

// 初始化组件
const initSticky = () => {
  checkCSSStickySupport(`#${componentId}`)
}

onMounted(() => {
  nextTick(() => {
    initSticky()
  })
})

onUnmounted(() => {
  disconnectObserver()
})

const stickyStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  // 设置ZIndex
  if (props.zIndex) style.zIndex = props.zIndex

  // 开启吸顶
  if (props.enabled) {
    // 是否支持css sticky
    if (supportCSSSticky.value) {
      style.position = 'sticky'
      style.top = `${stickyDistance.value}px`
    } else {
      style.height = stickyStatus.value
        ? z.addUnit(stickyContainerRect.value.height)
        : 'auto'
    }
  } else {
    // 不需要吸顶的情况下设置默认的position
    // #ifdef APP-NVUE
    style.position = 'relative'
    // #endif
    // #ifndef APP-NVUE
    style.position = 'static'
    // #endif
  }

  return style
})

// sticky内容样式
const stickyContentStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  // 不支持CSS Sticky，使用fixed布局实现
  if (!supportCSSSticky.value) {
    style.position = stickyStatus.value ? 'fixed' : 'static'
    style.top = `${stickyDistance.value}px`
    style.left = `${stickyContainerRect.value.left}px`
    style.width = z.addUnit(stickyContainerRect.value.width)
  }

  if (stickyDistance.value > 0) {
    style.top = `${stickyDistance.value}px`
  }

  return style
})
</script>

<template>
  <div :id="componentId" class="z-sticky" :style="stickyStyle">
    <div class="content" :style="stickyContentStyle">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-sticky {
  /* #ifdef APP-VUE || MP-WEIXIN */
  position: sticky;
  /* #endif */
  .content {
    width: 100%;
    z-index: inherit;
  }
}
</style>
