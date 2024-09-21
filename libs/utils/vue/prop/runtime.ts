/* eslint-disable eslint-comments/no-unlimited-disable */
import { warn } from 'vue'
import { fromPairs } from '@/ZCGUI/libs/lodash'
import zType from '@/ZCGUI/libs/zType'
import { hasOwn } from '@vue/shared'

import type { PropType } from 'vue'
import type {
  IfNativePropType,
  IfZProp,
  NativePropType,
  ZProp,
  ZPropConvert,
  ZPropFinalized,
  ZPropInput,
  ZPropMergeType,
} from './types'

export const zPropKey = '__zPropKey'

export const definePropType = <T>(val: any): PropType<T> => val

export const isZProp = (val: unknown): val is ZProp<any, any, any> =>
  zType.isObject(val) && !!(val as any)[zPropKey]

/**
  * 生成 prop，能更好地优化类型
  * @example
  // limited options
  // the type will be PropType<'light' | 'dark'>
  buildProp({
    type: String,
    values: ['light', 'dark'],
  } as const)
  * @example
  // limited options and other types
  // the type will be PropType<'small' | 'large' | number>
  buildProp({
    type: [String, Number],
    values: ['small', 'large'],
    validator: (val: unknown): val is number => typeof val === 'number',
  } as const)
*/
// eslint-disable-next-line eslint-comments/no-duplicate-disable
// eslint-disable-next-line eslint-comments/no-unlimited-disable
/* eslint-disable */
export const buildProp = <
  Type = never,
  Value = never,
  Validator = never,
  Default extends ZPropMergeType<Type, Value, Validator> = never,
  Required extends boolean = false
>(
  prop: ZPropInput<Type, Value, Validator, Default, Required>,
  key?: string
): ZPropFinalized<Type, Value, Validator, Default, Required> => {
  if (!zType.isObject(prop) || isZProp(prop)) return prop as any

  const { values, required, default: defaultValue, type, validator } = prop

  const _validator =
    values || validator
      ? (val: unknown) => {
          let valid = false
          let allowedValues: unknown[] = []

          if (values) {
            allowedValues = Array.from(values)
            if (hasOwn(prop, 'default')) {
              allowedValues.push(defaultValue)
            }
            valid ||= allowedValues.includes(val)
          }
          if (validator) valid ||= validator(val)

          if (!valid && allowedValues.length > 0) {
            const allowValuesText = [...new Set(allowedValues)]
              .map(value => JSON.stringify(value))
              .join(', ')
            warn(
              `Invalid prop: validation failed${
                key ? ` for prop "${key}"` : ''
              }. Expected one of [${allowValuesText}], got value ${JSON.stringify(
                val
              )}.`
            )
          }
          return valid
        }
      : undefined

  const zProp: any = {
    type,
    required: !!required,
    validator: _validator,
    [zPropKey]: true,
  }
  if (hasOwn(prop, 'default')) zProp.default = defaultValue
  return zProp
}

export const buildProps = <
  Props extends Record<
    string,
    { [zPropKey]: true } | NativePropType | ZPropInput<any, any, any, any, any>
  >
>(
  props: Props
): {
  [K in keyof Props]: IfZProp<
    Props[K],
    Props[K],
    IfNativePropType<Props[K], Props[K], ZPropConvert<Props[K]>>
  >
} =>
  fromPairs(
    Object.entries(props).map(([key, option]) => [key, buildProp(option as any, key)])
  ) as any
/* eslint-enable */
