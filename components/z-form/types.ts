import type { SetupContext, InjectionKey } from 'vue'
import { buildProp, definePropType } from '@/ZCGUI/libs/utils'

import { castArray } from '@/ZCGUI/libs/lodash'
import { computed, inject, ref, unref } from 'vue'
import { useProp } from '@/ZCGUI/libs/Hooks/z-use-prop'
import { MaybeRef } from '@/ZCGUI/libs/zType'
import type {
  RuleItem,
  ValidateError,
  ValidateFieldsError,
} from '@/ZCGUI/libs/async-validator'

import type Form from '@/ZCGUI/components/z-form/z-form.vue'
import type FormItem from '@/ZCGUI/components/z-form-item/z-form-item.vue'

export type zFormInstance = InstanceType<typeof Form>
export type zFormItemInstance = InstanceType<typeof FormItem>

type formSizeType = 'small' | 'normal' | 'large'
type labelPositionType = 'left' | 'right' | 'top'
type requireAsteriskPositionType = 'left' | 'right'
type FormItemProp = Arrayable<string>
const formItemValidateStates = ['', 'error', 'validating', 'success'] as const
export type FormItemValidateStates = (typeof formItemValidateStates)[number]
type FormProps = {
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

type FormItemProps = {
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

type FormEmits = {
  validate: (prop: FormItemProp, isValid: boolean, message: string) => boolean
}

export type Arrayable<T> = T | T[]

const formComponentSizes = ['small', 'normal', 'large']
type FormComponentSize = (typeof formComponentSizes)[number]
export interface FormItemRule extends RuleItem {
  trigger?: Arrayable<string>
}
export type FormRules = Partial<Record<string, Arrayable<FormItemRule>>>

export type FormValidationResult = Promise<boolean>
export type FormValidationCallback = (
  isValid: boolean,
  invalidFields?: ValidateFieldsError
) => void

export interface FormValidateFailure {
  errors: ValidateError[] | null
  fields: ValidateFieldsError
}

export type FormContext = FormProps & {
  emits: SetupContext<FormEmits>['emit']

  //expose
  addField: (field: FormItemContext) => void
  removeField: (field: FormItemContext) => void
  resetFields: (props?: Arrayable<FormItemProp>) => void
  clearValidate: (props?: Arrayable<FormItemProp>) => void
  validateField: (
    props?: Arrayable<FormItemProp>,
    callback?: FormValidationCallback
  ) => FormValidationResult
}

export interface FormItemContext extends FormItemProps {
  size: FormComponentSize
  validateState: FormItemValidateStates
  hasLabel: boolean
  validate: (
    trigger: string,
    callback?: FormValidationCallback
  ) => FormValidationResult
  resetField: () => void
  clearValidate: () => void
}

export const formContextKey: InjectionKey<FormContext> = Symbol('formContextKey')
export const formItemContextKey: InjectionKey<FormItemContext> =
  Symbol('formItemContextKey')

export const filterFields = (
  fields: FormItemContext[],
  props: Arrayable<FormItemProp>
) => {
  const normalized = castArray(props)
  return normalized.length > 0
    ? fields.filter(field => field.prop && normalized.includes(field.prop))
    : fields
}

/* 表单尺寸 */
export const useFormSize = (
  fallback?: MaybeRef<FormComponentSize | undefined>,
  ignore: Partial<Record<'prop' | 'form' | 'formItem' | 'global', boolean>> = {}
) => {
  const emptyRef = ref(undefined)

  const size = ignore.prop ? emptyRef : useProp<FormComponentSize>('size')
  const form = ignore.form ? { size: undefined } : inject(formContextKey, undefined)
  const formItem = ignore.formItem
    ? { size: undefined }
    : inject(formItemContextKey, undefined)

  return computed(
    (): FormComponentSize =>
      size.value || unref(fallback) || formItem?.size || form?.size || ''
  )
}

/* 表单是否禁用 */
export const useFormDisabled = (fallback?: MaybeRef<boolean | undefined>) => {
  const disabled = useProp<boolean>('disabled')
  const form = inject(formContextKey, undefined)
  return computed(() => disabled.value || unref(fallback) || form?.disabled || false)
}

export const useFormItem = () => {
  const form = inject(formContextKey, undefined)
  const formItem = inject(formItemContextKey, undefined)

  return {
    form,
    formItem,
  }
}

export type ComponentIndex = string | number

/**
 * @description 组件Boolean类型定义
 */
export const useComponentBoolean = buildProp({
  type: [Boolean, undefined],
  default: undefined,
})

const componentSizes = ['small', 'normal', 'large'] as const

/**
 * @description 组件尺寸
 */
export const useComponentSizeProp = buildProp({
  type: String,
  values: componentSizes,
  required: false,
} as const)

/**
 * @description 表单组件尺寸
 */
export const useFormSizeProps = buildProp({
  type: String,
  values: formComponentSizes,
  required: false,
} as const)

/**
 * @description 组件自定义样式
 */
export const useComponentCustomStyleProp = buildProp({
  type: Object,
  default: () => ({}),
})

/**
 * @description 组件自定义index
 */
export const useComponentIndexProp = buildProp({
  type: definePropType<ComponentIndex>([String, Number]),
  default: () => Math.floor(Math.random() * 10000),
})

/**
 * @description 组件是否开启底部安全区域
 */
export const useComponentSafeAreaInsetBottomProp = buildProp({
  type: Boolean,
  default: true,
})
