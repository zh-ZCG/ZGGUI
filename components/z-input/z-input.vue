<!--
 * @Description: z-input 输入框组件
 * @Author: ZGGUI & ui.zggui.cn & zggamazing@163.com
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
  Ref,
  onMounted,
  getCurrentInstance,
  computed,
  onBeforeUnmount,
  watch,
  nextTick,
  CSSProperties,
  InjectionKey,
} from 'vue'
import zType from '@/ZGGUI/libs/zType'
import { trim } from '@/ZGGUI/libs/lodash'
import z from '@/ZGGUI/libs/z'
import zIcon from '@/ZGGUI/components/z-icon/z-icon.vue'
import { propsHook, PropsTypeHook } from '@/ZGGUI/libs/zHooks'
import { useToggle } from '@/ZGGUI/libs/use-Toggle/use-Toggle'
import {
  useFormSize,
  useFormDisabled,
  useFormItem,
  FormItemValidateStates,
} from '@/ZGGUI/components/z-form/types'
import { FormValidateIconsMap } from '@/ZGGUI/libs/utils'
/**
 * @description:  z-input 输入框组件传参
 * @param: modelValue 绑定的值
 * @param: size		 输入框尺寸
 * @param: height	输入框高度
 * @param: width	输入框宽度
 * @param: disabled  是否禁用
 * @param: type  输入框类型
 * @param: placeholder  输入框占位文本
 * @param: textAlign  文字对齐方式
 * @param: placeholderStyle  输入框占位文本的样式
 * @param: border  是否显示边框
 * @param: borderColor  边框颜色
 * @param: underline  下划线边框
 * @param: autoHeight  根据内容自动调整高度，仅在 textarea 模式下生效，如果设置了 height 则优先级最高
 * @param: confirmType  设置键盘右下角按钮的文字，仅在使用系统键盘时生效
 * @param: focus  获取焦点
 * @param: clearable  是否展示清除按钮
 * @param: showPassword  是否显示切换密码显示/隐藏按钮，仅在 type="password" 时生效
 * @param: cursorSpacing  指定光标与键盘的距离，单位 px
 * @param: selectionStart  光标起始位置，自动聚集时有效，需与selection-end搭配使用
 * @param: selectionEnd  光标结束位置，自动聚集时有效，需与selection-start搭配使用
 * @param: showConfirmBar  是否展示键盘上方带有”完成“按钮那一栏
 * @param: rightIcon  显示输入框右图标
 * @param: trim  自动去除两端空格
 * @param: showWordLimit  显示字数统计，只有在 textarea 模式下且设置maxlength时生效
 * @param: wordLimitColor  字数统计文字颜色
 * @param: validateEvent  输入时是否触发表单验证
 * @param: maxlength  最大可输入长度，设置为 -1 的时候不限制最大长度
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zggui.cn & zggamazing@163.com
 * @example:
 */

const inputTypes = [
  'text',
  'number',
  'idcard',
  'digit',
  'textarea',
  'password',
  'select',
]

const inputConfirmTypes = ['', 'send', 'search', 'next', 'go', 'done', 'return']

interface InputFocusEvent {
  detail: {
    /**
     * @description 输入框内容
     */
    value: string
    /**
     * @description 键盘高度
     */
    height: number
  }
}

interface InputBlurEvent {
  detail: {
    /**
     * @description 输入框内容
     */
    value: string
  }
}

type inputTypes =
  | 'text'
  | 'number'
  | 'idcard'
  | 'digit'
  | 'textarea'
  | 'password'
  | 'select'

type inputConfirmTypes =
  | ''
  | 'send'
  | 'search'
  | 'next'
  | 'go'
  | 'done'
  | 'return'

type componentSizes = 'small' | 'normal' | 'large'
// const componentSizes = ['small', 'normal', 'large']
const formComponentSizes = ['small', 'normal', 'large']
// type formComponentSizes = ['small', 'normal', 'large']
// const formComponentSizes = ['small', 'normal', 'large'] as const

interface PropsType extends PropsTypeHook {
  modelValue?: string | number | null | undefined
  height?: string | number
  width?: string | number
  disabled?: boolean
  size?: componentSizes
  type?: inputTypes
  placeholder?: string
  textAlign?: 'left' | 'center' | 'right'
  placeholderStyle?: Object
  border?: boolean
  borderColor?: string
  underline?: boolean
  maxlength?: number
  autoHeight?: boolean
  confirmType?: inputConfirmTypes
  focus?: boolean
  clearable?: boolean
  showPassword?: boolean
  cursorSpacing?: number
  selectionStart?: number
  selectionEnd?: number
  showConfirmBar?: boolean
  rightIcon?: string
  trim?: boolean
  showWordLimit?: boolean
  wordLimitColor?: string
  validateEvent?: boolean
}

interface EmitsType {
  (e: 'update:modelValue', data: string | number): void
  (e: 'input', data: string | number): void
  (e: 'change', data: string | number): void
  (e: 'click'): void
  (e: 'focus', data: InputFocusEvent): void
  (e: 'blur', data: InputBlurEvent): void
  (e: 'clear'): void
  (e: 'confirm', data: string | number): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  modelValue: '',
  type: 'text',
  size: 'normal',
  width: '100%',
  textAlign: 'left',
  placeholderStyle: () => ({}),
  border: true,
  borderColor: '#e6e6e6',
  maxlength: -1,
  autoHeight: true,
  confirmType: 'done',
  showPassword: true,
  cursorSpacing: 0,
  selectionStart: -1,
  selectionEnd: -1,
  showConfirmBar: true,
  trim: true,
  showWordLimit: false,
  validateEvent: true,
})

const emits = defineEmits<EmitsType>()

const { form, formItem } = useFormItem()

// 输入框内容
const inputText = ref<string>(String(props.modelValue ?? ''))
watch(
  () => props.modelValue,
  (val) => {
    inputText.value = String(val ?? '')
    if (props.validateEvent) {
      formItem?.validate?.('change').catch((err) => {
        z.error(JSON.stringify(err))
      })
    }
  }
)

// 显示/隐藏密码状态
const [passwordVisible, togglePasswordVisible] = useToggle(false)

// 是否显示状态图标
const needStatusIcon = computed(() =>
  z.isEmptyVariableInDefault(form?.statusIcon, false)
)
// 校验状态
const validateState = computed(() =>
  z.isEmptyVariableInDefault<FormItemValidateStates>(
    formItem?.validateState,
    ''
  )
)
// 校验状态图标
const validateIcon = computed(
  () => validateState.value && FormValidateIconsMap[validateState.value]
)

// 密码显示密码图标
const passwordIcon = computed(() =>
  passwordVisible.value ? 'eye1' : 'eye-slash1'
)

// 是否显示图标
const showIcon = computed(() => {
  let status = false
  if (validateState.value && needStatusIcon.value && validateIcon.value)
    status = true
  if (props.showPassword) status = true
  if (props.rightIcon) status = true
  if (props.clearable) status = true
  return status
})

// 输入框禁止事件
const disabled = useFormDisabled(props.disabled)

// 是否显示字数统计
const showWordLimit = computed<boolean>(
  () =>
    props.type === 'textarea' && !!props?.maxlength && !!props?.showWordLimit
)
// 当前的字数
const currentWordCount = computed<number>(() => {
  if (props.showWordLimit && props.type === 'textarea') {
    return inputText.value?.length || 0
  }
  return 0
})

// 内容输入触发事件
const inputInputEvent = (event: any) => {
  const { value } = event.detail
  _updateInputText(value)
}

// 输入框聚焦事件
const inputFocusEvent = (event: any) => {
  emits('focus', event)
}

// 输入框失去焦点事件
const inputBlurEvent = (event: any) => {
  emits('blur', event)
  if (props.validateEvent) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    formItem?.validate?.('blur').catch((err) => {
      z.error(err)
    })
  }
}

// 点击完成时触发事件
const confirmEvent = (event: any) => {
  const { value } = event.detail
  emits('confirm', _formatInputText(value))
}

// 点击清除按钮
const clearClickEvent = () => {
  if (disabled.value) return
  _updateInputText('')
  emits('clear')
}

// 更新输入框内容
const _updateInputText = (value: string) => {
  value = props.trim ? trim(value) : value
  // inputText.value = value
  emits('update:modelValue', _formatInputText(value))
  nextTick(() => {
    emits('input', _formatInputText(value))
    emits('change', _formatInputText(value))
  })
}

// 输入框点击事件
const inputClickEvent = () => {
  if (props.type === 'select') {
    emits('click')
  }
}

const _formatInputText = (value: string) => {
  if (value === '') return ''
  if (props.type === 'number' || props.type === 'digit')
    return Number.parseFloat(value)
  return value
}

// 输入框的尺寸
const inputSize = useFormSize(props.size)

// 输入框placeholder样式
const placeholderStyle = computed<string>(() => {
  const style: CSSProperties = {
    color: '#e6e6e6',
  }

  if (!zType.isEmpty(props.placeholderStyle))
    Object.assign(style, props.placeholderStyle)

  if (props.width) style.width = z.addUnit(props.width)

  return Object.entries(style)
    .map(([key, value]) => `${key}:${value}`)
    .join(';')
})

// 输入框所属类
const inputClass = computed<string>(() => {
  const cls: string[] = ['z-input']

  // 禁止输入
  if (disabled.value && props.type !== 'select') cls.push('disabled')

  // 设置边框尺寸
  if (inputSize.value) cls.push(`size-${inputSize.value}`)

  // 设置文字对齐方式
  if (props.textAlign) cls.push(`text-${props.textAlign}`)

  // 是否发生错误
  if (validateState.value === 'error') cls.push('error')
  else if (validateState.value === 'success') cls.push('success')

  // 设置边框
  if (props.border || props.underline || validateState.value === 'error') {
    cls.push(props.underline ? 'z-border-bottom' : 'z-border')
    if (validateState.value === 'error') cls.push('z-red-border')
  }

  if (props.underline) {
    cls.push('underline')
  }

  if (props.otherClass) cls.push(props.otherClass)

  return cls.join(' ')
})

// 输入框样式
const inputStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  // 设置高度
  if (props.height) style.height = z.addUnit(props.height)
  if (props.width) style.width = z.addUnit(props.width)

  // 设置边框颜色
  if (props.border && props.borderColor && validateState.value !== 'error')
    style.borderColor = props.borderColor

  if (!zType.isEmpty(props.otherStyle)) Object.assign(style, props.otherStyle)

  return style
})

// 字数统计类
const wordLimitClass = computed<string>(() => {
  const cls: string[] = ['word-limit']

  return cls.join(' ')
})
// 字数统计样式
const wordLimitStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  if (props.wordLimitColor) {
    style.color = props.wordLimitColor || '#666666'
  }

  return style
})
</script>

<template>
  <div
    :class="[
      inputClass,
      `${type === 'textarea' ? 'textarea' : 'input'}`,
      showWordLimit ? 'show-word-limit' : '',
    ]"
    :style="inputStyle"
    @tap="inputClickEvent"
  >
    <div v-if="$slots.prefix" clas="slot-left">
      <slot name="prefix"></slot>
    </div>
    <!-- 文本域 -->
    <textarea
      v-if="type === 'textarea'"
      class="base textarea"
      :class="!!height ? 'custom-height' : ''"
      :value="inputText"
      :placeholder="placeholder"
      :placeholder-style="placeholderStyle"
      :disabled="disabled"
      :maxlength="maxlength"
      :focus="focus"
      :confirm-type="confirmType"
      :auto-height="!height && autoHeight"
      :selection-start="selectionStart"
      :selection-end="selectionEnd"
      :cursor-spacing="cursorSpacing"
      :show-confirm-bar="showConfirmBar"
      @input="inputInputEvent"
      @focus="inputFocusEvent"
      @blur="inputBlurEvent"
      @confirm="confirmEvent"
    ></textarea>

    <!-- 文本框 -->
    <input
      v-else
      class="base input"
      :type="type === 'password' || type === 'select' ? 'text' : type"
      :value="inputText"
      :placeholder="placeholder"
      :password="type === 'password' && !passwordVisible"
      :placeholder-style="placeholderStyle"
      :disabled="disabled || type === 'select'"
      :maxlength="maxlength"
      :focus="focus"
      :confirm-type="confirmType"
      :selection-start="selectionStart"
      :selection-end="selectionEnd"
      :cursor-spacing="cursorSpacing"
      :show-confirm-bar="showConfirmBar"
      @input="inputInputEvent"
      @focus="inputFocusEvent"
      @blur="inputBlurEvent"
      @confirm="confirmEvent"
    />
    <!-- 图标 -->
    <div v-if="showIcon" class="icon">
      <!-- 右边图标 -->
      <div v-if="rightIcon">
        <zIcon :name="rightIcon"></zIcon>
      </div>
      <!-- 密码显示/隐藏 -->
      <div
        v-if="type === 'password' && showPassword"
        @tap.stop="togglePasswordVisible"
      >
        <zIcon :name="passwordIcon"></zIcon>
      </div>
      <!-- 清除按钮 -->
      <div v-else-if="clearable && inputText" @tap.stop="clearClickEvent">
        <zIcon name="cuowu"></zIcon>
      </div>
      <!-- 错误提示图标 -->
      <div
        v-if="validateState && validateIcon && needStatusIcon"
        :class="`validate-${validateState}`"
      >
        <zIcon :name="validateIcon"></zIcon>
      </div>
    </div>
    <div v-if="$slots.suffix" clas="slot-right">
      <slot name="suffix"></slot>
    </div>

    <!-- 字数统计 -->
    <div v-if="showWordLimit" :class="[wordLimitClass]" :style="wordLimitStyle">
      {{ currentWordCount }} / {{ maxlength }}
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-input {
  display: inline-flex;
  position: relative;
  // width: 100%;
  border-radius: 15rpx;
  overflow: auto;
  .icon {
    display: flex;
    align-items: center;
    justify-content: center;

    position: relative;
    height: 100%;
    padding-left: 10rpx;
    line-height: 1;
    color: #666666;
    .validate-error {
      margin-left: 6rpx;
      color: @error;
    }
    .validate-success {
      margin-left: 6rpx;
      color: @success;
    }
  }
  .slot-left {
    margin-right: 8rpx;
  }
  .slot-right {
    margin-left: 8rpx;
  }
  .word-limit {
    position: absolute;
    right: 20rpx;
    bottom: 10rpx;
    font-size: 24rpx;
    line-height: 1;
    display: flex;
    align-items: center;
  }
}
.z-border-bottom {
  border-bottom: 4rpx solid #666666;
}
.z-border {
  border: 4rpx solid #666666;
}
.z-red-border {
  border: 4rpx solid @error;
}
.underline {
  border-radius: 0;
}
.show-word-limit {
  padding-bottom: 40rpx;
}
.disabled {
  background-color: rgba(0, 0, 0, 0.3);
}
.size-small {
  padding: 10rpx;
  font-size: 24rpx;
}
.size-normal {
  padding: 16rpx;
  font-size: 28rpx;
}
.size-large {
  padding: 20rpx;
  font-size: 32rpx;
}
.text-left {
  .base {
    text-align: left;
    width: 100%;
  }
}
.text-center {
  .base {
    text-align: center;
    width: 100%;
  }
}
.text-right {
  .base {
    text-align: right;
    width: 100%;
  }
}
.error {
  color: @error;
}
.success {
  color: @success;
}
.textarea {
  .custom-height {
    height: 100%;
  }
}
</style>
