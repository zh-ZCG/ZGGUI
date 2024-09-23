<!--
 * @Description: z-code-input 验证码输入组件
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
 * @description: z-code-input 验证码输入组件传参
 * @param: 	maxlength			最大输入长度
 * @param: 	dot			是否用圆点填充
 * @param:	mode		显示模式，box-盒子模式(默认)，line-底部横线模式
 * @param: 	hairline	是否细边框
 * @param: 	space		字符间的距离
 * @param: 	value		预置值
 * @param: 	focus		是否自动获取焦点
 * @param: 	bold		字体和输入横线是否加粗
 * @param:	color		字体颜色
 * @param: 	fontSize		字体大小，单位px
 * @param: 	size				输入框的大小，宽等于高
 * @param: 	disabledKeyboard	是否隐藏原生键盘，如果想用自定义键盘的话，需设置此参数为true
 * @param:	borderColor			边框和线条颜色
 * @param: 	disabledDot			是否禁止输入"."符号
 * @param:  otherStyle   其他的样式
 *
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 *
 * @event	change	输入内容发生改变时触发
 * @event	finish	输入字符个数达maxlength值时触发
 * @example:
 */

interface PropsType extends PropsTypeHook {
  maxlength?: number
  dot?: boolean
  mode?: string
  hairline?: boolean
  space?: string | number
  value?: string | number
  focus?: boolean
  bold?: boolean
  color?: string
  fontSize?: string | number
  size?: string | number
  disabledKeyboard?: boolean
  borderColor?: string
  disabledDot?: boolean
}

interface EmitsType {
  (e: 'change', value: any): void
  (e: 'input', value: any): void
  (e: 'finish', value: any): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  adjustPosition: true,
  maxlength: 6,
  dot: false,
  mode: 'box',
  hairline: false,
  space: 10,
  value: '',
  focus: false,
  bold: false,
  color: '#666666',
  fontSize: 18,
  size: 35,
  disabledKeyboard: false,
  borderColor: '#cccccc',
  disabledDot: true,
})

const emits = defineEmits<EmitsType>()

const inputValue = ref('')

const isFocus = ref(props.focus)

watch(
  () => props.value,
  (val) => {
    inputValue.value = String(val).substring(0, props.maxlength)
  },
  { immediate: true }
)

// 根据长度，循环输入框的个数，因为头条小程序数值不能用于v-for
const codeLength = computed(() => {
  return new Array(props.maxlength)
})

// 循环item的样式
const itemStyle = computed(() => {
  return (index: any) => {
    const addUnit = z.addUnit
    const style: CSSProperties = {
      width: addUnit(props.size),
      height: addUnit(props.size),
    }
    // 盒子模式下，需要额外进行处理
    if (props.mode === 'box') {
      // 设置盒子的边框，如果是细边框，则设置为0.5px宽度
      style.border = `${props.hairline ? 0.5 : 1}px solid ${props.borderColor}`
      // 如果盒子间距为0的话
      if (z.getPx(props.space) === 0) {
        // 给第一和最后一个盒子设置圆角
        if (index === 0) {
          style.borderTopLeftRadius = '3px'
          style.borderBottomLeftRadius = '3px'
        }
        if (index === codeLength.value.length - 1) {
          style.borderTopRightRadius = '3px'
          style.borderBottomRightRadius = '3px'
        }
        // 最后一个盒子的右边框需要保留
        if (index !== codeLength.value.length - 1) {
          style.borderRight = 'none'
        }
      }
    }
    if (index !== codeLength.value.length - 1) {
      // 设置验证码字符之间的距离，通过margin-right设置，最后一个字符，无需右边框
      style.marginRight = addUnit(props.space)
    } else {
      // 最后一个盒子的有边框需要保留
      style.marginRight = 0
    }

    return style
  }
})

// 将输入的值，转为数组，给item历遍时，根据当前的索引显示数组的元素
const codeArray = computed(() => {
  return String(inputValue.value).split('')
})

// 下划线模式下，横线的样式
const lineStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}
  style.height = props.hairline ? '2px' : '4px'
  style.width = z.addUnit(props.size)
  // 线条模式下，背景色即为边框颜色
  style.backgroundColor = props.borderColor
  return style
})

// 监听输入框的值发生变化
function inputHandler(e: any) {
  const value = e.detail.value
  inputValue.value = value
  // 是否允许输入“.”符号
  if (props.disabledDot) {
    nextTick(() => {
      inputValue.value = value.replace('.', '')
    })
  }
  // 未达到maxlength之前，发送change事件，达到后发送finish事件
  emits('change', value)
  // 修改通过v-model双向绑定的值
  emits('input', value)
  // 达到用户指定输入长度时，发出完成事件
  if (String(value).length >= Number(props.maxlength)) {
    emits('finish', value)
  }
}
</script>

<template>
  <div class="z-code-input df pr ofh">
    <div
      class="item df jcc aic pr"
      :style="[itemStyle(index)]"
      v-for="(item, index) in codeLength"
      :key="index"
    >
      <div class="dot" v-if="dot && codeArray.length > index"></div>
      <text
        v-else
        :style="{
          fontSize: z.addUnit(fontSize),
          fontWeight: bold ? 'bold' : 'normal',
          color: color,
        }"
      >
        {{ codeArray[index] }}
      </text>
      <div class="line pa" v-if="mode === 'line'" :style="[lineStyle]"></div>
      <!-- #ifndef APP-PLUS -->
      <div
        v-if="isFocus && codeArray.length === index"
        :style="{ backgroundColor: color }"
        class="cursor pa"
      ></div>
      <!-- #endif -->
    </div>
    <input
      :disabled="disabledKeyboard"
      type="number"
      :focus="focus"
      :value="inputValue"
      :maxlength="maxlength"
      adjustPosition="true"
      class="input pa tal"
      @input="inputHandler"
      :style="{
        height: z.addUnit(size),
      }"
      @focus="isFocus = true"
      @blur="isFocus = false"
    />
  </div>
</template>

<style lang="less" scoped>
.z-code-input {
  .item {
    .dot {
      width: 7px;
      height: 7px;
      border-radius: 100px;
      background-color: #606266;
    }
    .line {
      bottom: 0;
      height: 4px;
      border-radius: 100px;
      width: 40px;
      background-color: #606266;
    }
    .cursor {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 1px;
      height: 40%;
      animation: 1s z-cursor-flicker infinite;
    }
  }
  .input {
    left: -750rpx;
    width: 1500rpx;
    top: 0;
    background-color: transparent;
  }
}
/* #ifndef APP-PLUS */
@keyframes z-cursor-flicker {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
/* #endif */
</style>
