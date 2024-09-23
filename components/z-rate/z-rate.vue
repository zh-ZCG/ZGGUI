<!--
 * @Description: z-rate 评分组件
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
} from 'vue'
import z from '@/ZGGUI/libs/z'
import zIcon from '@/ZGGUI/components/z-icon/z-icon.vue'
import { useTouch } from '@/ZGGUI/libs/use-Touch/use-Touch'
import { useFormItem } from '@/ZGGUI/components/z-form/types'
import { propsHook, PropsTypeHook } from '@/ZGGUI/libs/zHooks'
/**
 * @description: z-rate 评分组件传参
 * @param: modelValue 选中的数量
 * @param: min	最小值
 * @param: max	最大值
 * @param: allowHalf  是否允许半选
 * @param: readonly  是否只读
 * @param: size  尺寸大小
 * @param: inactiveIcon  未选中时的图标
 * @param: activeIcon  选中时的图标
 * @param: inactiveColor  未选中时的颜色
 * @param: activeColor  选中时的颜色
 * @param: gutter   每个图标的间距
 * @param: validateEvent   值发生修改时是否触发表单验证
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zggui.cn & zggamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  modelValue?: number
  min?: number
  max?: number
  allowHalf?: boolean
  readonly?: boolean
  size?: string
  inactiveIcon?: string
  activeIcon?: string
  inactiveColor?: string
  activeColor?: string
  gutter?: string
  validateEvent?: boolean
}

interface EmitsType {
  (e: 'update:modelValue', value: number): void
  (e: 'change', value: number): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  modelValue: 0,
  min: 0,
  max: 5,
  readonly: false,
  inactiveIcon: 'star1',
  activeIcon: 'star3',
  validateEvent: true,
})

const emits = defineEmits<EmitsType>()

const { formItem } = useFormItem()

interface RateItemData {
  active: RateItem
  inactive: RateItem
}

interface RateItem {
  icon: string
  color: {
    class: string
    style: string
  }
}

type ItemType = 'active' | 'inactive'
type ItemClassType = (type: ItemType, item: RateItem) => string
type ItemStyleType = (type: ItemType, item: RateItem) => CSSProperties

// item对应的样式
const itemStyle = computed<ItemStyleType>(() => {
  return (type, item) => {
    const style: CSSProperties = {}

    if (props.size) style.fontSize = z.addUnit(props.size)

    if (props.gutter)
      style.padding = `0rpx calc(${z.addUnit(props.gutter)} / 2)`

    if (type === 'active') {
      if (!item.color.class) style.color = item.color.style || '#409eff'
    }
    if (type === 'inactive') {
      if (!item.color.class) style.color = item.color.style || '#666666'
    }

    return style
  }
})

// rate对应的类
const rateStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  if (props.size) style.fontSize = z.addUnit(props.size)

  if (props.readonly) {
    style.opacity = 0.4
  }

  return style
})

const instance = getCurrentInstance()
if (!instance) {
  z.error('z-Rate请在setup函数中使用useRate')
}

// 生成唯一id
const componentId = `z-Rate-${instance?.uid}`

// const { formItem } = useFormItem()

const rateItemData = ref<RateItemData[]>([])

// 生成RateItemData数据
const generateRateItemData = () => {
  const { max, inactiveIcon, activeIcon, inactiveColor, activeColor } = props

  const defaultConfig = {
    inactiveIcon,
    activeIcon,
    inactiveColor,
    activeColor,
  }
  const data: RateItemData[] = []
  for (let i = 0; i < max; i++) {
    const configData = {
      ...defaultConfig,
    }

    data.push({
      active: {
        icon: configData.activeIcon,
        color: {
          class: props.activeColor ? props.activeColor : '',
          style: props.activeColor ? props.activeColor : '',
        },
      },
      inactive: {
        icon: configData.inactiveIcon,
        color: {
          class: props.inactiveColor ? props.inactiveColor : '',
          style: props.inactiveColor ? props.inactiveColor : '',
        },
      },
    })
  }
  rateItemData.value = data
}

generateRateItemData()

const {
  currentX: rateCurrentX,
  updateOptions: updateRateTouchOptions,
  onTouchStart: rateTouchStartHandler,
  onTouchMove: rateTouchMoveHandler,
  onTouchEnd: rateTouchEndHandler,
} = useTouch()

// 更新选中的值
const updateValue = (value: number) => {
  if (Number.isNaN(value)) {
    z.error('z-RateRate回填数据发生错误')
    value = 0
  }
  emits('update:modelValue', value)
  nextTick(() => {
    emits('change', value)
    if (props.validateEvent) {
      formItem?.validate('change').catch((err: any) => {
        z.error(`z-RateRate验证发生错误: ${err}`)
      })
    }
  })
}

// 容器的宽度
let componentItemWidth = 0

const activeItemWidth = ref<number>(0)
watch(
  () => props.modelValue,
  (val) => {
    if (!props.allowHalf) {
      val = Math.ceil(val)
    }
    activeItemWidth.value = val * componentItemWidth
  }
)

let initCount = 0
// 获取组件和item的宽度信息
const getComponentRectInfo = async () => {
  try {
    const itemRectInfo = await z.getDomInfo(
      `#${componentId} .zRateItem`,
      instance
    )
    if (!itemRectInfo?.width) {
      throw new Error('获取组件容器宽度失败')
    }
    console.log(itemRectInfo)
    componentItemWidth = itemRectInfo.width || 0
    const left = itemRectInfo.left || 0

    updateRateTouchOptions({
      left,
      right: componentItemWidth * props.max + left,
      top: itemRectInfo.top,
      bottom: itemRectInfo.bottom,
    })
    let initValue = props.modelValue || 0
    // 初始化完成后，选中值为min
    if (props.modelValue && props.modelValue < props.min) {
      initValue = props.min
    }
    activeItemWidth.value = initValue * componentItemWidth
    updateValue(initValue)
  } catch (err) {
    if (initCount > 10) {
      initCount = 0
      z.error(`z-Rate获取组件容器信息失败: ${err}`)
      return
    }
    initCount++
    setTimeout(() => {
      getComponentRectInfo()
    }, 300)
  }
}

// 组件滑动事件
const onTouchStart = (event: TouchEvent) => {
  rateTouchStartHandler(event)
}
const onTouchMove = (event: TouchEvent) => {
  rateTouchMoveHandler(event)
  // // #ifdef APP-PLUS
  // return
  // // #endif
  if (props.readonly) return
  activeItemWidth.value = rateCurrentX.value
}
const onTouchEnd = (event: TouchEvent) => {
  rateTouchEndHandler(event)
  if (props.readonly) return
  if (props.allowHalf) {
    // 滑动结束后，判断当前滑动的距离是否为item的宽度的一半
    const componentItemWidthHalf = componentItemWidth / 2
    let count = Math.ceil(rateCurrentX.value / componentItemWidthHalf)
    if (count % 2 !== 0) {
      if (
        rateCurrentX.value <
        componentItemWidthHalf * (count - 1) + componentItemWidthHalf / 2
      ) {
        count -= 1
      }
    } else {
      if (
        rateCurrentX.value <
        componentItemWidthHalf * (count - 1) + componentItemWidthHalf / 3
      ) {
        count -= 1
      }
    }
    if (
      rateCurrentX.value <
        componentItemWidthHalf * (count - 1) + componentItemWidthHalf / 2 &&
      count % 2 !== 0
    ) {
      count -= 1
    }

    // 判断是否小于最小值
    if (count < props.min * 2) {
      count = props.min * 2
    }

    activeItemWidth.value = componentItemWidthHalf * count
    updateValue(count / 2)
  } else {
    let count = Math.ceil(rateCurrentX.value / componentItemWidth)

    if (count > 1 && rateCurrentX.value < componentItemWidth * (count - 1)) {
      count -= 1
    }

    // 判断是否小于最小值
    if (count < props.min) {
      count = props.min
    }

    activeItemWidth.value = componentItemWidth * count
    console.log(count)
    updateValue(count)
  }
}

onMounted(() => {
  // #ifndef APP-PLUS || MP-ALIPAY
  nextTick(() => {
    getComponentRectInfo()
  })
  // #endif
  // #ifdef APP-PLUS || MP-ALIPAY
  setTimeout(() => {
    getComponentRectInfo()
  }, 500)
  // #endif
})
</script>

<template>
  <div
    :id="componentId"
    :style="rateStyle"
    class="pr"
    @touchstart.stop.prevent="onTouchStart"
    @touchmove.stop.prevent="onTouchMove"
    @touchend.stop.prevent="onTouchEnd"
  >
    <!-- 默认显示的图标 -->
    <div class="df aic" style="line-height: 1">
      <div
        v-for="(item, index) in rateItemData"
        :key="index"
        class="zRateItem"
        :style="itemStyle('inactive', item.inactive)"
      >
        <zIcon :size="size" :name="item.inactive.icon"></zIcon>
      </div>
    </div>
    <!-- 选中显示的图标 -->
    <div
      class="df aic pa ofh"
      style="line-height: 1; left: 0; right: 0; top: 0; bottom: 0; width: 0"
      :style="{
        width: `${activeItemWidth}px`,
      }"
    >
      <div
        v-for="(item, index) in rateItemData"
        :key="index"
        class="zRateItem"
        :style="itemStyle('active', item.active)"
      >
        <zIcon :size="size" :name="item.active.icon"></zIcon>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped></style>
