<!--
 * @Description: z-number-box 步进器组件
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
  toRef,
} from 'vue'
import z from '../../libs/z'
import zColor from '../../libs/zColor'
import zIcon from '../../components/z-icon/z-icon.vue'
import { useLongPress } from '../../libs/Hooks/z-use-long-press'
import {
  useFormSize,
  useFormDisabled,
  useFormItem,
  FormItemValidateStates,
} from '../../components/z-form/types'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
/**
 * @description: z-number-box 步进器组件传参
 * @param: modelValue 步进器绑定的值
 * @param: size		步进器的尺寸
 * @param: width	步进器的宽度
 * @param: height  步进器的高度
 * @param: fontSize  文字大小
 * @param: bgColor  步进器背景颜色
 * @param: textColor  步进器字体颜色
 * @param: min  步进器的最小值
 * @param: max  步进器的最大值
 * @param: step  步进器的步长
 * @param: disabled  禁止步进器操作
 * @param: inputDisabled  禁止步进器输入
 * @param: longPress  长按递增减
 * @param: longPressInterval  长按递增减的间隔时间，单位ms
 * @param: validateEvent  值发生修改时是否触发表单验证
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */

type zNumberBoxSize = 'normal' | 'small' | 'large'

interface PropsType extends PropsTypeHook {
  modelValue?: number
  size?: zNumberBoxSize
  width?: string
  height?: string
  fontSize?: string
  bgColor?: string
  textColor?: string
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  inputDisabled?: boolean
  longPress?: boolean
  longPressInterval?: number
  validateEvent?: boolean
}

interface EmitsType {
  (e: 'update:modelValue', val: number): void
  (e: 'change', val: number): void
  (e: 'input', val: number): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  modelValue: 0,
  size: 'normal',
  min: 0,
  max: 100,
  step: 1,
  longPress: true,
  longPressInterval: 250,
  validateEvent: true,
})

const emits = defineEmits<EmitsType>()
const inputValue = ref<number>(0)

const { form, formItem } = useFormItem()

// 更新输入框的值
watch(
  () => props.modelValue,
  (val) => {
    const value = val ? val : 0
    inputValue.value = Math.max(props.min, Math.min(value, props.max))
  },
  {
    immediate: true,
  }
)

// 步进值
const step = computed<number>(() => props.step || 1)

const operationEvent = (type: 'minus' | 'plus') => {
  if (props.disabled) return
  let value = inputValue.value
  if (type === 'minus') value -= step.value
  else if (type === 'plus') value += step.value

  if (value < props.min) {
    value = props.min
    props.longPress && clearLongPressTimer()
  }
  if (value > props.max) {
    value = props.max
    props.longPress && clearLongPressTimer()
  }
  updateNumberBoxValue(value)
}

const { clearLongPressTimer, handleLongPressEvent: handleOperationEvent } =
  useLongPress<['minus' | 'plus']>(
    operationEvent,
    toRef(props, 'longPress'),
    props.longPressInterval
  )

// input输入框输入事件
const numberBoxInputEvent = (e: any) => {
  const inputEventValue = e.detail.value || 0
  let value = Number(inputEventValue)
  // 判断边缘值
  if (value < props.min) {
    value = props.min
  }
  if (value > props.max) {
    value = props.max
  }

  emits('input', inputEventValue)
  if (props.validateEvent) {
    formItem?.validate('input').catch(() => {})
  }
  updateNumberBoxValue(value)
}

// 更新步进器的值
const updateNumberBoxValue = (value: number) => {
  // 获取step的小数位
  const stepValueArray: string[] = step.value.toString().split('.')
  const decimalCount: number =
    stepValueArray.length > 1 ? stepValueArray[1].length : 0
  value = Number(value.toFixed(decimalCount))
  nextTick(() => {
    setTimeout(() => {
      inputValue.value = value
    }, 0)
  })
  emits('update:modelValue', value)
  nextTick(() => {
    emits('change', value)
    if (props.validateEvent) {
      formItem?.validate?.('change').catch((err) => {
        z.error(JSON.stringify(err))
      })
    }
  })
}

type OperationWrapperType = 'minus' | 'input' | 'plus'
type OperationWrapperStyle = (type: OperationWrapperType) => CSSProperties

function getNumberBoxSize(style: string, operation?: string) {
  let result = ''
  switch (props.size) {
    case 'small': {
      if (style === 'width') result = '150rpx'
      if (style === 'height') result = '40rpx'
      if (style === 'fontSize') result = '22rpx'
      break
    }
    case 'normal': {
      if (style === 'width') result = '180rpx'
      if (style === 'height') result = '50rpx'
      if (style === 'fontSize') result = '28rpx'
      break
    }
    case 'large': {
      if (style === 'width') result = '220rpx'
      if (style === 'height') result = '60rpx'
      if (style === 'fontSize') result = '36rpx'
      break
    }
  }
  if (operation) {
    return `calc(${result} ${operation})`
  } else {
    return result
  }
}

// 步进器对应样式
const numberBoxStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  style.width = getNumberBoxSize('width')
  style.height = getNumberBoxSize('height')
  style.fontSize = getNumberBoxSize('fontSize')

  // 设置容器的宽高
  if (props.width) style.width = z.addUnit(props.width)
  if (props.height) style.height = z.addUnit(props.height)

  // 设置字体大小
  if (props.fontSize) style.fontSize = z.addUnit(props.fontSize)

  if (props.disabled) {
    style.opacity = 0.3
  }

  return style
})

// 步进器操作区域对应的样式
const numberBoxOperationWrapperStyle = computed<OperationWrapperStyle>(() => {
  return (type: OperationWrapperType) => {
    const style: CSSProperties = {}

    style.width = getNumberBoxSize('width')
    style.height = getNumberBoxSize('height')
    style.fontSize = getNumberBoxSize('fontSize', '* 1.2')

    // 设置背景颜色和字体颜色
    style.backgroundColor = zColor.getTypeColor(props.bgColor || '#e6e6e6')
    if (props.textColor) style.color = zColor.getTypeColor(props.textColor)

    if(props.height) style.height = z.addUnit(props.height)

    // 设置操作按钮的宽高
    if (type === 'minus' || type === 'plus') {
      if (props.height) {
        style.width = z.addUnit(props.height)
        style.height = style.width
      }
      if (props.fontSize) {
        style.fontSize = `calc(${z.addUnit(props.fontSize)} * 1.2)`
      }
    }
    if (
      (type === 'minus' && inputValue.value <= props.min) ||
      (type === 'plus' && inputValue.value >= props.max)
    ) {
      style.opacity = 0.4
    }

    return style
  }
})
</script>

<template>
  <div class="z-number-box" :style="numberBoxStyle">
    <!-- 减操作按钮 -->
    <div
      class="operation-btn"
      :style="numberBoxOperationWrapperStyle('minus')"
      hover-class="z-btn-hover"
      :hover-stay-time="250"
      @touchstart.stop.prevent="handleOperationEvent('minus')"
      @touchend.stop.prevent="clearLongPressTimer"
    >
      <slot name="minus">
        <zIcon name="jianshao"></zIcon>
      </slot>
    </div>

    <!-- 输入框 -->
    <div class="input" :style="numberBoxOperationWrapperStyle('input')">
      <input
        v-model.number="inputValue"
        type="digit"
        :disabled="disabled || inputDisabled"
        @input="numberBoxInputEvent"
      />
    </div>

    <!-- 加操作按钮 -->
    <div
      class="operation-btn"
      :style="numberBoxOperationWrapperStyle('plus')"
      hover-class="z-btn-hover"
      :hover-stay-time="250"
      @touchstart.stop.prevent="handleOperationEvent('plus')"
      @touchend.stop.prevent="clearLongPressTimer"
    >
      <slot name="plus">
        <zIcon name="tianjia"></zIcon>
      </slot>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-number-box {
  display: inline-flex;
  position: relative;
  .operation-btn {
    flex-grow: 0;
    // flex-shrink: 0;
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }
  .input {
    flex-grow: 1;
    flex-shrink: 1;
    margin: 0rpx 4rpx;

    width: 100%;
    height: 100%;
    padding: 0rpx;

    input {
      width: 100%;
      height: 100%;
      background-color: transparent;
      color: inherit;
      font-size: inherit;
      text-align: center;
    }
  }
  .z-btn-hover {
    background-color: #eeeeee;
    opacity: 0.8;
  }
}
</style>
