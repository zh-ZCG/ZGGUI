<!--
 * @Description: z-checkbox 复选框组件
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
import zIcon from '../../components/z-icon/z-icon.vue'
import {
  zCheckboxGroupKey,
  zCheckboxValueType,
} from '../../components/z-checkbox/z-checkbox'
import {
  useFormItem,
  useFormSize,
  useFormDisabled,
} from '../../components/z-form/types'
import { useComponentSize } from '../../libs/use-component-size/use-component-size'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
/**
 * @description: z-checkbox 复选框组件传参
 * @param: size 复选框尺寸
 * @param: checkedShape	复选框的形状
 * @param: disabled	是否禁用
 * @param: labelDisabled 是否禁用点击标签切换
 * @param: border 是否显示边框
 * @param: activeColor 激活时的颜色
 * @param: modelValue 绑定的值
 * @param: label 用于标记多个复选框时的唯一标识
 * @param: indeterminate 用于标记当前复选框是否为不确定状态，一般用于全选
 * @param: activeValue 复选框选中时的值
 * @param: inactiveValue 复选框未选中时的值
 * @param: validateEvent 值发生修改时是否触发表单验证
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */

type zCheckBoxSizeType = 'small' | 'normal' | 'large' | ''|number

type zCheckBoxShapes = 'square' | 'circle'

interface PropsType extends PropsTypeHook {
  size?: zCheckBoxSizeType
  checkedShape?: zCheckBoxShapes
  disabled?: boolean
  labelDisabled?: boolean
  border?: boolean
  activeColor?: string
  modelValue?: string | number | boolean
  label?: string | number
  indeterminate?: boolean
  activeValue?: string | number | boolean
  inactiveValue?: string | number | boolean
  validateEvent?: boolean
}

interface EmitsType {
  (e: 'update:modelValue', value: string | number | boolean): void
  (e: 'change', value: string | number | boolean): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  size: '',
  activeColor: '#409eff',
  modelValue: '',
  activeValue: true,
  inactiveValue: false,
  validateEvent: true,
})

const emits = defineEmits<EmitsType>()

const checkboxGroup = inject(zCheckboxGroupKey, undefined)

// 组件尺寸
const size = useFormSize(
  computed(() =>
    z.isEmptyDoubleVariableInDefault(props?.size, checkboxGroup?.size)
  )
)

// 解析尺寸
const { sizeType } = useComponentSize(size.value)

// 复选框选框的形状
const checkedShape = computed(() =>
  z.isEmptyDoubleVariableInDefault(
    props?.checkedShape,
    checkboxGroup?.checkedShape,
    'square'
  )
)

// 是否禁用
const disabled = useFormDisabled(
  computed(() => props?.disabled || checkboxGroup?.disabled || false)
)

const maxDisabled = computed(
  () =>
    checkboxGroup?.modelValue &&
    checkboxGroup?.max &&
    checkboxGroup?.modelValue.length >= checkboxGroup?.max &&
    !checkboxGroup?.modelValue.includes(props.label!)
)

// 禁止点击标签进行选择
const labelDisabled = computed(
  () => props?.labelDisabled || checkboxGroup?.labelDisabled || false
)

// 是否显示边框
const border = computed(() => props?.border || checkboxGroup?.border || false)

// radio激活时的颜色
const activeColor = computed(() =>
  zColor.getTypeColor(
    (props?.activeColor || checkboxGroup?.activeColor) ?? 'primary'
  )
)

// 判断复选框组中是否包含某个值
const hasLabelInGroup = (
  groupValue: zCheckboxValueType[],
  label: zCheckboxValueType
) => groupValue.includes(label)

const { emit } = getCurrentInstance()!

const { formItem } = useFormItem()

// 判断是否为复选组
const isGroup = computed(() => !!checkboxGroup)

// 在复选组中是否选中当前复选框
const selected = computed(() => {
  if (isGroup.value) {
    return hasLabelInGroup(checkboxGroup!.modelValue, props.label!)
  } else {
    return props.modelValue === props.activeValue
  }
})

// 复选框点击事件
const handleCheckboxClick = (type: 'checkbox' | 'label') => {
  if (disabled.value || maxDisabled.value) return
  if (type === 'label' && labelDisabled.value) return

  if (isGroup.value) {
    checkboxGroup!.changeEvent(props.label!)
  } else {
    const modelValue = selected.value ? props.inactiveValue : props.activeValue
    emit('update:modelValue', modelValue)
    nextTick(() => {
      emit('change', modelValue)
    })
    if (props.validateEvent) {
      formItem?.validate?.('change').catch((err) => {
        z.error(err)
      })
    }
  }
}

type selectedClass = (selected: boolean) => string
type selectedStyle = (selected: boolean) => CSSProperties

// 复选框所属类
const checkboxClass = computed<selectedClass>(() => {
  return (selected: boolean) => {
    const cls: string[] = ['z-checkbox']

    // 禁止选择
    if (disabled.value || maxDisabled.value) cls.push('z-checkbox-disabled')

    // 设置尺寸
    if (sizeType.value == 'custom') {
      
    } else {
     if (size.value) cls.push(`z-checkbox-${size.value}`) 
    }

    // 激活样式
    if (selected) {
      cls.push('z-checkbox-selected')
    }

    // 设置激活时的边框颜色
    if (border.value) {
      cls.push('z-checkbox-border')
    } else {
      cls.push('z-checkbox-no-border')
    }

    return cls.join(' ')
  }
})

// 复选框所属样式
const checkboxStyle = computed<selectedStyle>(() => {
  return (selected: boolean) => {
    const style: CSSProperties = {}

    // 设置尺寸
    if (sizeType.value == 'custom') {
      style.padding=`${(Number(size.value))-16}rpx ${(Number(size.value))-10}rpx`
      style.fontSize=`${(Number(size.value))}rpx`
    }     

    // 设置激活时的颜色
    if (selected) {
      if (border.value)
        style.borderColor = zColor.getTypeColor(activeColor.value || 'primary')
      if (activeColor.value) {
        style.color = zColor.getTypeColor(activeColor.value || 'primary')
      }
    }

    if (!zType.isEmpty(props.otherStyle)) Object.assign(style, props.otherStyle)
    return style
  }
})

// 复选框选框所属类
const checkboxCheckedBoxClass = computed<selectedClass>(() => {
  return (selected: boolean) => {
    if (sizeType.value == 'custom') {
      const cls: string[] = [
        `z-checked-box-other`,
      ]
      if (selected || props.indeterminate) {
        cls.push('z-checkbox-border z-checked-box-selected')
      } else {
        cls.push('z-checkbox-border z-checkbox-disabled')
      }
      return cls.join(' ')
    } else {
      const cls: string[] = [
        `z-checked-box-${size.value ? size.value : 'default'}`,
      ]

      // 复选框选框的形状
      if (checkedShape.value)
        cls.push(
          `z-checked-box-${size.value ? size.value : 'default'}-${checkedShape.value
          }`
        )

      if (selected || props.indeterminate) {
        cls.push('z-checkbox-border z-checked-box-selected')
      } else {
        cls.push('z-checkbox-border z-checkbox-disabled')
      }
      return cls.join(' ')
    }
  }
})

// 复选框选框所属样式
const checkboxCheckedBoxStyle = computed<selectedStyle>(() => {
  return (selected: boolean) => {
    const style: CSSProperties = {}
    if (selected || props.indeterminate) {
      style.backgroundColor = zColor.getTypeColor(
        activeColor.value || 'primary'
      )
    }

    if(selected){
      style.border=`4rpx solid ${zColor.getTypeColor(activeColor.value)}`
    }

    if (sizeType.value == 'custom') {
      if (checkedShape.value == 'circle') {
        style.borderRadius = '50%'
        style.fontSize = `calc(${size.value}rpx * 0.85)`
      } else if (checkedShape.value == 'square') {
        style.borderRadius = '4rpx'
        style.fontSize = `${size.value}rpx`
      }
      style.width=`${size.value}rpx`
      style.height=`${size.value}rpx`
    }

    return style
  }
})
</script>

<template>
  <div
    :class="[checkboxClass(selected), isGroup ? 'z-checkbox-group' : '']"
    :style="checkboxStyle(selected)"
    @tap.stop="handleCheckboxClick('label')"
  >
    <!-- 左边内容 -->
    <div v-if="$slots.left && !$slots.default" class="content-left">
      <slot name="left"></slot>
    </div>
    <!-- 选中小点 -->
    <div
      :class="[
        checkboxCheckedBoxClass(selected),
        !selected && indeterminate ? 'z-checked-box-indeterminate' : '',
      ]"
      :style="checkboxCheckedBoxStyle(selected)"
      @tap.stop="handleCheckboxClick('checkbox')"
    >
      <zIcon v-if="selected" name="zhengque" :color="'#fff'"></zIcon>
    </div>
    <!-- 右边内容 -->
    <div v-if="$slots.default" class="content-right">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-checkbox {
  flex-grow: 0;
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
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
.z-checkbox-group {
  margin: 10rpx;
}
.z-checkbox-disabled {
  opacity: 0.4;
}
.z-checkbox-small {
  padding: 8rpx 14rpx;
  font-size: 24rpx;
  .z-checkbox-selected {
    .checkbox-box {
      color: #fff;
    }
  }
}

.z-checked-box-small-square {
  border-radius: 4rpx;
  font-size: 24rpx;
}
.z-checked-box-small-circle {
  border-radius: 50%;
  font-size: calc(24rpx * 0.85);
}
.z-checked-box-small {
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  transition: all 0.3s ease-in-out;
  width: 24rpx;
  height: 24rpx;
  .z-checked-box-indeterminate {
    &::after {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      width: 50%;
      height: 2rpx;
      background-color: #fff;
      transform: translate(-50%, -50%);
    }
  }
}

.z-checkbox-default,
.z-checkbox-normal {
  padding: 10rpx 20rpx;
  font-size: 28rpx;
  .z-checkbox-selected {
    .checkbox-box {
      color: #fff;
    }
  }
}

.z-checked-box-default,
.z-checked-box-normal {
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  transition: all 0.3s ease-in-out;
  width: 30rpx;
  height: 30rpx;
  .z-checked-box-indeterminate {
    &::after {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      width: 50%;
      height: 2rpx;
      background-color: #fff;
      transform: translate(-50%, -50%);
    }
  }
}

.z-checked-box-default-square,
.z-checked-box-normal-square {
  border-radius: 4rpx;
  font-size: 28rpx;
}
.z-checked-box-default-circle,
.z-checked-box-normal-circle {
  border-radius: 50%;
  font-size: calc(28rpx * 0.85);
}

.z-checkbox-large {
  padding: 12rpx 24rpx;
  font-size: 32rpx;
  flex-shrink: 0;
  position: relative;
  border-radius: 50%;
  transition: all 0.3s ease-in-out;
  .z-checkbox-selected {
    .checkbox-box {
      color: #fff;
    }
  }
}

.z-checked-box-large-square {
  border-radius: 4rpx;
  font-size: 32rpx;
}
.z-checked-box-large-circle {
  border-radius: 50%;
  font-size: calc(32rpx * 0.85);
}

.z-checked-box-large {
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  transition: all 0.3s ease-in-out;
  width: 36rpx;
  height: 36rpx;
  .z-checked-box-indeterminate {
    &::after {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      width: 50%;
      height: 2rpx;
      background-color: #fff;
      transform: translate(-50%, -50%);
    }
  }
}

.z-checked-box-other{
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  transition: all 0.3s ease-in-out;
  .z-checked-box-indeterminate {
    &::after {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      width: 50%;
      height: 2rpx;
      background-color: #fff;
      transform: translate(-50%, -50%);
    }
  }
}

.z-checkbox-border {
  border: 2rpx solid #666666;
  padding: 5rpx;
}

.z-checkbox-no-border {
  // 如果没有border则不设置内边距
  padding: 0;
}
</style>
