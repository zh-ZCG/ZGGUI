<!--
 * @Description: z-count-scroll 数字滚动组件
 * @Author: ZCGUI & ui.zcgui.cn & zcgamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import {
  ref,
  onMounted,
  getCurrentInstance,
  computed,
  onBeforeUnmount,
  watch,
  nextTick,
  onUnmounted,
  CSSProperties,
  ExtractPropTypes,
} from 'vue'
import z from '@/ZCGUI/libs/z'
import zMath from '@/ZCGUI/libs/zMath'
import zColor from '@/ZCGUI/libs/zColor'
import { propsHook, PropsTypeHook } from '@/ZCGUI/libs/zHooks'
/**
 * @description: z-count-scroll 数字滚动组件传参
 * @param: value 显示的值
 * @param: duration		动画持续时间，单位ms（默认1500）,建议小于改变value的时间
 * @param: decimal		十进制分割 （ 默认 "." ）
 * @param: color 字体颜色（默认'#1a1a1a'）
 * @param: fontSize		字体大小，单位px（默认16px）
 * @param: separator		千位分隔符（达到1000后分割例如1,000，默认无）
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZCGUI & ui.zcgui.cn & zcgamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  value?: string | number
  duration?: string | number
  decimal?: string
  color?: string
  fontSize?: string | number
  separator?: string
}

interface EmitsType {
  (e: 'end'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  value: '',
  duration: 1500,
  decimal: '.',
  color: '#1a1a1a',
  fontSize: 22,
  separator: '',
})

const emits = defineEmits<EmitsType>()

const countScrollStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}
  if (props.fontSize) style.fontSize = z.addUnit(props.fontSize)

  style.color = props.color
  style.height = style.fontSize
  style.padding = '6rpx 0'
  return style
})

const isEmptyVariableInDefault = <T = any>(
  variable: any,
  defaultValue: any = undefined
): T => {
  return variable === undefined || variable === null ? defaultValue : variable
}

const defaultNumberList = Array.from({ length: 10 }, (_, i) => String(i))

// 每一列的数据
const columns = ref<string[][]>([])
// 每一列激活的数字的索引
const activeIndex = ref<number[]>([])

// 分割符保留字符
const separator = computed<string[]>(() => {
  const { decimal, separator } = props
  const separatorList = [decimal, isEmptyVariableInDefault(separator, '')]
  return separatorList.filter(item => item)
})

function formatNumber(value: string | number, decimal: string) {
  // 将数字转换为字符串
  let valueStr = String(value)

  // 分离整数部分和小数部分
  let parts = valueStr.split(decimal)
  let integerPart = parts[0]
  let decimalPart = parts.length > 1 ? parts[1] : ''

  // 为整数部分添加千分位分隔符
  let formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  // 将整数部分和小数部分重新组合
  let formattedNumber = formattedIntegerPart
  if (decimalPart) {
    formattedNumber += decimal + decimalPart
  }

  return formattedNumber
}

// 生成列数据并设置激活的索引
const _generateColumns = () => {
  const { value } = props
  const valueCopy = formatNumber(value, props.decimal)
  const valueArr = String(valueCopy).split('')

  // 如果是分割符则不填充defaultNumber数据
  const _fillDefaultNumber = (item: string) => {
    if (separator.value.includes(item)) return [item]
    return defaultNumberList
  }
  columns.value = valueArr.map(_fillDefaultNumber)
  nextTick(() => {
    setTimeout(() => {
      activeIndex.value = valueArr.map(item => {
        if (separator.value.includes(item)) return 0
        return Number(item)
      })
    }, 50)
  })
}

watch(() => props.value, _generateColumns, { immediate: true })

type CountScrollColumnStyleType = (activeIndex: number) => CSSProperties

// countScroll列对应的样式
const countScrollColumnStyle = computed<CountScrollColumnStyleType>(() => {
  return (activeIndex: number) => {
    const style: CSSProperties = {}

    if (props.duration) style.transitionDuration = `${Number(props.duration) / 1000}s`
    style.transform = `translateY(-${activeIndex * 10}%)`

    return style
  }
})
</script>

<template>
  <div class="ofh" :style="countScrollStyle">
    <div class="z-count-scroll">
      <div
        v-for="(item, index) in columns"
        :key="index"
        class="column"
        :style="countScrollColumnStyle(activeIndex[index])"
      >
        <div v-for="(listItem, listIndex) in item" :key="listIndex" :class="item">
          {{ listItem }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-count-scroll {
  height: 1em;
  display: flex;
  align-items: flex-start;
  .column {
    height: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform: translateY(0%);
    transition-property: transform;
    transition-timing-function: ease;
    .item {
      line-height: 1;
    }
  }
}
</style>
