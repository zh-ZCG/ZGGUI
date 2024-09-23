<!-- row布局组件 -->
<script lang="ts" setup>
import { getCurrentInstance, computed } from 'vue'
import z from '@/ZGGUI/libs/z'

// #ifdef APP-NVUE
const dom = uni.requireNativePlugin('dom')
// #endif
/**
 * 获取当前页面实例
 */
const instance = getCurrentInstance()

function getParentsWidth() {
  return new Promise(async (resolve, reject) => {
    // #ifndef APP-NVUE
    // 获取实例信息返回
    await z.getDomInfo('#z-row', instance).then((res: any) => {
      resolve(res.width)
    })
    // #endif
    // #ifdef APP-NVUE
    dom.getComponentRect('z-row', (res: any) => {
      resolve(res.size.width)
    })
    // #endif
  })
}

defineExpose({ getParentsWidth })

interface PropsType {
  gutter: number
  justify: string
  align: string
  otherStyle: any
}

interface EmitsType {
  (e: 'clickRow'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  gutter: 0,
  justify: 'center',
  align: 'center',
  otherStyle: {},
})

const emits = defineEmits<EmitsType>()

const juststyle = computed(() => {
  switch (props.justify) {
    case 'start' || 'flex-start' || 'left':
      return 'flex-start'
    case 'end' || 'flex-end' || 'right':
      return 'flex-end'
    case 'center':
      return 'center'
    case 'between':
      return 'space-between'
    case 'around':
      return 'space-around'
    case 'evenly':
      return 'space-evenly'
    default:
      return 'center'
  }
})

const alistyle = computed(() => {
  switch (props.align) {
    case 'start' || 'flex-start' || 'top':
      return 'flex-start'
    case 'end' || 'flex-end' || 'bottom':
      return 'flex-end'
    case 'center':
      return 'center'
    default:
      return 'center'
  }
})

const rowstyle = computed(() => {
  let style = {
    display: 'flex',
    justifyContent: juststyle.value,
    alignItems: alistyle.value,
    marginLeft: '0px',
    marginRight: '0px',
  }
  if (props.gutter) {
    style.marginLeft = '-' + Number(props.gutter) / 2 + 'px'
    style.marginRight = '-' + Number(props.gutter) / 2 + 'px'
  }
  return z.deepMerge(style, props.otherStyle)
})

function clickRow() {
  emits('clickRow')
}
</script>

<template>
  <div :style="[rowstyle]" @tap="clickRow" id="z-row" ref="z-row">
    <slot></slot>
  </div>
</template>

<style lang="less" scoped></style>
