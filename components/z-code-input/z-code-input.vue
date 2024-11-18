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
import zColor from '../../libs/zColor'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
import { useFormItem, useFormDisabled } from '../z-form/types'
/**
 * @description: z-code-input 验证码输入组件传参
 * @param: 	modelValue	验证码的值
 * @param: 	length		验证码的长度
 * @param:	width		每一个验证码输入框的宽度
 * @param: 	focus	聚焦验证码输入框
 * @param: 	disabled		禁止输入
 * @param: 	password		隐藏输入内容
 * @param: 	breath		当前激活的验证码输入框是否带呼吸效果
 * @param: 	inputType		验证码输入框类型
 * @param:	inactiveColor		未选中时的颜色
 * @param: 	activeColor		选中时的颜色
 * @param: 	validateEvent		输入时是否触发表单验证
 * @param:  otherStyle   其他的样式
 *
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 *
 * @event	update:modelValue	更新内容
 * @event	input	验证码输入事件
 * @event	change	验证码发生改变事件
 * @event	complete	验证码输入完成事件
 * @example:
 */

type codeInputType =
  | 'border'
  | 'border-vline'
  | 'border-hline'
  | 'middle-vline'
  | 'middle-hline'
  | 'bottom-hline'

type ColorType = 'text' | 'bg' | 'border'
type ColorClass = (type: ColorType, active: boolean) => string
type ColorStyle = (type: ColorType, active: boolean) => CSSProperties

interface PropsType extends PropsTypeHook {
  modelValue?: string | number
  length?: number
  width?: string
  focus?: boolean
  disabled?: boolean
  password?: boolean
  breath?: boolean
  inputType?: codeInputType
  inactiveColor?: string
  activeColor?: string
  validateEvent?: boolean
}

interface EmitsType {
  (e: 'update:modelValue', value: any): void
  (e: 'input', value: any): void
  (e: 'change', value: any): void
  (e: 'complete'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  modelValue: '',
  length: 4,
  focus: true,
  breath: true,
  inputType: 'border',
  validateEvent: true,
})

const emits = defineEmits<EmitsType>()

const { formItem } = useFormItem()

// 记录用户输入的值
const inputValue = ref<string>('')
// 验证码的值
const codeValue = computed<string[]>(() =>
  Array.from({ length: props.length }).map((_, i) =>
    inputValue.value?.[i] !== undefined ? inputValue.value?.[i] : ''
  )
)
// 当前激活的输入框索引
const activeIndex = computed<number>(() => inputValue.value.length)
watch(
  () => props.modelValue,
  (val) => {
    inputValue.value = String(val !== undefined ? val : '')
  },
  {
    immediate: true,
  }
)

// 禁止输入事件
const disabled = useFormDisabled(
  props.disabled || inputValue.value.length >= props.length
)

// 输入框输入的值发生改变
const inputInputHandle = (e: any) => {
  const {
    detail: { value },
  } = e
  const tempValue = (value as string).slice(0, props.length)
  if (value.length > props.length) {
    nextTick(() => {
      inputValue.value = tempValue
    })
  }
  if (tempValue.length === props.length) {
    emits('complete')
  }

  emits('update:modelValue', tempValue)

  emits('input', tempValue)

  if (props.validateEvent) {
    formItem?.validate?.('input').catch((err) => {
      z.error(err)
    })
  }
}
const inputChangeHandle = () => {
  emits('change', inputValue.value)
  if (props.validateEvent) {
    formItem?.validate?.('change').catch((err) => {
      z.error(err)
    })
  }
}

// 获取对应颜色的类
const colorClass = computed<ColorClass>(() => {
  return (type, active) => {
    const cls: string[] = []

    if (active) {
      cls.push(`z-code-input-${type}-active`)
    } else {
      cls.push(`z-code-input-${type}`)
    }

    return cls.join('')
  }
})
const colorStyle = computed<ColorStyle>(() => {
  return (type, active) => {
    const style: CSSProperties = {}

    switch (type) {
      case 'text':
        if (active) {
          style.color = zColor.getTypeColor(props.activeColor || 'primary')
        } else {
          style.color = zColor.getTypeColor(props.inactiveColor || 'disabled')
        }
        break
      case 'bg':
        if (active) {
          style.backgroundColor = zColor.getTypeColor(
            props.activeColor || 'primary'
          )
        } else {
          style.backgroundColor = zColor.getTypeColor(
            props.inactiveColor || 'disabled'
          )
        }
        break
      case 'border':
        if (active) {
          style.borderColor = zColor.getTypeColor(
            props.activeColor || 'primary'
          )
        } else {
          style.borderColor = zColor.getTypeColor(
            props.inactiveColor || 'disabled'
          )
        }
        break
    }

    return style
  }
})

// 每一个验证码输入框的样式
const inputItemStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  if (props?.width) {
    style.width = z.addUnit(props.width)
    style.fontSize = `calc(${style.width} * 0.6)`
  }

  return style
})

// 保密点的样式
const passwordDotStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  if (props.password) {
    style.width = props.width
      ? `calc(${z.addUnit(props.width)} * 0.4)`
      : '30rpx'
    style.height = style.width
  }

  return style
})
</script>

<template>
  <div class="z-code-input">
    <input
      v-model="inputValue"
      type="number"
      :disabled="disabled"
      :focus="focus"
      class="input pa"
      @input="inputInputHandle"
      @change="inputChangeHandle"
    />

    <!-- 验证码输入框 -->
    <div class="code-input pr df aic">
      <div
        v-for="(item, index) in codeValue"
        :key="index"
        class="item"
        :style="inputItemStyle"
      >
        <div class="wrapper pr">
          <div class="container pa df jcc aic">
            <!-- 信息提示框 start -->
            <!-- 根据不同的输入框类型显示不同的样式 -->
            <!-- border -->
            <div
              v-if="inputType.startsWith('border')"
              class="border"
              :class="[
                colorClass('border', index === activeIndex || item !== ''),
                breath && inputType === 'border' && index === activeIndex
                  ? 'breath'
                  : '',
              ]"
              :style="
                colorStyle('border', index === activeIndex || item !== '')
              "
            >
              <div
                v-if="inputType === 'border-vline' && index === activeIndex"
                class="border-vline"
                :class="[colorClass('bg', true), breath ? 'breath' : '']"
                :style="colorStyle('bg', true)"
              />
              <div
                v-if="inputType === 'border-hline' && index === activeIndex"
                class="border-hline"
                :class="[colorClass('bg', true), breath ? 'breath' : '']"
                :style="colorStyle('bg', true)"
              />
            </div>
            <!-- 居中水平 -->
            <div
              v-if="inputType === 'middle-hline' && item === ''"
              class="middle-hline"
              :class="[
                colorClass('bg', index === activeIndex),
                breath && index === activeIndex ? 'breath' : '',
              ]"
              :style="colorStyle('bg', index === activeIndex)"
            />
            <!-- 底部水平 -->
            <div
              v-if="inputType === 'bottom-hline' && item === ''"
              class="bottom-hline"
              :class="[
                colorClass('bg', index === activeIndex),
                breath && index === activeIndex ? 'breath' : '',
              ]"
              :style="colorStyle('bg', index === activeIndex)"
            />
            <!-- 居中垂直 -->
            <div
              v-if="inputType === 'middle-vline' && item === ''"
              class="middle-vline"
              :class="[
                colorClass('bg', index === activeIndex),
                breath && index === activeIndex ? 'breath' : '',
              ]"
              :style="colorStyle('bg', index === activeIndex)"
            />
            <!-- 信息提示框 end -->

            <!-- 验证码值展示 -->
            <div
              v-if="item !== ''"
              class="code-value"
              :class="[colorClass('text', true), password ? 'dot' : '']"
              :style="{ ...colorStyle('text', true), ...passwordDotStyle }"
            >
              {{ password ? '' : item }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-code-input {
  position: relative;
  width: 100%;
  height: fit-content;
  .input {
    background-color: transparent;
    left: -100%;
    top: 0;
    width: 200%;
    height: 100%;
    padding: 0rpx;
    z-index: 2;
    caret-color: transparent; // 隐藏光标
    opacity: 0;
  }
  .code-input {
    width: fit-content;
    height: fit-content;
    z-index: 1;
    .item {
      position: relative;
      width: 80rpx;
      font-size: calc(80rpx * 0.6);

      & + .item {
        margin-left: 20rpx;
      }
      .wrapper {
        width: 100%;
        height: 0rpx;
        padding-bottom: 110%;
        .container {
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          .border {
            width: 100%;
            height: 100%;
            border-width: 4rpx;
            border-style: solid;
            border-radius: 15rpx;
            .border-vline {
              position: absolute;
              left: 50%;
              top: 50%;
              width: 4rpx;
              height: 40%;
              transform: translate(-50%, -50%);
            }
            .border-hline {
              position: absolute;
              left: 50%;
              top: 50%;
              width: 40%;
              height: 4rpx;
              transform: translate(-50%, -50%);
            }
            .breath {
              animation: breath-animation 1s ease-in-out infinite alternate;
            }
          }
          .middle-vline {
            position: absolute;
            left: 50%;
            top: 50%;
            width: 4rpx;
            height: 60%;
            transform: translate(-50%, -50%);
          }
          .middle-hline {
            position: absolute;
            left: 50%;
            top: 50%;
            width: 60%;
            height: 4rpx;
            transform: translate(-50%, -50%);
          }
          .bottom-hline {
            position: absolute;
            left: 50%;
            bottom: 10%;
            width: 60%;
            height: 4rpx;
            transform: translate(-50%, -50%);
          }
          .breath {
            animation: breath-animation 1s ease-in-out infinite alternate;
          }
          .code-value {
            position: absolute;
            left: 50%;
            top: 50%;
            line-height: 1;
            transform: translate(-50%, -50%);
            font-size: inherit;
          }
          .dot {
            border-radius: 50%;
            background-color: #666666;
          }
        }
      }
    }
  }
}

@keyframes breath-animation {
  0% {
    opacity: 0.2;
  }
  100% {
    opacity: 1;
  }
}
</style>
