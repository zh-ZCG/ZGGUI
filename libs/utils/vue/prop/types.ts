import type { ExtractPropTypes, PropType } from 'vue'
import type { zPropKey } from './runtime'
import type { IfNever, UnknowToNever, WriteableArray } from './util'

type Value<T> = T[keyof T]

/**
 * 提取单个 prop 的参数类型
 *
 * @example
 * ExtractPropType<{ type: StringConstructor }> => string | undefined
 * ExtractPropType<{ type: StringConstructor, required: true }> => string
 * ExtractPropType<{ type: BooleanConstructor }> => boolean
 */
export type ExtractPropType<T extends object> = Value<ExtractPropTypes<{ key: T }>>

/**
 * 通过 `ExtractPropTypes` 提取类型，接受 `PropType<T>`、`XXXConstructor`、`never`...
 *
 * @example
 * ResolvePropType<BooleanConstructor> => boolean
 * ResolvePropType<PropType<T>> => T
 */
export type ResolvePropType<T> = IfNever<
  T,
  never,
  ExtractPropType<{
    type: WriteableArray<T>
    required: true
  }>
>

/**
 * 合并 Type、Value、Validator 的类型
 *
 * @example
 * EpPropMergeType<StringConstructor, '1', 1> =>  1 | "1" // ignores StringConstructor
 * EpPropMergeType<StringConstructor, never, number> =>  string | number
 */
export type ZPropMergeType<Type, Value, Validator> =
  | IfNever<UnknowToNever<Value>, ResolvePropType<Type>, never>
  | UnknowToNever<Value>
  | UnknowToNever<Validator>

/**
 * 处理输入参数的默认值（约束）
 */
export type ZPropInputDefault<
  Required extends boolean,
  Default
> = Required extends true
  ? never
  : Default extends Record<string, unknown> | Array<any>
  ? () => Default
  : (() => Default) | Default

/**
 * 原生 prop `类型，BooleanConstructor`、`StringConstructor`、`null`、`undefined` 等
 */
export type NativePropType =
  | ((...args: any) => any)
  | { new (...args: any): any }
  | undefined
  | null
export type IfNativePropType<T, Y, N> = [T] extends [NativePropType] ? Y : N

/**
 * prop 输入参数（约束）
 * 
 * @example
 * EpPropInput<StringConstructor, 'a', never, never, true>
 * {
    type?: StringConstructor | undefined;
    required?: true | undefined;
    values?: readonly "a"[] | undefined;
    validator?: ((val: any) => boolean) | ((val: any) => val is never) | undefined;
    default?: undefined;
  }
 */
export type ZPropInput<
  Type,
  Value,
  Validator,
  Default extends ZPropMergeType<Type, Value, Validator>,
  Required extends boolean
> = {
  type?: Type
  required?: Required
  values?: readonly Value[]
  validator?: ((val: any) => val is Validator) | ((val: any) => boolean)
  default?: ZPropInputDefault<Required, Default>
}

/**
 * prop 输出参数（约束）
 * 
 * @example
 * EpProp<'a', 'b', true>
 * {
    readonly type: PropType<"a">;
    readonly required: true;
    readonly validator: ((val: unknown) => boolean) | undefined;
    readonly default: "b";
    __epPropKey: true;
  }
 */
export type ZProp<Type, Default, Required> = {
  readonly type: PropType<Type>
  readonly required: [Required] extends [true] ? true : false
  readonly validator: ((val: unknown) => boolean) | undefined
  [zPropKey]: true
} & IfNever<Default, unknown, { readonly default: Default }>
export type IfZProp<T, Y, N> = T extends { [zPropKey]: true } ? Y : N

export type ZPropConvert<Input> = Input extends ZPropInput<
  infer Type,
  infer Value,
  infer Validator,
  any,
  infer Required
>
  ? ZPropFinalized<Type, Value, Validator, Input['default'], Required>
  : never

export type ZPropFinalized<Type, Value, Validator, Default, Required> = ZProp<
  ZPropMergeType<Type, Value, Validator>,
  UnknowToNever<Default>,
  Required
>

export {}
