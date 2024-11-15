<!--
 * @Description: z-picker 滚动选择器
 * @Author: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import {
  ref,
  getCurrentInstance,
  watch,
  PropType,
  computed,
  nextTick,
} from 'vue'
import zPopup from '../../components/z-popup/z-popup.vue'
import type { CSSProperties } from 'vue'
import z from '../../libs/z'
import zColor from '../../libs/zColor'
import { isArray } from '../../libs/lodash/is-array'
import { isObject } from '../../libs/lodash/is-object'
/**
 * @description: z-picker 滚动选择器
 * @param: modelValue picker绑定的值
 * @param: open 显示picker选项弹框
 * @param: data picker选项的数据
 * @param: labelKey picker选项的数据label属性名
 * @param: valueKey picker选项的数据value属性名
 * @param: childrenKey picker选项的数据children属性名, 在级联选择器模式下生效
 * @param: showCancel 显示取消按钮
 * @param: cancelText 取消按钮的文本
 * @param: cancelColor  取消按钮的字体颜色
 * @param: showConfirm  显示确定按钮
 * @param: confirmText  确定按钮的文本
 * @param: confirmColor  确定按钮的字体颜色
 * @param: borderRadius 操作栏左右两边顶部的弧度
 * @param: mask  显示遮罩
 * @param: zIndex zIndex
 *
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */

type Arrayable<T> = T | T[]

type PickerValueType = string | number | Array<string | number>
type PickerDataType = string | number | object
type PickerDataProps = Arrayable<Array<PickerDataType> | object>
type PickerData = Array<Array<PickerDataItem>>

  interface PickerDataItem {
  label: string | number
  value: string | number
  originalData: any
  children?: Array<PickerDataItem>
}

const PickerModes = ['signle', 'multiple', 'cascade'] as const
type PickerMode = (typeof PickerModes)[number]
interface PropsType {
  modelValue?: PickerValueType
  open?: boolean
  data?: Array<PickerDataProps>
  labelKey?: string
  valueKey?: string
  childrenKey?: string
  showCancel?: boolean
  cancelText?: string
  cancelColor?: string
  showConfirm?: boolean
  confirmText?: string
  confirmColor?: string
  borderRadius?: string | number
  mask?: boolean
  zIndex?: number
}

interface EmitsType {
  (e: 'update:modelValue', value: PickerValueType): void
  (e: 'update:open', value: boolean): void
  (e: 'change', value: PickerValueType, index: number, item: any): void
  (e: 'confirm', value: PickerValueType, item: any): void
  (e: 'cancel'): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  modelValue: '',
  data: () => [],
  labelKey: 'label',
  valueKey: 'value',
  childrenKey: 'children',
  showCancel: true,
  cancelText: '取 消',
  showConfirm: true,
  confirmText: '确 定',
  zIndex: 510,
})

const emits = defineEmits<EmitsType>()

type PickerOperationBtnType = 'cancel' | 'confirm'

type PickerOperationBtnStyle = (type: PickerOperationBtnType) => CSSProperties

// 取消/确认按钮对应的样式
const operationBtnStyle = computed<PickerOperationBtnStyle>(() => {
  return (type: PickerOperationBtnType) => {
    const style: CSSProperties = {}

    if (type === 'cancel') {
      style.color = zColor.getTypeColor(props.cancelColor || 'error')
      style.marginLeft = '30rpx'
      style.marginRight = '30rpx'
    } else if (type === 'confirm') {
      style.color = zColor.getTypeColor(props.confirmColor || 'primary')
      style.marginLeft = '30rpx'
      style.marginRight = '30rpx'
    }
    if (state.value) {
      //开始滚动
      style.opacity = 0.5
    } else {
      //结束滚动
      style.opacity = 1
    }

    return style
  }
})

const resetPickerViewIndex = () => {
  initDefaultPickerIndex()
}

// 显示popup弹框
const openPopup = ref(false)
const showPicker = ref(true)
// #ifdef MP-ALIPAY
showPicker.value = false
// #endif
watch(
  () => props.open,
  (value) => {
    openPopup.value = value
    // #ifdef MP-ALIPAY
    if (value) {
      setTimeout(() => {
        nextTick(() => {
          showPicker.value = value
        })
      }, 350)
    }
    // #endif
  }
)
const _closePopup = () => {
  // #ifdef MP-ALIPAY
  showPicker.value = false
  // #endif
  emits('update:open', false)
}
// 关闭popup弹框
const closePopupEvent = () => {
  _closePopup()
  _generatePickerViewData(props.modelValue)
  emits('close')
}

// picker选择器类型
let pickerMode: PickerMode = 'signle'

// 生成指定格式的数据
const _generateData = (
  data: PickerDataType
): Pick<PickerDataItem, 'label' | 'value' | 'originalData'> => {
  if (isObject(data)) {
    const originalData = z.deepClone(data)
    if (Object.prototype.hasOwnProperty.call(originalData, props.childrenKey)) {
      delete originalData[props.childrenKey]
    }
    return {
      label: data[props.labelKey],
      value: data[props.valueKey],
      originalData,
    }
  } else {
    return {
      label: data as string | number,
      value: data as string | number,
      originalData: data,
    }
  }
}

// 更新/生成级联选择器的数据
const _generateOrUpdateCascadeData = (
  data: any[],
  generateIndex = 1,
  defaultValue: Array<string | number> = []
) => {
  // 判断生成的的级联数据是否已经有数据，如果有数据则更新，否则生成
  if (pickerData.value.length < generateIndex) {
    pickerData.value.push(
      ...Array.from(
        { length: generateIndex - pickerData.value.length },
        () => []
      )
    )
  }

  pickerData.value[generateIndex - 1] = [
    ...data.map((item) => _generateData(item)),
  ]
  // 判断从第几个子级开始生成级联数据
  let childrenIndex = 0
  if (defaultValue.length) {
    childrenIndex = (
      pickerData.value[generateIndex - 1] as PickerDataType[]
    ).findIndex((item: any) => item.value === defaultValue[generateIndex - 1])
    childrenIndex = ~childrenIndex ? childrenIndex : 0
  }
  if (
    data[childrenIndex] &&
    Object.prototype.hasOwnProperty.call(data[childrenIndex], props.childrenKey)
  ) {
    _generateOrUpdateCascadeData(
      data[childrenIndex][props.childrenKey] as PickerDataItem[],
      generateIndex + 1,
      defaultValue
    )
  }
}

// picker选择器的数据
const pickerData = ref<PickerData>([])
// 当前选中picker-view的索引
const currentPickerIndex = ref<Array<number>>([])
// 初始化选中的默认Index
const initDefaultPickerIndex = () => {
  let indexValue: number[] = []
  // 如果没有设置默认值，则默认选中第一项
  if (
    props.modelValue === undefined ||
    (!props.modelValue && ['multiple', 'cascade'].includes(pickerMode)) ||
    (isArray(props.modelValue) &&!(props.modelValue as Array<string|number>).length)
  ) {
    indexValue = Array.from({ length: pickerData.value.length }, () => 0)
  } else {
    if (isArray(props.modelValue)) {
      indexValue = pickerData.value.map((item, index) => {
        let pickerIndex = 0
        if (!(props.modelValue as (string | number)[])[index]) pickerIndex = 0
        else {
          pickerIndex = (item as PickerDataType[]).findIndex((childItem) => {
            return (
              (childItem as any).value ===
              (props.modelValue as (string | number)[])[index]
            )
          })
        }
        return ~pickerIndex ? pickerIndex : 0
      })
    } else {
      indexValue = pickerData.value.map((_, k: number) => {
          const index = pickerData.value[k].findIndex(
            (item) => item.value === props.modelValue
          )
          return index === -1 ? 0 : index
        })
    }
  }
  currentPickerIndex.value = indexValue
}
// 处理用户传递的数据
const splitUserPickerData = () => {
  const { data } = props
  if (!data) return
  // 判断用户是否有传递数据，并且数据格式是否正确
  if (!isArray(data)) {
    z.error('zpicker选择器数据不正确，请传递数组格式的数据')
  }

  if (data.length === 0) return

  // 根据用户传递的数据来判断是什么类型的选择器
  if (isArray(data[0])) {
    // 多选选择器
    pickerMode = 'multiple'
    pickerData.value = (data as PickerDataType[][]).reduce(
      (prev: PickerData, cur: Array<PickerDataType>) => {
        prev.push(cur.map((item) => _generateData(item)))
        return prev
      },
      []
    )
  } else if (
    !isArray(data[0]) &&
    isObject(data[0]) &&
    Object.prototype.hasOwnProperty.call(data[0], props.childrenKey)
  ) {
    // 级联选择器
    pickerMode = 'cascade'
    _generateOrUpdateCascadeData(
      data as PickerDataItem[],
      1,
      props.modelValue as Array<string | number>
    )
  } else {
    // 单列选择器
    pickerMode = 'signle'
    pickerData.value = [(data as PickerData).map((item) => _generateData(item))]
  }
  // console.log(JSON.stringify(pickerData.value))
  nextTick(() => {
    initDefaultPickerIndex()
  })
}
watch(
  () => props.data,
  () => {
    splitUserPickerData()
  },
  {
    immediate: true,
  }
)

// 获取当前选中的值
const _getCurrentPickerValue = (): PickerValueType => {
  if (pickerMode === 'signle' && !isArray((props.data as any[])[0])) {
    return pickerData.value[0][currentPickerIndex.value[0]].value
  } else {
    const pickerIndex = z.deepClone(currentPickerIndex.value)
    pickerIndex.splice(pickerData.value.length)
    return pickerIndex.map((item, index) => {
      return pickerData.value[index][item]?.value
        ? pickerData.value[index][item]?.value
        : 0
    })
  }
}

// 根据用户选中的索引获取当前用户传入的数据
const _getCurrentPickerOriginData = (): any => {
  if (pickerMode === 'signle' && !isArray((props.data as any[])[0])) {
    return (pickerData.value as any)[0][currentPickerIndex.value[0]]
      .originalData
  } else {
    const pickerIndex = z.deepClone(currentPickerIndex.value)
    pickerIndex.splice(pickerData.value.length)
    return pickerIndex.map((item, index) => {
      return pickerData.value[index][item]?.originalData
        ? pickerData.value[index][item]?.originalData
        : undefined
    })
  }
}

// 生成picker-view的数据
const _generatePickerViewData = (val: any) => {
  // 如果是级联选择器，对应的级联数据也要更新
  if (pickerMode === 'cascade') {
    _generateOrUpdateCascadeData(
      props.data as PickerDataItem[],
      1,
      val as Array<string | number>
    )
  }
  nextTick(() => {
    initDefaultPickerIndex()
  })
}

// 标记是否内部更新
let isInnerUpdate = false
watch(
  () => props.modelValue,
  (val) => {
    if (isInnerUpdate) {
      isInnerUpdate = false
      return
    }
    _generatePickerViewData(val)
  },
  {
    deep: true,
  }
)

// picker-view选择发生改变事件
let changeTimer: ReturnType<typeof setTimeout> | null = null
let continuousChangeStatus = false
const pickerViewChangeEvent = (e: any) => {
  if (continuousChangeStatus) {
    return
  }
  changeTimer = setTimeout(() => {
    continuousChangeStatus = false
    changeTimer && clearTimeout(changeTimer)
    changeTimer = null
  }, 300)
  continuousChangeStatus = true
  // 比较上一次的值，判断是那一列发生了改变
  let changePickerColumnIndex = currentPickerIndex.value.findIndex(
    (item, index) => item !== e.detail.value[index]
  )
  changePickerColumnIndex = ~changePickerColumnIndex
    ? changePickerColumnIndex
    : 0
  currentPickerIndex.value = e.detail.value

  // 如果是级联选择器，对应的列有children的值，则需要更新后面的数据，并且重置后面选中的索引
  if (pickerMode === 'cascade') {
    let data: any[] = props.data as any[]
    for (let i = 0; i < changePickerColumnIndex; i++) {
      data = data[currentPickerIndex.value[i]][props.childrenKey]
    }
    const pickerIndex = currentPickerIndex.value[changePickerColumnIndex]
    pickerData.value.splice(changePickerColumnIndex + 1)
    if (
      data[pickerIndex] &&
      Object.prototype.hasOwnProperty.call(data[pickerIndex], props.childrenKey)
    ) {
      _generateOrUpdateCascadeData(
        data[pickerIndex][props.childrenKey] as PickerDataItem[],
        changePickerColumnIndex + 2
      )
      currentPickerIndex.value = pickerData.value.map((item, index) => {
        return index <= changePickerColumnIndex
          ? currentPickerIndex.value[index]
          : 0
      })
    }
  }

  isInnerUpdate = true
  const value = _getCurrentPickerValue()
  const originData = _getCurrentPickerOriginData()
  emits('change', value, changePickerColumnIndex, originData)
}

// 重置指定位置的数据
const resetPickerIndexWithPosition = (start: number, end?: number) => {
  currentPickerIndex.value = currentPickerIndex.value.map((item, index) => {
    return index >= start && (!end || index <= end) ? 0 : item
  })
}

// 点击确认按钮
const confirmEvent = () => {
  const value = _getCurrentPickerValue()
  const originData = _getCurrentPickerOriginData()
  isInnerUpdate = true
  emits('update:modelValue', value)
  nextTick(() => {
    emits('confirm', value, originData)
  })

  _closePopup()
}

// 点击取消按钮
const cancelEvent = () => {
  _generatePickerViewData(props.modelValue)
  emits('cancel')
  _closePopup()
}

defineExpose({
  /**
   * 重置选择器的值
   */
  resetPickerViewIndex,
  /**
   * 重置指定位置选择器的值
   */
  resetPickerIndexWithPosition,
})

/**
 * 开始滚动和结束滚动事件
 */
const state = ref(false)
function pickstart() {
  state.value = true
}
function pickend() {
  state.value = false
}
</script>

<template>
  <zPopup
    v-model="openPopup"
    :overlay="mask"
    :zIndex="zIndex"
    @close="closePopupEvent"
    :otherStyle="
      borderRadius
        ? {
            'border-top-left-radius': z.addUnit(borderRadius),
            'border-top-right-radius': z.addUnit(borderRadius),
          }
        : {}
    "
  >
    <div class="pr z-picker">
      <!-- 操作按钮 -->
      <div class="pr df aic jcsb operation" :class="showCancel ? 'jcfe' : ''">
        <div
          v-if="showCancel"
          :style="operationBtnStyle('cancel')"
          @tap.stop="state ? 1 : cancelEvent()"
        >
          <slot name="cancel">
            {{ props.cancelText }}
          </slot>
        </div>
        <div
          :style="operationBtnStyle('confirm')"
          @tap.stop="state ? 1 : confirmEvent()"
        >
          <slot name="confirm">
            {{ props.confirmText }}
          </slot>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="pr content">
        <picker-view
          v-if="showPicker"
          class="picker-view"
          :value="currentPickerIndex"
          @change="pickerViewChangeEvent"
          @pickstart="pickstart"
          @pickend="pickend"
        >
          <picker-view-column
            v-for="(item, index) in pickerData"
            :key="index"
            class="bgw"
          >
            <div
              v-for="(dItem, dIndex) in item"
              :key="dIndex"
              class="df jcc aic"
            >
              <div class="tac" style="height: fit-content; width: 100%">
                {{ dItem['label'] }}
              </div>
            </div>
          </picker-view-column>
        </picker-view>
      </div>
    </div>
  </zPopup>
</template>

<style lang="less" scoped>
.z-picker {
  width: 100%;
  border-radius: 30rpx 30rpx 0rpx 0rpx;
  .operation {
    width: 100%;
    padding: 30rpx 0rpx;
    font-size: 30rpx;
  }
  .content {
    width: 100%;
    height: 440rpx;
    padding: 0rpx;
    font-size: 34rpx;
    .picker-view {
      flex-grow: 1;
      height: 100%;
    }
  }
}
</style>
