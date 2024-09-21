<!--
 * @Description: z-slider 滑动条组件
 * @Author: ZCGUI & ui.zcgui.cn & zcgamazing@163.com
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
  reactive,
} from 'vue'
import z from '@/ZCGUI/libs/z'
import zType from '@/ZCGUI/libs/zType'
import zColor from '@/ZCGUI/libs/zColor'
import {
  useFormSize,
  useFormDisabled,
  useFormItem,
} from '@/ZCGUI/components/z-form/types'
import { useTouch } from '@/ZCGUI/libs/use-Touch/use-Touch'
import { Arrayable } from '@/ZCGUI/components/z-form/types'
import { propsHook, PropsTypeHook } from '@/ZCGUI/libs/zHooks'
/**
 * @description: z-slider 滑动条组件传参
 * @param: modelValue 滑块绑定的值
 * @param: size		 滑动条的尺寸
 * @param: sliderBarSize	滑块的尺寸
 * @param: sliderHeight  滑动条的高度
 * @param: activeColor  激活时的颜色
 * @param: inactiveColor  非激活时的颜色
 * @param: disabled  是否禁用
 * @param: step  滑动条的步进值
 * @param: min  滑动条的最小值
 * @param: max  滑动条的最大值
 * @param: validateEvent  值发生修改时是否触发表单验证
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZCGUI & ui.zcgui.cn & zcgamazing@163.com
 * @example:
 */

type zSliderValueType = Arrayable<number>

type zSliderSize = 'small' | 'normal' | 'large'

type zSliderMode = 'single' | 'range'

interface zSliderNode {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

interface PropsType extends PropsTypeHook {
  modelValue?: zSliderValueType
  size?: zSliderSize
  sliderBarSize?: string | number
  sliderHeight?: string | number
  activeColor?: string
  inactiveColor?: string
  disabled?: boolean
  step?: number
  min?: number
  max?: number
  validateEvent?: boolean
}

interface EmitsType {
  (e: 'update:modelValue', value: zSliderValueType): void
  (e: 'change', value: zSliderValueType): void
  (e: 'input', value: zSliderValueType): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  modelValue: 0,
  size: 'normal',
  activeColor: '',
  inactiveColor: '',
  step: 1,
  min: 0,
  max: 100,
  validateEvent: true,
})

const emits = defineEmits<EmitsType>()

const instance = getCurrentInstance()!

const sliderId = `z-slider-${instance?.uid}`

const useSliderCommonProps = (props: PropsType) => {
  // 滑动条的尺寸
  const size = useFormSize(props.size)

  // 滑动条是否禁用
  const disabled = useFormDisabled(props.disabled)

  return {
    size,
    disabled,
  }
}

const { formItem } = useFormItem()

// 是否搭配FormItem一起使用
const isFormItem = computed(() => !!formItem)

const sliderValue = ref<zSliderValueType>(
  z.isEmptyVariableInDefault(props.modelValue, 0)
)

// 初始化数据
const initSliderValue = () => {
  let val = props.modelValue
  if (zType.isArray(val)) {
    // 判断是否为空数组
    if (val.length === 0) {
      val = [0, 0]
    } else if (val.length === 1) {
      val = [0, Math.min(val[0], props.max)]
    } else {
      val = [
        Math.max(Math.min(val[0], val[1]), props.min),
        Math.min(Math.max(val[0], val[1], props.min), props.max),
      ]
    }
  } else {
    val = Math.min(Math.max(z.isEmptyVariableInDefault(val, 0), props.min), props.max)
  }

  nextTick(() => {
    emits('update:modelValue', val)
  })
}
initSliderValue()
watch(
  () => props.modelValue,
  val => {
    sliderValue.value = val
  }
)

// 滑动条的模式，如果modelValue是数组则为范围模式
const mode = computed<zSliderMode>(() =>
  zType.isArray(sliderValue.value) ? 'range' : 'single'
)

// 精确的小数点位数
const precision = computed(() => {
  const precision = [props.min, props.max, props.step].map(item => {
    const decimal = `${item}`.split('.')[1]
    return decimal ? decimal.length : 0
  })
  return Math.max.apply(null, precision)
})

// 获取处理传递过来的值
const handleInputValue = (value: number, type?: 'min' | 'max') => {
  if (mode.value === 'single') {
    return value
  } else {
    const minValue = (sliderValue.value as number[])![0]
    const maxValue = (sliderValue.value as number[])![1]
    if (type === 'min') {
      return [
        Math.min(Math.max(props.min, value), maxValue),
        (sliderValue.value as number[])![1],
      ]
    } else {
      return [
        (sliderValue.value as number[])![0],
        Math.max(Math.min(value, props.max), minValue),
      ]
    }
  }
}

// 更新滑动条的值
const updateSliderValue = (_value: number, type?: 'min' | 'max') => {
  const value = handleInputValue(_value, type)
  emits('update:modelValue', value)

  nextTick(() => {
    emits('input', value)
  })

  if (props.validateEvent) {
    formItem?.validate('input').catch(err => {
      z.error(err)
    })
  }
}

// 修改滑动条的值
const changeSliderValue = (_value: number, type?: 'min' | 'max') => {
  const value = handleInputValue(_value, type)
  emits('change', value)

  if (props.validateEvent) {
    formItem?.validate('change').catch(err => {
      z.error(err)
    })
  }
}

const { size, disabled } = useSliderCommonProps(props)

const sliderNodeInfo = reactive<zSliderNode>({
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  width: 0,
  height: 0,
})

const {
  currentX: sliderBarCurrentX,
  updateOptions: sliderTouchUpdateOptions,
  onTouchStart: sliderTouchStart,
  onTouchMove: sliderTouchMove,
  onTouchEnd: sliderTouchEnd,
} = useTouch()

// 更新禁用状态
watch(
  () => disabled,
  val => {
    sliderTouchUpdateOptions({
      disabled: val.value,
    })
  }
)

// 初始化滑动条的布局信息
// 初始化次数
let initCount = 0
const initSliderNodeInfo = async () => {
  try {
    const sliderRectInfo = await z.getDomInfo(`#${sliderId}`, instance)
    if (!sliderRectInfo) {
      throw new Error('获取滑动条的布局信息失败')
    }
    initCount = 0
    sliderNodeInfo.left = sliderRectInfo.left || 0
    sliderNodeInfo.top = sliderRectInfo.top || 0
    sliderNodeInfo.right = sliderRectInfo.right || 0
    sliderNodeInfo.bottom = sliderRectInfo.bottom || 0
    sliderNodeInfo.width = sliderRectInfo.width || 0
    sliderNodeInfo.height = sliderRectInfo.height || 0

    // 初始化触摸的参数
    sliderTouchUpdateOptions({
      left: sliderNodeInfo.left,
      right: sliderNodeInfo.right,
      top: sliderNodeInfo.top,
      bottom: sliderNodeInfo.bottom,
    })
  } catch (err) {
    initCount++
    if (initCount > 10) {
      initCount = 0
      z.error(`zSilider 获取滑动条的布局信息失败: ${err}`)
      return
    }
    setTimeout(() => {
      initSliderNodeInfo()
    }, 150)
  }
}

// 滑块滑动中
const onSliderBarTouchMove = (event: TouchEvent, type: 'min' | 'max') => {
  sliderTouchMove(event)
  // 滑块的位置
  const sliderBarPosition = (sliderBarCurrentX.value / sliderNodeInfo.width) * 100
  const value = setPosiiton(sliderBarPosition)
  updateSliderValue(value, type)
}

// 滑块滑动结束
const onSliderBarTouchEnd = (event: TouchEvent, type: 'min' | 'max') => {
  sliderTouchEnd(event)
  // 滑块的位置
  const sliderBarPosition = (sliderBarCurrentX.value / sliderNodeInfo.width) * 100
  const value = setPosiiton(sliderBarPosition)
  changeSliderValue(value, type)
}

// 滑动条点击事件
const sliderClickEvent = (event: any) => {
  if (disabled.value) return
  let touchX = 0
  // #ifndef MP-ALIPAY
  touchX = event.detail.x
  // #endif
  // #ifdef MP-ALIPAY
  touchX = event.detail.clientX
  // #endif
  const sliderBarPosition =
    ((touchX - sliderNodeInfo.left) / sliderNodeInfo.width) * 100
  const value = setPosiiton(sliderBarPosition)
  if (mode.value === 'single') {
    updateSliderValue(value)
    changeSliderValue(value)
  } else if (mode.value === 'range') {
    // 判断当前点击位置靠近那个值
    const minValue = (sliderValue.value as number[])[0]
    const maxValue = (sliderValue.value as number[])[1]
    const minDistance = Math.abs(minValue - value)
    const maxDistance = Math.abs(maxValue - value)
    if (minDistance < maxDistance) {
      updateSliderValue(value, 'min')
      changeSliderValue(value, 'min')
    } else {
      updateSliderValue(value, 'max')
      changeSliderValue(value, 'max')
    }
  }
}

// 设置滑块的位置
const setPosiiton = (position: number): number => {
  if (position === null || Number.isNaN(+position)) return 0
  if (position < 0) position = 0
  else if (position > 100) position = 100

  // 每一步的长度
  const lengthPerStep = 100 / ((props.max - props.min) / props.step)
  // 当前在第几步
  const steps = Math.round(position / lengthPerStep)
  // 计算当前的值
  let value = steps * lengthPerStep * (props.max - props.min) * 0.01 + props.min
  value = Number.parseFloat(value.toFixed(precision.value))

  return value
}

// 滑块的位置
const sliderBarPosition = computed<[string, string]>(() => {
  if (mode.value === 'single') {
    return [
      `${
        (((sliderValue.value as number) - props.min) / (props.max - props.min)) * 100
      }%`,
      '0',
    ]
  } else {
    return [
      `${
        (((sliderValue.value as number[])[0] - props.min) / (props.max - props.min)) *
        100
      }%`,
      `${
        (((sliderValue.value as number[])[1] - props.min) / (props.max - props.min)) *
        100
      }%`,
    ]
  }
})

// 滑动条所属类
const sliderClass = computed<string>(() => {
  const cls: string[] = ['z-slider']

  // 设置滑动条的尺寸
  if (size.value) cls.push(`z-slider-${size.value}`)

  // 设置禁用状态
  if (disabled.value) cls.push('z-slider-disabled')

  return cls.join(' ')
})

// 滑动条样式
const sliderStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  // 设置滑动条的高度
  if (props.sliderHeight) style.height = z.addUnit(props.sliderHeight)

  // 设置未激活时的颜色
  style.backgroundColor =
    props.inactiveColor || zColor.getTypeColor('colorSliderDefault')

  return style
})

// 激活时滑动条所属类
const activeSliderClass = computed<string>(() => {
  const cls: string[] = ['z-slider-active']

  return cls.join(' ')
})

// 激活时滑动条样式
const activeSliderStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  // 设置激活时的颜色
  style.backgroundColor = props.activeColor || zColor.getTypeColor('primary')

  // 激活时显示对应的宽度
  if (mode.value === 'single') {
    style.width = sliderBarPosition.value[0]
  } else if (mode.value === 'range') {
    style.width = `calc(${sliderBarPosition.value[1]} - ${sliderBarPosition.value[0]})`
    style.left = sliderBarPosition.value[0]
  }
  return style
})

// 滑块所属类
const sliderBarClass = computed<string>(() => {
  const cls: string[] = ['z-slider-bar']

  return cls.join(' ')
})

// 滑块样式
const sliderBarStyle = computed<(type: 'min' | 'max') => CSSProperties>(() => {
  return type => {
    const style: CSSProperties = {}

    // 设置滑块的尺寸
    if (props.sliderBarSize)
      style.width = style.height = z.addUnit(props.sliderBarSize)

    // 更新滑块的位置
    style.left =
      type === 'min' ? sliderBarPosition.value[0] : sliderBarPosition.value[1]

    return style
  }
})

onMounted(() => {
  nextTick(() => {
    initSliderNodeInfo()
  })
})
</script>

<template>
  <div
    :id="sliderId"
    :class="[sliderClass, isFormItem ? 'z-slider-form-item' : '']"
    :style="sliderStyle"
    @tap.stop="sliderClickEvent"
  >
    <!-- 激活时的滑动条 -->
    <div
      :class="[activeSliderClass]"
      :style="activeSliderStyle"
      @tap.stop="sliderClickEvent"
    ></div>
    <!-- 开始滑块 -->
    <div
      :class="[sliderBarClass]"
      :style="sliderBarStyle('min')"
      @touchstart.prevent="disabled ? '' : sliderTouchStart"
      @touchmove.prevent="disabled ? '' : onSliderBarTouchMove($event, 'min')"
      @touchend.prevent="disabled ? '' : onSliderBarTouchEnd($event, 'min')"
    ></div>
    <!-- 结束滑块 -->
    <div
      v-if="mode === 'range'"
      :class="[sliderBarClass]"
      :style="sliderBarStyle('max')"
      @touchstart.prevent="disabled ? '' : sliderTouchStart"
      @touchmove.prevent="disabled ? '' : onSliderBarTouchMove($event, 'max')"
      @touchend.prevent="disabled ? '' : onSliderBarTouchEnd($event, 'max')"
    ></div>
  </div>
</template>

<style lang="less" scoped>
.z-slider {
  position: relative;
  width: 100%;
  border-radius: 1000rpx;
  .z-slider-active {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 0%;
    border-radius: inherit;
  }
}
.z-slider-small {
  height: 12rpx;
  .z-slider-bar {
    position: absolute;
    left: 0;
    top: 50%;
    width: 26rpx;
    height: 26rpx;
    border-radius: 50%;
    background-color: #fff;
    box-shadow: 0rpx 0rpx 20rpx 0rpx rgba(0, 0, 0, 0.1);
    transform: translate(-50%, -50%);
  }
}
.z-slider-normal {
  height: 16rpx;
  .z-slider-bar {
    position: absolute;
    left: 0;
    top: 50%;
    width: 26rpx;
    height: 26rpx;
    border-radius: 50%;
    background-color: #fff;
    box-shadow: 0rpx 0rpx 20rpx 0rpx rgba(0, 0, 0, 0.1);
    transform: translate(-50%, -50%);
  }
}
.z-slider-large {
  height: 20rpx;
  .z-slider-bar {
    position: absolute;
    left: 0;
    top: 50%;
    width: 26rpx;
    height: 26rpx;
    border-radius: 50%;
    background-color: #fff;
    box-shadow: 0rpx 0rpx 20rpx 0rpx rgba(0, 0, 0, 0.1);
    transform: translate(-50%, -50%);
  }
}
.z-slider-disabled {
  opacity: 0.4;
}
</style>
