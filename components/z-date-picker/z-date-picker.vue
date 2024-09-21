<!--
 * @Description: z-date-picker 时间选择组件
 * @Author: ZCGUI & ui.zcgui.cn & zcgamazing@163.com
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
import z from '@/ZCGUI/libs/z'
import type { Dayjs } from '@/ZCGUI/libs/dayjs'
import type Picker from '@/ZCGUI/components/z-picker/z-picker.vue'
import dayjs from '@/ZCGUI/libs/dayjs'
import zPicker from '@/ZCGUI/components/z-picker/z-picker.vue'
import { propsHook, PropsTypeHook } from '@/ZCGUI/libs/zHooks'
/**
 * @description: z-date-picker 时间选择组件传参
 * @param: modelValue 日期时间选择器绑定的值，支持的格式YYYY/MM/DD HH:mm:ss YYYY-MM-DD HH:mm:ss
 * @param: open		 显示隐藏日期时间选择器
 * @param: mode	日期时间选择器类型
 * @param: minTime  最小可选时间，格式为 YYYY/MM/DD HH:mm:ss
 * @param: maxTime  最大可选时间，格式为 YYYY/MM/DD HH:mm:ss
 * @param: initCurrentDateTime  是否初始化空值为当前时间
 * @param: format 日期时间格式化
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
 * @tutorial: ZCGUI & ui.zcgui.cn & zcgamazing@163.com
 * @example:
 */

const innerDefaultDateTimeFormat = 'YYYY/MM/DD HH:mm:ss'

const dateTimePickerModes = [
  'year',
  'yearmonth',
  'date',
  'datetime',
  'time',
  'datetimeNoSecond',
  'timeNoSecond',
] as const

interface PropsType extends PropsTypeHook {
  modelValue?: string
  open?: boolean
  mode?:
    | 'year'
    | 'yearmonth'
    | 'date'
    | 'datetime'
    | 'time'
    | 'datetimeNoSecond'
    | 'timeNoSecond'
  minTime?: string
  maxTime?: string
  initCurrentDateTime?: boolean
  format?: string
  showCancel?: boolean
  cancelText?: string
  cancelColor?: string
  showConfirm?: boolean
  confirmText?: string
  confirmColor?: string
  mask?: boolean
  zIndex?: number
}

interface EmitsType {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
  (e: 'update:open', value: boolean): void
  (e: 'confirm', value: string): void
  (e: 'cancel'): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  modelValue: '',
  mode: 'date',
  showCancel: true,
  showConfirm: true,
  initCurrentDateTime: true,
  zIndex: 550,
})

type PickerColumn = { label: string; value: string | number }
type PickerData = Array<Array<PickerColumn>>

interface TimeOptions extends Object {
  year: number
  month: number
  date: number
  hour: number
  minute: number
  second: number
}

// 当前时间
const nowDayjs = dayjs()

const MIN_MAX_VALUE = (minValue: number, maxValue: number, currentValue: number) =>
  Math.min(Math.max(minValue, currentValue), maxValue)

// 生成指定范围内的数据并放入数组中
const generateRangeData = (start: number, end: number): Array<number> => {
  end = end < start ? start : end
  return Array.from({ length: end - start + 1 }).map((_, index) => {
    return start + index
  })
}
// 年列数据
const yearColumnData = ref<Array<PickerColumn>>([])
// 月列数据
const monthColumnData = ref<Array<PickerColumn>>([])
// 日列数据
const dayColumnData = ref<Array<PickerColumn>>([])
// 时列数据
const hourColumnData = ref<Array<PickerColumn>>([])
// 分列数据
const minuteColumnData = ref<Array<PickerColumn>>([])
// 秒列数据
const secondColumnData = ref<Array<PickerColumn>>([])

// 填充日期时间
const fillDateTime = (value: string, format?: string): Dayjs => {
  if (!format) format = innerDefaultDateTimeFormat
  let dateTime = ''
  if (props.mode === 'time' || props.mode === 'timeNoSecond') {
    const timeReg = /^(\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?$/
    dateTime = value.replace(timeReg, (_, hour, minute, second) => {
      return `1970/01/01 ${hour}:${minute || '00'}:${second || '00'}`
    })
  } else {
    value = dayjs(value, format).format(innerDefaultDateTimeFormat)
    const dateTimeReg =
      /^(\d{4})(?:[-/](\d{1,2}))?(?:[-/](\d{1,2}))?(?:\s?(\d{1,2}))?(?::(\d{1,2}))?(?::(\d{1,2}))?$/
    dateTime = value.replace(
      dateTimeReg,
      (_, year, month, day, hour, minute, second) => {
        return `${year}/${month || '01'}/${day || '01'} ${hour || '00'}:${
          minute || '00'
        }:${second || '00'}`
      }
    )
  }

  return dayjs(dateTime, format)
}

const minTimeDayjs = computed<Dayjs>(() => {
  let time = `${nowDayjs.year() - 10}/01/01 00:00:00`
  if (props.minTime) time = props.minTime
  return fillDateTime(time)
})
const maxTimeDayjs = computed<Dayjs>(() => {
  let time = `${nowDayjs.year() + 10}/12/31 23:59:59`
  if (props.maxTime) time = props.maxTime
  return fillDateTime(time)
})

// 获取日期时间的最大/小值
const getTimeMaxMinValue = (
  currentValue: TimeOptions | Dayjs,
  maxMinValue: TimeOptions | Dayjs,
  defaultValue: TimeOptions
): TimeOptions => {
  const result: TimeOptions = { ...defaultValue }
  let currentYear = 0
  let currentMonth = 0
  let currentDate = 0
  let currentHour = 0
  let currentMinute = 0
  let maxMinYear = 0
  let maxMinMonth = 0
  let maxMinDate = 0
  let maxMinHour = 0
  let maxMinMinute = 0
  let maxMinSecond = 0

  if (currentValue.toString() === '[object Object]') {
    ;({
      year: currentYear,
      month: currentMonth,
      date: currentDate,
      hour: currentHour,
      minute: currentMinute,
    } = currentValue as TimeOptions)
  } else {
    currentYear = (currentValue as Dayjs).year()
    currentMonth = (currentValue as Dayjs).month()
    currentDate = (currentValue as Dayjs).date()
    currentHour = (currentValue as Dayjs).hour()
    currentMinute = (currentValue as Dayjs).minute()
  }

  if (maxMinValue.toString() === '[object Object]') {
    ;({
      year: maxMinYear,
      month: maxMinMonth,
      date: maxMinDate,
      hour: maxMinHour,
      minute: maxMinMinute,
      second: maxMinSecond,
    } = maxMinValue as TimeOptions)
  } else {
    maxMinYear = (maxMinValue as Dayjs).year()
    maxMinMonth = (maxMinValue as Dayjs).month()
    maxMinDate = (maxMinValue as Dayjs).date()
    maxMinHour = (maxMinValue as Dayjs).hour()
    maxMinMinute = (maxMinValue as Dayjs).minute()
    maxMinSecond = (maxMinValue as Dayjs).second()
  }

  if (currentYear === maxMinYear) {
    result.month = maxMinMonth
    if (currentMonth === maxMinMonth) {
      result.date = maxMinDate
      if (currentDate === maxMinDate) {
        result.hour = maxMinHour
        if (currentHour === maxMinHour) {
          result.minute = maxMinMinute
          if (currentMinute === maxMinMinute) {
            result.second = maxMinSecond
          }
        }
      }
    }
  }

  return result
}

// 生成/更新picker数据
const generatePickerData = (value: Dayjs) => {
  const sameMinYear = value.year() === minTimeDayjs.value.year()
  const sameMaxYear = value.year() === maxTimeDayjs.value.year()
  const sameMinMonth = value.month() === minTimeDayjs.value.month()
  const sameMaxMonth = value.month() === maxTimeDayjs.value.month()
  const sameMinDate = value.date() === minTimeDayjs.value.date()
  const sameMaxDate = value.date() === maxTimeDayjs.value.date()
  const sameMinHour = value.hour() === minTimeDayjs.value.hour()
  const sameMaxHour = value.hour() === maxTimeDayjs.value.hour()
  const sameMinMinute = value.minute() === minTimeDayjs.value.minute()
  const sameMaxMinute = value.minute() === maxTimeDayjs.value.minute()

  // 判断是否有设置开始、结束年份，如果没有则使用前后10年
  const minYear = minTimeDayjs.value.year()
  const maxYear = maxTimeDayjs.value.year()
  const minMonth = sameMinYear ? minTimeDayjs.value.month() + 1 : 1
  const maxMonth = sameMaxYear ? maxTimeDayjs.value.month() + 1 : 12
  const minDay = sameMinYear && sameMinMonth ? minTimeDayjs.value.date() : 1
  const maxDay =
    sameMaxYear && sameMaxMonth ? maxTimeDayjs.value.date() : value.daysInMonth()
  // 判断是否有设置开始、结束时间，如果没有则使用00:00:00和23:59:59
  const minHour =
    (sameMinYear && sameMinMonth && sameMinDate) ||
    props.mode === 'time' ||
    props.mode === 'timeNoSecond'
      ? minTimeDayjs.value.hour()
      : 0
  const maxHour =
    (sameMaxYear && sameMaxMonth && sameMaxDate) ||
    props.mode === 'time' ||
    props.mode === 'timeNoSecond'
      ? maxTimeDayjs.value.hour()
      : 23
  const minMinute =
    ((sameMinYear && sameMinMonth && sameMinDate) ||
      props.mode === 'time' ||
      props.mode === 'timeNoSecond') &&
    sameMinHour
      ? minTimeDayjs.value.minute()
      : 0
  const maxMinute =
    ((sameMaxYear && sameMaxMonth && sameMaxDate) ||
      props.mode === 'time' ||
      props.mode === 'timeNoSecond') &&
    sameMaxHour
      ? maxTimeDayjs.value.minute()
      : 59
  const minSecond =
    ((sameMinYear && sameMinMonth && sameMinDate) || props.mode === 'time') &&
    sameMinHour &&
    sameMinMinute
      ? minTimeDayjs.value.second()
      : 0
  const maxSecond =
    ((sameMaxYear && sameMaxMonth && sameMaxDate) || props.mode === 'time') &&
    sameMaxHour &&
    sameMaxMinute
      ? maxTimeDayjs.value.second()
      : 59
  // if (props.mode === 'time') {
  //   if (props.minTime) {
  //     const minTimeValue = getTimeMaxMinValue(value, minTimeDayjs.value, {
  //       hour: minHour,
  //       minute: minMinute,
  //       second: minSecond,
  //     })
  //     minHour = minTimeValue.hour
  //     minMinute = minTimeValue.minute
  //     minSecond = minTimeValue.second
  //   }
  //   if (props.maxTime) {
  //     const maxTimeValue = getTimeMaxMinValue(value, maxTimeDayjs.value, {
  //       hour: maxHour,
  //       minute: maxMinute,
  //       second: maxSecond,
  //     })
  //     maxHour = maxTimeValue.hour
  //     maxMinute = maxTimeValue.minute
  //     maxSecond = maxTimeValue.second
  //   }
  // }

  // 生成对应的年、月、日、时、分、秒数据
  yearColumnData.value = generateRangeData(minYear, maxYear).map(year => {
    return {
      label: `${year}年`,
      value: year,
    }
  })
  monthColumnData.value = generateRangeData(minMonth, maxMonth).map(month => {
    return {
      label: `${String(month).padStart(2, '0')}月`,
      value: month,
    }
  })
  dayColumnData.value = generateRangeData(minDay, maxDay).map(day => {
    return {
      label: `${String(day).padStart(2, '0')}日`,
      value: day,
    }
  })
  hourColumnData.value = generateRangeData(minHour, maxHour).map(hour => {
    return {
      label: String(hour).padStart(2, '0'),
      value: hour,
    }
  })
  minuteColumnData.value = generateRangeData(minMinute, maxMinute).map(minute => {
    return {
      label: String(minute).padStart(2, '0'),
      value: minute,
    }
  })
  secondColumnData.value = generateRangeData(minSecond, maxSecond).map(second => {
    return {
      label: String(second).padStart(2, '0'),
      value: second,
    }
  })
}

// picker数据
const pickerData = computed<PickerData>(() => {
  const result: PickerData = []
  if (props.mode === 'year') result.push(yearColumnData.value)
  if (props.mode === 'yearmonth')
    result.push(yearColumnData.value, monthColumnData.value)
  if (props.mode === 'date')
    result.push(yearColumnData.value, monthColumnData.value, dayColumnData.value)
  if (props.mode === 'time')
    result.push(hourColumnData.value, minuteColumnData.value, secondColumnData.value)
  if (props.mode === 'datetime')
    result.push(
      yearColumnData.value,
      monthColumnData.value,
      dayColumnData.value,
      hourColumnData.value,
      minuteColumnData.value,
      secondColumnData.value
    )
  if (props.mode === 'datetimeNoSecond')
    result.push(
      yearColumnData.value,
      monthColumnData.value,
      dayColumnData.value,
      hourColumnData.value,
      minuteColumnData.value
    )
  if (props.mode === 'timeNoSecond')
    result.push(hourColumnData.value, minuteColumnData.value)

  return result
})

const emits = defineEmits<EmitsType>()

type DateTimePickerMode = (typeof dateTimePickerModes)[number]

const useHandleMinMaxTime = (minTime: Ref<Dayjs>, maxTime: Ref<Dayjs>) => {
  /* 处理picker发生修改后最小最大值 start */
  const handlePickerChangeMinMaxTime = (
    mode: DateTimePickerMode,
    timeValue: Dayjs
  ): Dayjs => {
    switch (mode) {
      case 'yearmonth':
        return handlePickerChangeMinMaxTimeForYearMonth(timeValue)
      case 'date':
        return handlePickerChangeMinMaxTimeForDate(timeValue)
      case 'datetime':
      case 'datetimeNoSecond':
        return handlePickerChangeMinMaxTimeForDateTime(timeValue, mode === 'datetime')
      case 'time':
      case 'timeNoSecond':
        return handlePickerChangeMinMaxTimeForTime(timeValue, mode === 'time')
      default:
        return timeValue
    }
  }

  // 处理mode为yearmonth时，最小最大值的处理
  const handlePickerChangeMinMaxTimeForYearMonth = (timeValue: Dayjs): Dayjs => {
    if (timeValue.year() === minTime.value.year()) {
      timeValue = timeValue.set(
        'month',
        Math.max(minTime.value.month(), timeValue.month())
      )
    }
    if (timeValue.year() === maxTime.value.year()) {
      timeValue = timeValue.set(
        'month',
        Math.min(maxTime.value.month(), timeValue.month())
      )
    }
    return timeValue
  }
  // 处理mode为date时，最小最大值的处理
  const handlePickerChangeMinMaxTimeForDate = (timeValue: Dayjs): Dayjs => {
    if (timeValue.year() === minTime.value.year()) {
      timeValue = timeValue.set(
        'month',
        Math.max(minTime.value.month(), timeValue.month())
      )
      if (timeValue.month() === minTime.value.month()) {
        timeValue = timeValue.set(
          'date',
          Math.max(minTime.value.date(), timeValue.date())
        )
      }
    }
    if (timeValue.year() === maxTime.value.year()) {
      timeValue = timeValue.set(
        'month',
        Math.min(maxTime.value.month(), timeValue.month())
      )
      if (timeValue.month() === maxTime.value.month()) {
        timeValue = timeValue.set(
          'date',
          Math.min(maxTime.value.date(), timeValue.date())
        )
      }
    }
    return timeValue
  }
  // 处理mode为datetime时，最小最大值的处理
  const handlePickerChangeMinMaxTimeForDateTime = (
    timeValue: Dayjs,
    hasSecond = true
  ): Dayjs => {
    if (timeValue.year() === minTime.value.year()) {
      timeValue = timeValue.set(
        'month',
        Math.max(minTime.value.month(), timeValue.month())
      )
      if (timeValue.month() === minTime.value.month()) {
        timeValue = timeValue.set(
          'date',
          Math.max(minTime.value.date(), timeValue.date())
        )
        if (timeValue.date() === minTime.value.date()) {
          timeValue = timeValue.set(
            'hour',
            Math.max(minTime.value.hour(), timeValue.hour())
          )
          if (timeValue.hour() === minTime.value.hour()) {
            timeValue = timeValue.set(
              'minute',
              Math.max(minTime.value.minute(), timeValue.minute())
            )
            if (hasSecond) {
              if (timeValue.minute() === minTime.value.minute()) {
                timeValue = timeValue.set(
                  'second',
                  Math.max(minTime.value.second(), timeValue.second())
                )
              }
            } else {
              timeValue = timeValue.set('second', 0)
            }
          }
        }
      }
    }
    if (timeValue.year() === maxTime.value.year()) {
      timeValue = timeValue.set(
        'month',
        Math.min(maxTime.value.month(), timeValue.month())
      )
      if (timeValue.month() === maxTime.value.month()) {
        timeValue = timeValue.set(
          'date',
          Math.min(maxTime.value.date(), timeValue.date())
        )
        if (timeValue.date() === maxTime.value.date()) {
          timeValue = timeValue.set(
            'hour',
            Math.min(maxTime.value.hour(), timeValue.hour())
          )
          if (timeValue.hour() === maxTime.value.hour()) {
            timeValue = timeValue.set(
              'minute',
              Math.min(maxTime.value.minute(), timeValue.minute())
            )
            if (hasSecond) {
              if (timeValue.minute() === maxTime.value.minute()) {
                timeValue = timeValue.set(
                  'second',
                  Math.min(maxTime.value.second(), timeValue.second())
                )
              }
            } else {
              timeValue = timeValue.set('second', 0)
            }
          }
        }
      }
    }

    return timeValue
  }
  // 处理mode为time时，最小最大值的处理
  const handlePickerChangeMinMaxTimeForTime = (
    timeValue: Dayjs,
    hasSecond = true
  ): Dayjs => {
    if (timeValue.hour() === minTime.value.hour()) {
      timeValue = timeValue.set(
        'minute',
        Math.max(minTime.value.minute(), timeValue.minute())
      )
      if (timeValue.minute() === minTime.value.minute()) {
        timeValue = timeValue.set(
          'second',
          Math.max(minTime.value.second(), timeValue.second())
        )
      }
    }
    if (timeValue.hour() === maxTime.value.hour()) {
      timeValue = timeValue.set(
        'minute',
        Math.min(maxTime.value.minute(), timeValue.minute())
      )
      if (hasSecond) {
        if (timeValue.minute() === maxTime.value.minute()) {
          timeValue = timeValue.set(
            'second',
            Math.min(maxTime.value.second(), timeValue.second())
          )
        }
      } else {
        timeValue = timeValue.set('second', 0)
      }
    }
    return timeValue
  }
  /* 处理picker发生修改后最小最大值 end */

  return {
    handlePickerChangeMinMaxTime,
  }
}

const { handlePickerChangeMinMaxTime } = useHandleMinMaxTime(
  minTimeDayjs,
  maxTimeDayjs
)

type zPickerInstance = InstanceType<typeof Picker>

const pickerRef = ref<zPickerInstance>()

// 显示/隐藏日期时间选择器
const showPicker = ref(false)
watch(
  () => props.open,
  val => {
    showPicker.value = val
  },
  {
    immediate: true,
  }
)
const _closePicker = () => {
  emits('update:open', false)
}
// picker弹框关闭事件
const handlePickerCloseEvent = () => {
  _closePicker()
  initDateTimePicker(false)
  emits('close')
}

// picker选中的数据
const pickerSelectData = ref<Array<string | number>>([])

// 获取picker选中的值
const getDateTimeValue = (dateTime: Dayjs) => {
  const year = dateTime.year()
  const month = String(dateTime.month() + 1).padStart(2, '0')
  const date = String(dateTime.date()).padStart(2, '0')
  const hour = String(dateTime.hour()).padStart(2, '0')
  const minute = String(dateTime.minute()).padStart(2, '0')
  const second = String(dateTime.second()).padStart(2, '0')
  if (props.mode === 'year') return `${year}`
  if (props.mode === 'yearmonth')
    return dayjs(`${year}/${month}`).format(props.format || 'YYYY/MM')
  if (props.mode === 'date')
    return dayjs(`${year}/${month}/${date}`).format(props.format || 'YYYY/MM/DD')
  if (props.mode === 'datetimeNoSecond')
    return dayjs(`${year}/${month}/${date} ${hour}:${minute}`).format(
      props.format || 'YYYY/MM/DD HH:mm'
    )
  if (props.mode === 'time') return `${hour}:${minute}:${second}`
  if (props.mode === 'timeNoSecond') return `${hour}:${minute}`
  return dayjs(`${year}/${month}/${date} ${hour}:${minute}:${second}`).format(
    props.format || innerDefaultDateTimeFormat
  )
}

// 设置默认picker选中的值
const setDefaultPickerSelectValue = (dateTime: Dayjs) => {
  const year = dateTime.year()
  const month = dateTime.month() + 1
  const date = dateTime.date()
  const hour = dateTime.hour()
  const minute = dateTime.minute()
  const second = dateTime.second()
  if (props.mode === 'year') pickerSelectData.value = [year]
  if (props.mode === 'yearmonth') pickerSelectData.value = [year, month]
  if (props.mode === 'date') pickerSelectData.value = [year, month, date]
  if (props.mode === 'time') pickerSelectData.value = [hour, minute, second]
  if (props.mode === 'datetime')
    pickerSelectData.value = [year, month, date, hour, minute, second]
  if (props.mode === 'timeNoSecond') pickerSelectData.value = [hour, minute]
  if (props.mode === 'datetimeNoSecond')
    pickerSelectData.value = [year, month, date, hour, minute]
}
// 初始化日期时间选择器
const initDateTimePicker = (updateModelValue = true) => {
  let defaultTime = dayjs()
  // 如果有传递默认值，则使用默认值，没有则使用当前时间
  if (props.modelValue) {
    defaultTime = fillDateTime(props.modelValue, props.format)
  }
  // 设置defaultTime最小和最大时间
  if (props.mode !== 'time' && props.mode !== 'timeNoSecond') {
    defaultTime = defaultTime.year(
      MIN_MAX_VALUE(
        minTimeDayjs.value.year(),
        maxTimeDayjs.value.year(),
        defaultTime.year()
      )
    )
    if (defaultTime.year() === minTimeDayjs.value.year()) {
      if (defaultTime.month() < minTimeDayjs.value.month()) {
        defaultTime = defaultTime
          .month(minTimeDayjs.value.month())
          .date(minTimeDayjs.value.date())
          .hour(minTimeDayjs.value.hour())
          .minute(minTimeDayjs.value.minute())
          .second(minTimeDayjs.value.second())
      } else if (defaultTime.month() === minTimeDayjs.value.month()) {
        if (defaultTime.date() < minTimeDayjs.value.date()) {
          defaultTime = defaultTime
            .date(minTimeDayjs.value.date())
            .hour(minTimeDayjs.value.hour())
            .minute(minTimeDayjs.value.minute())
            .second(minTimeDayjs.value.second())
        } else if (defaultTime.date() === minTimeDayjs.value.date()) {
          defaultTime = defaultTime
            .hour(minTimeDayjs.value.hour())
            .minute(minTimeDayjs.value.minute())
            .second(minTimeDayjs.value.second())
          if (defaultTime.hour() === minTimeDayjs.value.hour()) {
            defaultTime = defaultTime.minute(
              Math.max(minTimeDayjs.value.minute(), defaultTime.minute())
            )
            if (defaultTime.minute() === minTimeDayjs.value.minute()) {
              defaultTime = defaultTime.second(
                Math.max(minTimeDayjs.value.second(), defaultTime.second())
              )
            }
          }
        }
      }
    }
    if (defaultTime.year() === maxTimeDayjs.value.year()) {
      if (defaultTime.month() > maxTimeDayjs.value.month()) {
        defaultTime = defaultTime
          .month(maxTimeDayjs.value.month())
          .date(1)
          .hour(0)
          .minute(0)
          .second(0)
      } else if (defaultTime.month() === maxTimeDayjs.value.month()) {
        if (defaultTime.date() > maxTimeDayjs.value.date()) {
          defaultTime = defaultTime
            .date(maxTimeDayjs.value.date())
            .hour(maxTimeDayjs.value.hour())
            .minute(maxTimeDayjs.value.minute())
            .second(maxTimeDayjs.value.second())
        } else if (defaultTime.date() === maxTimeDayjs.value.date()) {
          defaultTime = defaultTime
            .hour(maxTimeDayjs.value.hour())
            .minute(maxTimeDayjs.value.minute())
            .second(maxTimeDayjs.value.second())
          if (defaultTime.hour() === maxTimeDayjs.value.hour()) {
            defaultTime = defaultTime.minute(
              Math.min(maxTimeDayjs.value.minute(), defaultTime.minute())
            )
            if (defaultTime.minute() === maxTimeDayjs.value.minute()) {
              defaultTime = defaultTime.second(0)
            }
          }
        }
      }
    }

    if (props.mode === 'datetimeNoSecond') {
      defaultTime = defaultTime.second(0)
    }
  } else {
    defaultTime = defaultTime.hour(
      MIN_MAX_VALUE(
        minTimeDayjs.value.hour(),
        maxTimeDayjs.value.hour(),
        defaultTime.hour()
      )
    )
    if (defaultTime.hour() === minTimeDayjs.value.hour()) {
      defaultTime = defaultTime.minute(
        Math.max(minTimeDayjs.value.minute(), defaultTime.minute())
      )
      if (defaultTime.minute() === minTimeDayjs.value.minute()) {
        defaultTime = defaultTime.second(
          Math.max(minTimeDayjs.value.second(), defaultTime.second())
        )
      }
    }
    if (defaultTime.hour() === maxTimeDayjs.value.hour()) {
      defaultTime = defaultTime.minute(
        Math.min(maxTimeDayjs.value.minute(), defaultTime.minute())
      )
      if (defaultTime.minute() === maxTimeDayjs.value.minute()) {
        defaultTime = defaultTime.second(0)
      }
    }

    if (props.mode === 'timeNoSecond') {
      defaultTime = defaultTime.second(0)
    }
  }
  generatePickerData(defaultTime)

  // 设置默认picker选中的值
  setDefaultPickerSelectValue(defaultTime)

  // 更新用户modelValue
  if (updateModelValue) {
    emits('update:modelValue', getDateTimeValue(defaultTime))
  }
}

// 如果最小值/最大值发生改变，则重新初始化日期时间选择器
watch(
  () => [props.minTime, props.maxTime, props.modelValue],
  () => {
    initDateTimePicker(false)
  },
  {
    immediate: true,
  }
)

// 获取修改填充后的日期时间Dayjs对象
const getFillDateTimeDayjs = (value: (string | number)[]): Dayjs => {
  let dateTimeValue = ''
  if (props.mode === 'year') {
    dateTimeValue = `${value[0]}`
  }
  if (props.mode === 'yearmonth') {
    dateTimeValue = `${value[0]}/${value[1]}`
  }
  if (props.mode === 'date') {
    const year = Number(value[0])
    const month = Number(value[1])
    const date = Math.min(
      dayjs()
        .year(year)
        .month(month - 1)
        .daysInMonth(),
      Number(value[2])
    )
    dateTimeValue = `${value[0]}/${month}/${date}`
  }
  if (props.mode === 'time' || props.mode === 'timeNoSecond') {
    dateTimeValue = `${value[0]}:${value[1]}:${
      props.mode === 'time' ? value[2] : '00'
    }`
  }
  if (props.mode === 'datetime' || props.mode === 'datetimeNoSecond') {
    const year = Number(value[0])
    const month = Number(value[1])
    const date = Math.min(
      dayjs()
        .year(year)
        .month(month - 1)
        .daysInMonth(),
      Number(value[2])
    )
    dateTimeValue = `${value[0]}/${month}/${date} ${value[3]}:${value[4]}:${
      props.mode === 'datetime' ? value[5] : '00'
    }`
  }
  return fillDateTime(dateTimeValue)
}

// picker选择发生改变回调
const pickerValueChangeEvent = (value: string | number | (string | number)[]) => {
  let timeValue = getFillDateTimeDayjs(value as (string | number)[])
  // 处理最小/最大值
  timeValue = handlePickerChangeMinMaxTime(props.mode, timeValue)

  // 回填处理后的数据
  if (props.mode === 'year') {
    pickerSelectData.value = [timeValue.year()]
  }
  if (props.mode === 'yearmonth') {
    pickerSelectData.value = [timeValue.year(), timeValue.month() + 1]
  }
  if (props.mode === 'date') {
    pickerSelectData.value = [
      timeValue.year(),
      timeValue.month() + 1,
      timeValue.date(),
    ]
  }
  if (props.mode === 'time') {
    pickerSelectData.value = [
      timeValue.hour(),
      timeValue.minute(),
      timeValue.second(),
    ]
  }
  if (props.mode === 'datetime') {
    pickerSelectData.value = [
      timeValue.year(),
      timeValue.month() + 1,
      timeValue.date(),
      timeValue.hour(),
      timeValue.minute(),
      timeValue.second(),
    ]
  }
  if (props.mode === 'timeNoSecond') {
    pickerSelectData.value = [timeValue.hour(), timeValue.minute()]
  }
  if (props.mode === 'datetimeNoSecond') {
    pickerSelectData.value = [
      timeValue.year(),
      timeValue.month() + 1,
      timeValue.date(),
      timeValue.hour(),
      timeValue.minute(),
    ]
  }

  // 重新生成数据
  nextTick(() => {
    generatePickerData(timeValue)
  })

  const dateTimeValue = getDateTimeValue(timeValue)
  // emits('update:modelValue', dateTimeValue)
  emits('change', dateTimeValue)
}

// 确认日期时间回调
const handlePickerConfirmEvent = (value: string | number | (string | number)[]) => {
  const timeValue = getFillDateTimeDayjs(value as (string | number)[])
  const dateTimeValue = getDateTimeValue(timeValue)
  emits('update:modelValue', dateTimeValue)
  nextTick(() => {
    emits('confirm', dateTimeValue)
  })
  _closePicker()
}

// 取消日期时间回调
const handlePickerCancelEvent = () => {
  initDateTimePicker(false)
  emits('cancel')
  _closePicker()
}
</script>

<template>
  <zPicker
    ref="pickerRef"
    v-model:open="showPicker"
    :model-value="pickerSelectData"
    :data="pickerData"
    :show-cancel="showCancel"
    :show-confirm="showConfirm"
    :mask="mask"
    :cancel-text="cancelText"
    :cancel-color="cancelColor"
    :confirm-text="confirmText"
    :confirm-color="confirmColor"
    :z-index="zIndex"
    @change="pickerValueChangeEvent"
    @confirm="handlePickerConfirmEvent"
    @cancel="handlePickerCancelEvent"
    @close="handlePickerCloseEvent"
  ></zPicker>
</template>

<style lang="less" scoped></style>
