<!--
 * @Description: z-checkbox-group 复选框组组件
 * @Author: ZGGUI & ui.zggui.cn & zggamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import { watch, nextTick, CSSProperties, provide, reactive, toRefs } from 'vue'
import z from '@/ZGGUI/libs/z'
import { useFormItem } from '@/ZGGUI/components/z-form/types'
import { propsHook, PropsTypeHook } from '@/ZGGUI/libs/zHooks'
import {
  zCheckboxGroupKey,
  zCheckboxValueType,
  zCheckboxGroupValueType,
} from '@/ZGGUI/components/z-checkbox/z-checkbox'
/**
 * @description: z-checkbox-group 复选框组组件传参
 * @param: size radio复选框尺寸
 * @param: disabled	radio复选框是否禁用
 * @param: labelDisabled	radio禁止点击标签进行选择
 * @param: border 是否显示边框
 * @param: activeColor radio激活时的颜色
 * @param: modelValue  radio单选组绑定的值
 * @param: min  可被勾选的复选框最小值
 * @param: max  可被勾选的复选框最大值
 * @param: wrap  每个选项独占一行
 * @param: validateEvent  值发生修改时是否触发表单验证
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zggui.cn & zggamazing@163.com
 * @example:
 */
type zCheckBoxSizeType = 'small' | 'normal' | 'large'

type zCheckBoxShapes = 'square' | 'circle'

interface PropsType extends PropsTypeHook {
  size?: zCheckBoxSizeType
  checkedShape?: zCheckBoxShapes
  disabled?: boolean
  labelDisabled?: boolean
  border?: boolean
  activeColor?: string
  modelValue?: zCheckboxGroupValueType
  min?: number
  max?: number
  wrap?: boolean
  validateEvent?: boolean
}

interface EmitsType {
  (e: 'update:modelValue', value: zCheckboxGroupValueType): void
  (e: 'change', value: zCheckboxGroupValueType): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  size: 'normal',
  activeColor: '#409eff',
  modelValue: () => [],
})

const emits = defineEmits<EmitsType>()

const { formItem } = useFormItem()

// 更新复选框组的值
const changeEvent = (val: zCheckboxGroupValueType[number]) => {
  const { modelValue, max } = props
  const selectValues = [...modelValue]
  // 判断更新的值是否已经存在于复选框组中
  const hasLabel = selectValues.includes(val)
  if (hasLabel) {
    // 存在则删除
    selectValues.splice(selectValues.indexOf(val), 1)
  } else {
    // 不存在则添加，判断是否超过最大值
    if (max && selectValues.length >= max) {
      return
    }
    // 如果没有设置最大值，则直接添加
    selectValues.push(val)
  }
  emits('update:modelValue', selectValues)
  nextTick(() => {
    emits('change', selectValues)
  })
}

watch(
  () => props.modelValue,
  () => {
    if (props.validateEvent) {
      formItem?.validate?.('change').catch((err) => {
        z.error(err)
      })
    }
  }
)

provide(
  zCheckboxGroupKey,
  reactive({
    ...toRefs(props),
    changeEvent,
  })
)
</script>

<template>
  <div
    class="z-checkbox-group pr df fww"
    :class="props.wrap ? 'z-checkbox-group-wrap' : ''"
  >
    <slot></slot>
  </div>
</template>

<style lang="less" scoped>
.z-checkbox-group {
  width: 100%;
}
.z-checkbox-group-wrap {
  display: block;
}
</style>
