/**
 * 类型判断默认方法
 */
import { isNil } from '../libs/lodash'
import { Ref } from 'vue'

import {
  isArray,
  isFunction,
  isObject,
  isString,
  isDate,
  isPromise,
  isSymbol,
} from '@vue/shared'
import { isBoolean, isNumber } from '../libs/lodash'

export const mutable = <T extends readonly any[] | Record<string, unknown>>(val: T) =>
  val as Mutable<typeof val>
export type Mutable<T> = { -readonly [P in keyof T]: T[P] }

export type HTMLElementCustomized<T> = HTMLElement & T

export type MaybeRef<T> = T | Ref<T>

export type Nullable<T> = T | null
export type Arrayable<T> = T | T[]
export type Awaitable<T> = T | Promise<T>

export const isUndefined = (val: any): val is undefined => val === undefined

export const isEmpty = (val: unknown) =>
  (!val && val !== 0) ||
  (isArray(val) && val.length === 0) ||
  (isObject(val) && !Object.keys(val).length)

export const isElement = (e: unknown): e is Element => {
  if (typeof Element === 'undefined') return false
  return e instanceof Element
}

export const isPropAbsent = (prop: unknown): prop is null | undefined => {
  return isNil(prop)
}

export const isStringNumber = (val: string): boolean => {
  if (!isString(val)) return false
  return !Number.isNaN(Number(val))
}

// 将所有方法放入一个对象中
const zType = {
  isArray,
  isObject,
  isString,
  isFunction,
  isDate,
  isPromise,
  isSymbol,
  isBoolean,
  isNumber,
  isUndefined,
  isEmpty,
  isElement,
  isPropAbsent,
  isStringNumber,
  mutable,
}

// 默认导出这个对象
export default zType
