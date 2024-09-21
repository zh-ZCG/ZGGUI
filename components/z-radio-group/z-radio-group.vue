<!--
 * @Description: z-radio-group 单选框组组件
 * @Author: ZCGUI & ui.zcgui.cn & zcgamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import { watch, nextTick, CSSProperties, provide, reactive, toRefs } from 'vue'
import z from '@/ZCGUI/libs/z'
import { useFormItem } from '@/ZCGUI/components/z-form/types'
import { propsHook, PropsTypeHook } from '@/ZCGUI/libs/zHooks'
import { zRadioGroupKey } from '@/ZCGUI/components/z-radio/z-radio'

/**
 * @description: z-radio-group 单选框组组件传参
 * @param: size radio单选框尺寸
 * @param: disabled	radio单选框是否禁用
 * @param: labelDisabled	radio禁止点击标签进行选择
 * @param: border 是否显示边框
 * @param: activeColor radio激活时的颜色
 * @param: modelValue  radio单选组绑定的值
 * @param: wrap  每个选项独占一行
 * @param: validateEvent  值发生修改时是否触发表单验证
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZCGUI & ui.zcgui.cn & zcgamazing@163.com
 * @example:
 */
type zRadioSizeType = 'small' | 'normal' | 'large'

interface PropsType extends PropsTypeHook {
  size?: zRadioSizeType
  disabled?: boolean
  labelDisabled?: boolean
  border?: boolean
  activeColor?: string
  modelValue?: string | number | boolean
  wrap?: boolean
  validateEvent?: boolean
}

interface EmitsType {
  (e: 'update:modelValue', value: string | number | boolean | undefined): void
  (e: 'change', value: string | number | boolean | undefined): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  size: 'normal',
  disabled: false,
  activeColor: '#409eff',
  modelValue: '',
  wrap: false,
  validateEvent: true,
})

const emits = defineEmits<EmitsType>()

const { formItem } = useFormItem()

// 值更新事件
const changeEvent = (val: PropsType['modelValue']) => {
  emits('update:modelValue', val)
  nextTick(() => {
    emits('change', val)
  })
}

// 当值发生改变时触发校验
watch(
  () => props.modelValue,
  () => {
    if (props.validateEvent) {
      formItem?.validate?.('change').catch(err => {
        z.error(err)
      })
    }
  }
)

provide(
  zRadioGroupKey,
  reactive({
    ...toRefs(props),
    changeEvent,
  })
)
</script>

<template>
  <div
    class="z-radio-group pr df fww"
    :class="props.wrap ? 'z-radio-group-wrap' : ''"
  >
    <slot></slot>
  </div>
</template>

<style lang="less" scoped>
.z-radio-group {
  width: 100%;
}
.z-radio-group-wrap {
  display: block;
}
</style>
