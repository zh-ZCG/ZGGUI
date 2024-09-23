<!--
 * @Description: z-water-fall 瀑布流组件
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
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
/**
 * @description: z-water-fall 瀑布流组件传参
 * @param: data 列表数据
 * @param: mode	瀑布流模式
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */

type waterFallModes = 'normal' | 'calc'

interface PropsType extends PropsTypeHook {
  data?: Array<any>
  mode?: waterFallModes
}

interface EmitsType {}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  data: () => [],
  mode: 'normal',
})

const emits = defineEmits<EmitsType>()

const instance = getCurrentInstance()
if (!instance) {
  z.error('zWaterFall 请在 setup 中使用 useWaterFall')
}
const componentId = `z-water-fall-${instance?.uid}`

// 切割左右两边数据
const leftData = ref<any[]>([])
const rightData = ref<any[]>([])

// 获取左右两边容器的高度信息
let leftContainerHeight = 0
let rightContainerHeight = 0
const getContainerHeight = async () => {
  try {
    const leftContainerRectInfo = await z.getDomInfo(
      `#${componentId}-left`,
      instance
    )
    const rightContainerRectInfo = await z.getDomInfo(
      `#${componentId}-right`,
      instance
    )

    leftContainerHeight = leftContainerRectInfo.height || leftContainerHeight
    rightContainerHeight = rightContainerRectInfo.height || rightContainerHeight
  } catch (err) {
    z.error(`zWaterFall 获取容器高度信息失败：${err}`)
  }
}

// 旧数据
let oldUserData: any[] = []
// 分割数据
const splitData = async (data: any[]) => {
  if (!data || !data.length) return
  if (props.mode === 'calc') {
    // 根据左右两边的数据高度，判断当前数据应该放在左边还是右边
    await getContainerHeight()
    if (leftContainerHeight <= rightContainerHeight) {
      leftData.value.push(data.shift())
    } else {
      rightData.value.push(data.shift())
    }
    nextTick(() => {
      setTimeout(() => {
        splitData(data)
      }, 200)
    })
  } else if (props.mode === 'normal') {
    // 判断当前的第一个元素是放在左边还是右边
    let firstLeft = true
    await getContainerHeight()
    if (leftData.value.length > rightData.value.length) {
      firstLeft = false
    }
    let leftSmall = false
    if (leftContainerHeight < rightContainerHeight) {
      leftSmall = true
    }

    // 按照顺序，左右交替放置数据
    data.forEach((item, index) => {
      if ((index % 2 === 0 && firstLeft) || leftSmall) {
        leftData.value.push(item)
      } else {
        rightData.value.push(item)
      }
      if (!firstLeft) {
        firstLeft = true
      }
      if (leftSmall && index >= 2) {
        leftSmall = false
      }
    })
  }
}

// 重新渲染列表
const resetWaterFall = () => {
  if (!props.data) return
  leftData.value = []
  rightData.value = []
  leftContainerHeight = 0
  rightContainerHeight = 0
  nextTick(() => {
    oldUserData = props.data
    splitData(props.data)
  })
}

watch(
  () => props.data,
  (val) => {
    if (!val) return
    if (oldUserData.length === val.length) return
    const newData = z.deepClone(val.slice(oldUserData.length))
    if (!newData.length) {
      leftData.value = []
      rightData.value = []
      leftContainerHeight = 0
      rightContainerHeight = 0
    }
    nextTick(() => {
      oldUserData = val
      splitData(newData)
    })
  },
  {
    immediate: true,
  }
)

defineExpose({
  /**
   * @description 重置瀑布流
   */
  reset: resetWaterFall,
})
</script>

<template>
  <div class="z-water-fall pr df fww">
    <!-- 左边数据 -->
    <div :id="`${componentId}-left`" class="left container">
      <div v-for="(item, index) in leftData" :key="index" class="item">
        <slot name="left" :item="item" :index="index"></slot>
      </div>
    </div>
    <!-- 右边数据 -->
    <div :id="`${componentId}-right`" class="right container">
      <div v-for="(item, index) in rightData" :key="index" class="item">
        <slot name="right" :item="item" :index="index"></slot>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-water-fall {
  width: 100%;
  .container {
    width: calc(100% / 2);
    height: fit-content;
  }
}
</style>
