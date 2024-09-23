<!--
 * @Description: z-region-picker 地区选择组件
 * @Author: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import {
  ref,
  Ref,
  onMounted,
  getCurrentInstance,
  computed,
  onBeforeUnmount,
  watch,
  nextTick,
  CSSProperties,
} from 'vue'
import z from '@/ZGGUI/libs/z'
import type { Dayjs } from '@/ZGGUI/libs/dayjs'
import dayjs from '@/ZGGUI/libs/dayjs'
import zPicker from '@/ZGGUI/components/z-picker/z-picker.vue'
import regionJsonData from '@/ZGGUI/components/z-region-picker/z-region-data.json'
import { propsHook, PropsTypeHook } from '@/ZGGUI/libs/zHooks'
/**
 * @description: z-region-picker 时间选择组件传参
 * @param: modelValue 地区选择器绑定的值，可以传递省市区的code和name，["11", "1101", "110101"] || ["广东省", "广州市", "天河区"]
 * @param: open		 显示/隐藏地区选择器
 * @param: showCancel 显示取消按钮
 * @param: cancelText 取消按钮的文本
 * @param: cancelColor 取消按钮的字体颜色
 * @param: showConfirm 显示确定按钮
 * @param: confirmText 确定按钮的文本
 * @param: confirmColor 确定按钮的字体颜色
 * @param: mask 显示遮罩
 * @param: zIndex zIndex
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  modelValue?: RegionPickerModelValueType
  open?: boolean
  showCancel?: boolean
  cancelText?: string
  cancelColor?: string
  showConfirm?: boolean
  confirmText?: string
  confirmColor?: string
  mask?: boolean
  zIndex?: number
}

type RegionPickerModelValueType = Array<string>

interface EmitsType {
  (e: 'update:modelValue', value: RegionPickerModelValueType): void
  (e: 'change', value: RegionPickerModelValueType, item: any): void
  (e: 'update:open', value: boolean): void
  (e: 'confirm', value: RegionPickerModelValueType, item: any): void
  (e: 'cancel'): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  modelValue: [] as any,
  showCancel: true,
  showConfirm: true,
  zIndex: 550,
})

const emits = defineEmits<EmitsType>()

type RegionModelValueMode = 'code' | 'name'

type RegionData = RegionDataItem[]
type RegionDataItem = {
  code: string
  name: string
  children?: RegionDataItem[]
}

// 列表数据
const pickerSelectData = regionJsonData

// 显示/隐藏地址选择器
const showPicker = ref(false)
watch(
  () => props.open,
  (val) => {
    showPicker.value = val
  }
)
const _closePicker = () => {
  emits('update:open', false)
}
// picker关闭事件
const handlePickerCloseEvent = () => {
  _closePicker()
  emits('close')
}

// 当前选中的值
const currentSelectValue = ref<RegionPickerModelValueType>([])
// 标记当前传递的值的类型
let userRegionValueMode: RegionModelValueMode = 'code'

// 根据name获取code
const getCodeByNames = (names: string[]): string[] => {
  const code: string[] = []
  let data: RegionDataItem[] = regionJsonData
  do {
    const name = names.shift()
    const regionItem: RegionDataItem =
      data.find((item) => item.name === name) || data[0]
    if (regionItem) {
      code.push(regionItem.code)
    }
    data = regionItem?.children || []
  } while (data.length)

  return code
}
// 根据code获取name
const getNameByCodes = (codes: string[]): string[] => {
  const name: string[] = []
  let data: RegionDataItem[] = regionJsonData

  do {
    const code = codes.shift()
    const regionItem: RegionDataItem =
      data.find((item) => item.code === code) || data[0]
    if (regionItem) {
      name.push(regionItem.name)
    }
    data = regionItem?.children || []
  } while (data.length)

  return name
}

/**
 * 填充code
 * @example 传递的是['44', '4401'] 返回 ['44', '4401', '440113']
 */
const fillCode = (codes: string[]): string[] => {
  const result: string[] = []
  let data: RegionDataItem[] = regionJsonData
  do {
    const code = codes.shift()
    const regionItem: RegionDataItem =
      data.find((item) => item.code === code) || data[0]
    if (regionItem) {
      result.push(regionItem.code)
    }
    data = regionItem?.children || []
  } while (data.length)

  return result
}

// 标记是否内部更新
let isInnerUpdate = false
watch(
  () => props.modelValue as RegionPickerModelValueType,
  (val: RegionPickerModelValueType) => {
    if (isInnerUpdate) {
      isInnerUpdate = false
      return
    }

    const chineseReg = /^[\u4E00-\u9FA5]+$/ // 中文正则
    const codeReg = /^\d{2,6}$/ // 地区编码正则

    if (val.length) {
      const value = z.deepClone(val)
      if (chineseReg.test(value[0])) {
        userRegionValueMode = 'name'
        currentSelectValue.value = getCodeByNames(value as string[])
        isInnerUpdate = true
        emits(
          'update:modelValue',
          getNameByCodes(z.deepClone(currentSelectValue.value))
        )
      } else if (codeReg.test(value[0])) {
        userRegionValueMode = 'code'
        currentSelectValue.value = fillCode(value)
        isInnerUpdate = true
        emits('update:modelValue', currentSelectValue.value)
      }
    }
  },
  {
    immediate: true,
  }
)

// picker发生改变回调
const handlePickerChangeEvent = (
  value: string | number | (string | number)[],
  index: number,
  item: any
) => {
  if (userRegionValueMode === 'name') {
    value = getNameByCodes(value as string[])
  }
  isInnerUpdate = true
  emits('change', value as string[], item)
}

// picker确认事件
const handlePickerConfirmEvent = (
  value: string | number | (string | number)[],
  item: any
) => {
  currentSelectValue.value = z.deepClone(value as string[])
  if (userRegionValueMode === 'name') {
    value = getNameByCodes(value as string[])
  }
  emits('update:modelValue', value as string[])
  nextTick(() => {
    emits('confirm', value as string[], item)
  })
  _closePicker()
}

// picker取消事件
const handlePickerCancelEvent = () => {
  _closePicker()
  emits('cancel')
}
</script>

<template>
  <zPicker
    v-model:open="showPicker"
    :model-value="currentSelectValue"
    :data="pickerSelectData"
    label-key="name"
    value-key="code"
    :show-cancel="showCancel"
    :show-confirm="showConfirm"
    :mask="mask"
    :cancel-text="cancelText"
    :cancel-color="cancelColor"
    :confirm-text="confirmText"
    :confirm-color="confirmColor"
    :z-index="zIndex"
    @close="handlePickerCloseEvent"
    @change="handlePickerChangeEvent"
    @confirm="handlePickerConfirmEvent"
    @cancel="handlePickerCancelEvent"
  ></zPicker>
</template>

<style lang="less" scoped></style>
