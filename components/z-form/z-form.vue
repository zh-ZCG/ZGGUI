<!--
 * @Description: z-form 表单组件
 * @Author: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import {
  watch,
  nextTick,
  CSSProperties,
  computed,
  provide,
  reactive,
  toRefs,
} from 'vue'
import z from '../../libs/z'
import zType from '../../libs/zType'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
import {
  FormRules,
  formContextKey,
  FormContext,
  FormItemContext,
  FormValidationCallback,
  FormValidationResult,
  filterFields,
} from '../../components/z-form/types'
import type {
  RuleItem,
  ValidateError,
  ValidateFieldsError,
} from '../../libs/async-validator'
/**
 * @description: z-form 表单组件传参
 * @param: size 设置表单下组件的尺寸
 * @param: disabled	是否禁用表单内的所有组件，优先级比组件自身的禁用属性高
 * @param: model	表单数据对象
 * @param: rules  rules
 * @param: labelPosition  label标签位置
 * @param: requireAsteriskPosition  必填星号显示位置
 * @param: labelWidth  label的宽度，默认单位为px
 * @param: labelSuffix  表单域标签的后缀
 * @param: statusIcon  是否在输入框中显示校验结果反馈图标
 * @param: showMessage  是否显示校验结果
 * @param: validateOnRuleChange  是否在校验规则修改后立马触发一次校验
 * @param: hideRequiredAsterisk  是否隐藏必填星号
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */

type Arrayable<T> = T | T[]
type formSizeType = 'small' | 'normal' | 'large'
type labelPositionType = 'left' | 'right' | 'top'
type requireAsteriskPositionType = 'left' | 'right'
type FormItemProp = Arrayable<string>

interface PropsType extends PropsTypeHook {
  size?: formSizeType
  disabled?: boolean
  model?: object
  rules?: FormRules
  labelPosition?: labelPositionType
  requireAsteriskPosition?: requireAsteriskPositionType
  labelWidth?: string | number
  labelSuffix?: string
  statusIcon?: boolean
  showMessage?: boolean
  validateOnRuleChange?: boolean
  hideRequiredAsterisk?: boolean
}

interface EmitsType {
  (
    e: 'validate',
    prop: FormItemProp,
    isValid: boolean,
    message: string
  ): boolean
  //prop:FormItemProp,isValid:boolean,message:string
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  labelPosition: 'right',
  requireAsteriskPosition: 'left',
  labelWidth: '',
  labelSuffix: '',
  showMessage: true,
  validateOnRuleChange: true,
})

const emits = defineEmits<EmitsType>()

// formItem信息
const fields: FormItemContext[] = []

// 添加formItem信息
const addField: FormContext['addField'] = (field) => {
  fields.push(field)
}

// 移除formItem信息
const removeField: FormContext['removeField'] = (field) => {
  if (field.prop) {
    fields.splice(fields.indexOf(field), 1)
  }
}

// 重置formItem
const resetFields: FormContext['resetFields'] = (properties = []) => {
  if (!props.model) {
    // eslint-disable-next-line no-console
    return z.error('z-form model参数未定义')
  }
  filterFields(fields, properties).forEach((field) => field.resetField())
}

// 清除formItem验证
const clearValidate: FormContext['clearValidate'] = (props = []) => {
  filterFields(fields, props).forEach((field) => field.clearValidate())
}

// 是否可以进行校验
const isValidatable = computed(() => {
  const hasModel = !!props.model
  if (!hasModel) {
    // eslint-disable-next-line no-console
    z.error('z-form model参数未定义')
  }
  return hasModel
})

// 获取需要校验的字段
const obtainValidateFields = (props: Arrayable<FormItemProp>) => {
  if (fields.length === 0) return []

  const filteredFields = filterFields(fields, props)
  if (!filteredFields.length) {
    // eslint-disable-next-line no-console
    z.error('z-form 未找到需要校验的字段')
    return []
  }
  return filteredFields
}

// 校验
const validate = async (
  callback?: FormValidationCallback
): FormValidationResult => validateField(undefined, callback)

// 开始校验字段
const doValidateField = async (
  props: Arrayable<FormItemProp>
): Promise<boolean> => {
  if (!isValidatable.value) return false

  const fields = obtainValidateFields(props)
  if (fields.length === 0) return false

  let validationErrors: ValidateFieldsError = {}
  for (const field of fields) {
    try {
      await field.validate('')
    } catch (fields) {
      validationErrors = {
        ...validationErrors,
        ...(fields as ValidateFieldsError),
      }
    }
  }

  if (Object.keys(validationErrors).length === 0) return true
  return Promise.reject(validationErrors)
}

// 校验字段
const validateField: FormContext['validateField'] = async (
  modelProps = [],
  callback
) => {
  const shouldThrow = !zType.isFunction(callback)
  try {
    const result = await doValidateField(modelProps)
    // 如果结果为false则说明当前校验不通过
    if (result === true) {
      callback?.(true)
    }
    return result
  } catch (e) {
    if (e instanceof Error) throw e

    const invalidFields = e as ValidateFieldsError

    callback?.(false, invalidFields)
    return shouldThrow && Promise.reject(invalidFields)
  }
}

watch(
  () => props.rules,
  () => {
    if (props.validateOnRuleChange) validate()
  },
  {
    deep: true,
  }
)

provide(
  formContextKey,
  reactive({
    ...toRefs(props),
    emits,

    resetFields,
    clearValidate,
    validateField,
    addField,
    removeField,
  })
)

defineExpose({
  /**
   * @description 对整个表单的内容进行验证。 接收一个回调函数或返回Promise
   */
  validate,
  /**
   * @description 验证具体的某个字段
   */
  validateField,
  /**
   * @description 重置表单
   */
  resetFields,
  /**
   * @description 清除表单验证
   */
  clearValidate,
})
</script>

<template>
  <div class="z-form pr">
    <slot></slot>
  </div>
</template>

<style lang="less" scoped>
.z-form {
  display: block;
  width: 100%;
}
</style>
