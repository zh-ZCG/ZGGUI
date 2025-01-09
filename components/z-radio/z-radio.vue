<!--
 * @Description: z-radio 单选框组件
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
  inject,
} from 'vue'
import z from '../../libs/z'
import zType from '../../libs/zType'
import zColor from '../../libs/zColor'
import { zRadioGroupKey } from '../../components/z-radio/z-radio'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
import { useFormDisabled, useFormSize } from '../../components/z-form/types'
/**
 * @description: z-radio 单选框组件传参
 * @param: size radio单选框尺寸
 * @param: disabled	radio单选框是否禁用
 * @param: labelDisabled	radio禁止点击标签进行选择
 * @param: border 是否显示边框
 * @param: activeColor radio激活时的颜色
 * @param: modelValue radio单选框绑定的值
 * @param: label radio单选框的值，在使用单选组时，radio的值就是label
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */

type zRadioSizeType = 'small' | 'normal' | 'large' | ''

interface PropsType extends PropsTypeHook {
  size?: zRadioSizeType
  disabled?: boolean
  labelDisabled?: boolean
  border?: boolean
  activeColor?: string
  modelValue?: string | number | boolean
  label?: string | number | boolean
}

interface EmitsType {
  (e: 'update:modelValue', value: string | number | boolean | undefined): void
  (e: 'change', value: string | number | boolean): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  size: '',
  disabled: false,
  activeColor: '#409eff',
  modelValue: '',
  label: '',
})

const emits = defineEmits<EmitsType>()

const radioGroupContext = inject(zRadioGroupKey, undefined)

// radio当选框尺寸
const size = useFormSize(
  computed(() =>
    z.isEmptyDoubleVariableInDefault(
      zType.isEmpty(props?.size) ? null : props?.size,
      radioGroupContext?.size
    )
  )
)

// radio单选框是否禁用
const disabled = useFormDisabled(
  computed(() => props?.disabled || radioGroupContext?.disabled || false)
)

// radio禁止点击标签进行选择
const labelDisabled = computed(
  () => props?.labelDisabled || radioGroupContext?.labelDisabled || false
)

// 是否显示边框
const border = computed(
  () => props?.border || radioGroupContext?.border || false
)

// radio激活时的颜色
const activeColor = computed(
  () => zColor.getTypeColor((props?.activeColor || radioGroupContext?.activeColor)??'primary')
)

// 判断是否为单选组
const isGroup = computed(() => !!radioGroupContext)

const modelValue = computed<PropsType['modelValue']>({
  get() {
    return isGroup.value ? radioGroupContext!.modelValue : props.modelValue!
  },
  set(val) {
    if (isGroup.value) {
      radioGroupContext!.changeEvent(val)
    } else {
      emits('update:modelValue', val)
    }
  },
})

// radio标签点击事件
const radioClickEvent = (type: 'radio' | 'label') => {
  if (disabled.value) return
  if (type === 'label' && labelDisabled.value) return
  modelValue.value = props.label
  nextTick(() => {
    emits('change', props.label)
  })
}

// radio所属类
const radioClass = computed<(selected: boolean) => string>(() => {
  return (selected: boolean) => {
    const cls: string[] = ['z-radio']

    // 禁止选择
    if (disabled.value) cls.push('z-radio-disabled')

    // 设置尺寸
    if (size.value) cls.push(`z-radio-${size.value}`)
    else {
      cls.push(`z-radio-default`)
    }

    // 激活样式
    if (selected) {
      cls.push(`z-radio-${selected}`)
    }

    // 设置激活时的边框颜色
    if (border.value) {
      cls.push('z-radio-border')
    } else {
      cls.push('z-radio-no-border')
    }

    return cls.join(' ')
  }
})

// radio所属样式
const radioStyle = computed<(selected: boolean) => CSSProperties>(() => {
  return (selected: boolean) => {
    const style: CSSProperties = {}

    // 设置激活时的颜色
    if (selected) {
      if (border.value) style.borderColor = zColor.getTypeColor(activeColor.value || 'primary')
      if (activeColor.value) {
        style.color = zColor.getTypeColor(activeColor.value || 'primary')
      }
    }

    if (!zType.isEmpty(props.otherStyle)) Object.assign(style, props.otherStyle)

    return style
  }
})

// radio选中点所属类
const radioDotClass = computed<(selected: boolean) => string>(() => {
  return (selected: boolean) => {
    const cls: string[] = []
    if (selected) {
      cls.push('z-radio-selected')
    } else {
      cls.push('z-radio-border z-radio-disabled')
    }
    return cls.join(' ')
  }
})

// radio选中点所属样式
const radioDotStyle = computed<(selected: boolean) => CSSProperties>(() => {
  return (selected: boolean) => {
    const style: CSSProperties = {}
    if (selected) {
      style.backgroundColor = zColor.getTypeColor('primary')
    }
    return style
  }
})
</script>

<template>
  <div
    :class="[radioClass(modelValue === label), isGroup ? 'z-radio-group' : '']"
    :style="radioStyle(modelValue === label)"
    @tap.stop="radioClickEvent('label')"
  >
    <!-- 左边内容 -->
    <div v-if="$slots.left && !$slots.default" class="content-left">
      <slot name="left"></slot>
    </div>
    <!-- 选中小点 -->
    <div
      class="dot"
      :class="[radioDotClass(modelValue === label)]"
      :style="radioDotStyle(modelValue === label)"
      @tap.stop="radioClickEvent('radio')"
    ></div>
    <!-- 右边内容 -->
    <div v-if="$slots.default" class="content-right">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-radio {
  flex-grow: 0;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  border-radius: 10rpx;
  transition: all 0.3s ease-in-out;
  .content-left {
    margin-right: 14rpx;
  }
  .content-right {
    margin-left: 14rpx;
  }
}
.z-radio-group {
  margin: 10rpx;
}
.z-radio-disabled {
  opacity: 0.4;
}
.z-radio-small {
  padding: 8rpx 14rpx;
  font-size: 24rpx;
  .dot {
    flex-shrink: 0;
    position: relative;
    border-radius: 50%;
    transition: all 0.3s ease-in-out;
    width: 24rpx;
    height: 24rpx;
    &::after {
      content: '';
      display: block;
      position: absolute;
      left: 50%;
      top: 50%;
      border-radius: 50%;
      background-color: #fff;
      transition: all 0.3s ease-in-out;
      transform: translate(-50%, -50%) scale(0);
      transform-origin: center center;
      width: calc(24rpx / 2);
      height: calc(24rpx / 2);
    }
  }
  .z-radio-selected {
    &::after {
      transform: translate(-50%, -50%) scale(1);
    }
  }
}

.z-radio-default,
.z-radio-normal {
  padding: 10rpx 20rpx;
  font-size: 28rpx;
  .dot {
    width: 30rpx;
    height: 30rpx;
    flex-shrink: 0;
    position: relative;
    border-radius: 50%;
    transition: all 0.3s ease-in-out;
    &::after {
      content: '';
      display: block;
      position: absolute;
      left: 50%;
      top: 50%;
      border-radius: 50%;
      background-color: #fff;
      transition: all 0.3s ease-in-out;
      transform: translate(-50%, -50%) scale(0);
      transform-origin: center center;
      width: calc(30rpx / 2);
      height: calc(30rpx / 2);
    }
  }
  .z-radio-selected {
    &::after {
      transform: translate(-50%, -50%) scale(1);
    }
  }
}

.z-radio-large {
  padding: 12rpx 24rpx;
  font-size: 32rpx;
  flex-shrink: 0;
  position: relative;
  border-radius: 50%;
  transition: all 0.3s ease-in-out;
  .dot {
    width: 36rpx;
    height: 36rpx;
    flex-shrink: 0;
    position: relative;
    border-radius: 50%;
    transition: all 0.3s ease-in-out;
    &::after {
      content: '';
      display: block;
      position: absolute;
      left: 50%;
      top: 50%;
      border-radius: 50%;
      background-color: #fff;
      transition: all 0.3s ease-in-out;
      transform: translate(-50%, -50%) scale(0);
      transform-origin: center center;
      width: calc(36rpx / 2);
      height: calc(36rpx / 2);
    }
  }
  .z-radio-selected {
    &::after {
      transform: translate(-50%, -50%) scale(1);
    }
  }
}

.z-radio-border {
  border: 2rpx solid #666666;
  box-sizing: border-box;
}

.z-radio-no-border {
  // 如果没有border则不设置内边距
  padding: 2rpx;
}
</style>
