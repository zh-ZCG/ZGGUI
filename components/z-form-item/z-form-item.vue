<!--
 * @Description: z-form-item 表单子组件
 * @Author: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import {
  ref,
  Ref,
  onMounted,
  getCurrentInstance,
  onBeforeUnmount,
  watch,
  nextTick,
  CSSProperties,
  computed,
  provide,
  reactive,
  toRefs,
  useSlots,
  inject,
  Slots,
} from 'vue'
import z from '../../libs/z'
import zType from '../../libs/zType'
import { Arrayable } from '../../libs/zType'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
import { castArray, debounce } from '../../libs/lodash'
import { getProp } from '../../libs/utils/zObject'
import {
  FormRules,
  formContextKey,
  FormContext,
  FormItemContext,
  FormValidationCallback,
  FormValidationResult,
  formItemContextKey,
  FormItemRule,
  useFormSize,
  useFormDisabled,
} from '../../components/z-form/types'
import type {
  RuleItem,
  ValidateError,
  ValidateFieldsError,
} from '../../libs/async-validator'

import AsyncValidator from '../../libs/async-validator'
/**
 * @description: z-form-item 表单子组件传参
 * @param: label label文本
 * @param: labelWidth	label的宽度，默认单位为px
 * @param: labelPosition	label标签位置
 * @param: prop  model中的key，如果需要使用校验，该字段为必填，可以是一个路径数组(['user', 'name', 0])
 * @param: required  标记字段是否为必填，如果不填写则根据校验规则自动生成
 * @param: rules  表单校验规则
 * @param: error  字段错误信息，如果设置了该字段则校验状态会变成error，并显示该字段的内容
 * @param: validateStatus  校验状态
 * @param: showMessage  是否显示校验结果
 * @param: size  控制表单组件尺寸
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  label?: string
  labelWidth?: string | number
  labelPosition?: string
  prop?: Arrayable<string>
  required?: boolean
  rules?: Arrayable<FormItemRule>
  error?: string
  validateStatus?: string
  showMessage?: boolean
  size?: string
}

interface EmitsType {}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  labelWidth: '',
  labelPosition: '',
  required: undefined,
  showMessage: true,
})

const emits = defineEmits<EmitsType>()

type formItemValidateStates = '' | 'error' | 'validating' | 'success'

interface FormValidateFailure {
  errors: ValidateError[] | null
  fields: ValidateFieldsError
}

const formContext = inject(formContextKey, undefined)

// 初始化的值
let initialValue: any = undefined
// 是否重置字段校验
let isResettingField = false

// 校验状态
const validateState = ref<formItemValidateStates>('')
const validateStateDebounced = ref<formItemValidateStates>('')

// 错误信息
const validateMessage = ref('')

// 是否有标签
const hasLabel = computed(() => {
  return !!(props.label || slots.label)
})

// 当前标签的值
const currentLabel = computed(
  () => `${props.label || ''}${formContext?.labelSuffix || ''}`
)

// formItem field字段名称
const fieldValue = computed(() => {
  const model = formContext?.model
  if (!model || !props.prop) {
    return
  }
  return getProp(model, props.prop).value
})

// formItem prop字段名称
const propString = computed(() => {
  if (!props.prop) return ''
  return zType.isString(props.prop) ? props.prop : props.prop.join('.')
})

// 校验规则
const normalizedRules = computed(() => {
  const rules: FormItemRule[] = []
  // 如果设置了rules，则直接使用rules
  if (props.rules) rules.push(...castArray(props.rules))

  // 如果设置了prop，则根据prop从formContext中获取rules
  const formRules = formContext?.rules
  if (formRules && props.prop) {
    const _rules = getProp<Arrayable<FormItemRule> | undefined>(
      formRules,
      props.prop
    ).value
    if (_rules) rules.push(...castArray(_rules))
  }

  // 如果设置了required，则根据required的值来设置校验规则
  if (props.required !== undefined) {
    const requiredRules = rules
      .map((rule, index) => [rule, index] as const)
      .filter(([rule]) => Object.keys(rule).includes('required'))
    if (requiredRules.length) {
      for (const [rule, index] of requiredRules) {
        if (rule.required === props.required) continue
        rules[index] = { ...rule, required: props.required }
      }
    } else {
      rules.push({ required: props.required })
    }
  }

  return rules
})

// 是否需要校验（开启校验）
const validateEnabled = computed(() => normalizedRules.value.length > 0)

// 是否为必填
const isRequired = computed(() =>
  normalizedRules.value.some((rule) => rule.required)
)

// 是否显示错误信息
const shouldShowError = computed(
  () =>
    validateStateDebounced.value === 'error' &&
    props.showMessage &&
    z.isEmptyVariableInDefault(formContext?.showMessage, true)
)

// 设置校验状态
const setValidateState = (state: formItemValidateStates) => {
  validateState.value = state
}

// 获取校验规则
const getFilterRule = (trigger: string) => {
  const rules = normalizedRules.value
  return (
    rules
      .filter((rule) => {
        if (!rule.trigger || !trigger) return true
        if (Array.isArray(rule.trigger)) {
          return rule.trigger.includes(trigger)
        } else {
          return rule.trigger === trigger
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(({ trigger, ...rule }): RuleItem => rule)
  )
}

// 校验失败
const onValidationFailed = (error: FormValidateFailure) => {
  const { errors, fields } = error
  if (!errors || !fields) {
    console.error(error)
  }

  setValidateState('error')
  validateMessage.value = errors
    ? z.isEmptyVariableInDefault(errors?.[0]?.message, `${props.prop} 为必填项`)
    : ''

  formContext?.emits('validate', props.prop!, false, validateMessage.value)
}

// 校验通过
const onValidationSucceded = () => {
  setValidateState('success')
  validateMessage.value = ''

  formContext?.emits('validate', props.prop!, true, '')
}

// 进行校验操作
const doValidate = async (rules: RuleItem[]): Promise<true> => {
  const modelName = propString.value
  const validator = new AsyncValidator({
    [modelName]: rules,
  })
  return validator
    .validate({ [modelName]: fieldValue.value }, { firstFields: true })
    .then(() => {
      onValidationSucceded()
      return true as const
    })
    .catch((err: FormValidateFailure) => {
      onValidationFailed(err as FormValidateFailure)
      return Promise.reject(err)
    })
}

// 校验
const validate: FormItemContext['validate'] = async (trigger, callback) => {
  // 重置字段后跳过校验
  if (isResettingField || !props.prop) return false

  const hasCallback = zType.isFunction(callback)
  if (!validateEnabled.value) {
    callback?.(false)
    return false
  }

  const rules = getFilterRule(trigger)
  if (rules.length === 0) {
    callback?.(true)
    return true
  }

  setValidateState('validating')

  return doValidate(rules)
    .then(() => {
      callback?.(true)
      return true as const
    })
    .catch((err: FormValidateFailure) => {
      const { fields } = err
      callback?.(false, fields)
      return hasCallback ? false : Promise.reject(fields)
    })
}

// 清除校验信息
const clearValidate: FormItemContext['clearValidate'] = () => {
  setValidateState('')
  validateMessage.value = ''
  isResettingField = false
}

// 重置字段
const resetField: FormItemContext['resetField'] = async () => {
  const model = formContext?.model
  if (!model || !props.prop) return

  const computedValue = getProp(model, props.prop)

  // 阻止触发校验
  isResettingField = true

  computedValue.value = z.deepClone(initialValue)

  await nextTick()
  clearValidate()

  isResettingField = false
}

// 设置初始化的值
const initFieldValue = () => {
  initialValue = z.deepClone(fieldValue.value)
}

const validateStateDebouncedUpdater = debounce(() => {
  validateStateDebounced.value = validateState.value
}, 100)
watch(
  () => validateState.value,
  () => validateStateDebouncedUpdater()
)

watch(
  () => props.error,
  (val) => {
    validateMessage.value = val || ''
    setValidateState(val ? 'error' : '')
  },
  {
    immediate: true,
  }
)

watch(
  () => props.validateStatus,
  (val) => {
    setValidateState((val as formItemValidateStates) || '')
  }
)

const form = inject(formContextKey, undefined)

const size = useFormSize(undefined, { formItem: false })

// 标签的宽度
const labelWidth = computed(() =>
  z.addUnit(props.labelWidth || form?.labelWidth || '')
)

// 标签的位置
const labelPosition = computed(
  () => props.labelPosition || form?.labelPosition || 'right'
)

// 是否隐藏必填星号
const hideRequiredAsterisk = computed(() => form?.hideRequiredAsterisk || false)

// 必填星号的位置
const requireAsteriskPosition = computed(
  () => form?.requireAsteriskPosition || 'left'
)

const instance = getCurrentInstance()!

// label标签容器宽度
const labelContainerWidth = ref(0)
const labelId = `z-label-${instance?.uid}`

// 获取label标签的宽度
const initLabelContainerWidth = () => {
  if (!hasLabel.value) return
  z.getDomInfo(`#${labelId}`, instance).then((res) => {
    labelContainerWidth.value = res?.width || 0
  })
}

// formItem所属类
const formItemClass = computed<string>(() => {
  const cls: string[] = ['z-form-item']

  if (labelPosition.value) cls.push(`label-${labelPosition.value}`)

  return cls.join(' ')
})
const formItemStyle = computed<CSSProperties>(() => {
  const cls: CSSProperties = {}

  if (size.value) {
    switch (size.value) {
      case 'small': {
        cls.fontSize = '22rpx'
        break
      }
      case 'normal': {
        cls.fontSize = '28rpx'
        break
      }
      case 'large': {
        cls.fontSize = '34rpx'
        break
      }
    }
  }

  return cls
})

// formItemLabel所属类
const formItemLabelClass = computed<string>(() => {
  const cls: string[] = ['label']
  if (!hideRequiredAsterisk.value && isRequired.value) {
    cls.push(`asterisk-${requireAsteriskPosition.value}`)
  }
  return cls.join(' ')
})

// formItemLabel所属样式
const formItemLabelStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}
  if (labelPosition.value !== 'top' && labelWidth.value)
    style.width = labelWidth.value
  return style
})

// formItemErrorMessage所属样式
const formItemErrorMessageStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}
  if (labelPosition.value !== 'top' && hasLabel.value) {
    style.paddingLeft = `${labelContainerWidth.value}px`
  }
  return style
})

const slots = useSlots()

const _size = useFormSize(undefined, { formItem: false })

const context: FormItemContext = reactive({
  ...toRefs(props),
  size: _size,
  validateState,
  hasLabel,
  resetField,
  clearValidate,
  validate,
})

onMounted(() => {
  if (props.prop) {
    formContext?.addField(context)
    initFieldValue()
  }
  nextTick(() => {
    initLabelContainerWidth()
  })
})

onBeforeUnmount(() => {
  formContext?.removeField(context)
})

provide(formItemContextKey, context)

defineExpose({
  /**
   * @description 表单尺寸
   */
  size: _size,
  /**
   * @description 校验信息
   */
  validateMessage,
  /**
   * @description 校验状态
   */
  validateState,
  /**
   * @description 对表单Item的内容进行验证。 接收一个回调函数或返回Promise
   */
  validate,
  /**
   * @description 重置当前字段信息
   */
  resetField,
  /**
   * @description 清除表单字段验证
   */
  clearValidate,
})
</script>

<template>
  <div :class="[formItemClass]" :style="formItemStyle">
    <div class="z-form-item-wrapper">
      <!-- label -->
      <div
        v-if="hasLabel"
        :id="labelId"
        :class="[formItemLabelClass]"
        :style="formItemLabelStyle"
      >
        <slot name="label">
          {{ currentLabel }}
        </slot>
      </div>
      <!-- 表单组件 -->
      <div class="content">
        <slot></slot>
      </div>
    </div>
    <!-- 错误信息 -->
    <div
      v-if="shouldShowError"
      class="ce5 error-message"
      :style="formItemErrorMessageStyle"
    >
      {{ validateMessage }}
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-form-item {
  display: block;
  position: relative;
  width: 100%;
  margin-bottom: 26rpx;
  .z-form-item-wrapper {
    display: flex;
    align-items: center;
    width: 100%;
    .label {
      flex-shrink: 0;
      padding: 0rpx 16rpx 0rpx 0rpx;
    }
    .asterisk-left {
      &::before {
        content: '*';
        color: @error;
        margin-right: 4rpx;
      }
    }
    .asterisk-right {
      &::after {
        content: '*';
        color: @error;
        margin-left: 4rpx;
      }
    }
    .content {
      flex-grow: 1;
    }
  }
  .error-message {
    width: 100%;
    margin-top: 4rpx;
  }
}
.label-top {
  .wrapper {
    display: block;
    .label {
      width: 100%;
      padding-bottom: 10rpx;
    }
    .content {
      width: 100%;
    }
  }
}
.label-right {
  .wrapper {
    display: block;
    .label {
      text-align: right;
    }
  }
}
.label-left {
  .wrapper {
    display: block;
    .label {
      text-align: left;
    }
  }
}
</style>
