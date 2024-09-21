<!--
 * @Description: z-calendar 日历组件
 * @Author: ZCGUI & ui.zcgui.cn & zcgamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import {
  ref,
  onMounted,
  getCurrentInstance,
  reactive,
  computed,
  onBeforeUnmount,
  watch,
  nextTick,
  CSSProperties,
  PropType,
} from 'vue'
import z from '@/ZCGUI/libs/z'
import { MAX_SAFE_INTEGER } from '@/ZCGUI/libs/zMath'
import { isNumber } from '@/ZCGUI/libs/lodash/is-number'
import { isString } from '@vue/shared'
import zIcon from '@/ZCGUI/components/z-icon/z-icon.vue'
import type { Dayjs } from '@/ZCGUI/libs/dayjs'
import dayjs from '@/ZCGUI/libs/dayjs'
import { solar2lunar } from '@/ZCGUI/components/z-calendar/lunar-calendar'
import { propsHook, PropsTypeHook } from '@/ZCGUI/libs/zHooks'
/**
 * @description: z-calendar 日历传参
 * @param	modelValue	日期绑定的值，支持的格式为 YYYY/MM/DD 2023/01/01 或者 YYYY-MM-DD 2023-01-01 [2023/01/01, 2023/01/02] [2023-01-01, 2023-01-02]
 * @param	activeBgColor		选中的背景颜色
 * @param	activeTextColor	 选中的文字颜色
 * @param	rangeBgColor			在日期范围内的背景颜色
 * @param	rangeTextColor			在日期范围内的文字颜色
 * @param	mode		 日期模式
 * @param	minDate				日期最小值，支持的格式为 YYYY/MM/DD 或者 YYYY-MM-DD，如果没有设置最小值则以当前日期作为最小值
 * @param	maxDate				日期最大值，支持的格式为 YYYY/MM/DD 或者 YYYY-MM-DD，如果没有设置最大值则以当前年份最后一天作为最大值
 * @param allowChangeYear		是否允许切换年份
 * @param	allowChangeMonth		是否允许切换月份
 * @param	showLunar			是否显示农历
 * @param rangeStartDesc			当 mode 为 range 时，开始时间的提示信息
 * @param	rangeEndDesc			当 mode 为 range 时，结束时间的提示信息
 *
 * @event change-year 		年份切换事件
 * @event change-month 		月份切换事件
 *
 * @tutorial: ZCGUI & ui.zcgui.cn & zcgamazing@163.com
 * @example:
 */

type Arrayable<T> = T | T[]
type CalendarModelValueType = Arrayable<string>

const calendarModes = ['date', 'multi', 'range']

interface PropsType extends PropsTypeHook {
  modelValue?: string | Array<string>
  activeBgColor?: string
  activeTextColor?: string
  rangeBgColor?: string
  rangeTextColor?: string
  mode?: 'date' | 'multi' | 'range'
  minDate?: string
  maxDate?: string
  allowChangeYear?: boolean
  allowChangeMonth?: boolean
  showLunar?: boolean
  rangeStartDesc?: string
  rangeEndDesc?: string
}

interface EmitsType {
  (e: 'update:modelValue', value: CalendarModelValueType): boolean
  (e: 'change', value: CalendarModelValueType): boolean
  (e: 'changeYear', year: number): boolean
  (e: 'changeMonth', month: number): boolean
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  modelValue: '',
  mode: 'date',
  activeBgColor: '#409eff',
  activeTextColor: '#fff',
  allowChangeYear: true,
  allowChangeMonth: true,
  rangeStartDesc: '开始',
  rangeEndDesc: '结束',
})

const emits = defineEmits<EmitsType>()

type CalendarItemDateStatus = 'normal' | 'active' | 'range' | 'disabled'
interface CalendarItem {
  /**
   * @description 日期
   */
  date: number
  /**
   * @description 日期状态
   */
  status: CalendarItemDateStatus
  /**
   * @description 日期描述，可以存放农历、开始结束提示信息
   */
  desc?: string
}

interface CalendarMonthData {
  /**
   * @description 月份
   */
  month: number
  /**
   * @description 月份的数据
   */
  data: CalendarItem[]
}

type CalendarData = CalendarMonthData[]

interface DateData {
  year: number
  month: number
  date: number
}

type CalendarSelectDataMap = Map<number, number[]>

type CalendarRangeSelectData = {
  start?: Dayjs
  end?: Dayjs
}

// 默认的日期格式
const DEFAULT_DATE_FORMAT = 'YYYY/MM/DD'

// 格式化日期数据，将-替换为/
const formatDate = <T extends CalendarModelValueType>(date: T): T => {
  if (!date || !date.length) return date
  if (isString(date)) {
    return date.replace(/-/g, '/') as T
  }
  return date.map(item => item.replace(/-/g, '/')) as T
}

// 填充0
const fillDateZero = (date: number) => String(date).padStart(2, '0')

// 根据年月日生成日期字符串
const generateDateStr = (date: DateData) =>
  `${date.year}/${fillDateZero(date.month)}/${fillDateZero(date.date)}`

// 重新加载月份swiper
const reloadMonthSwiper = ref<boolean>(false)
// 日历的数据
const calendarData = ref<CalendarData>([])

// 星期提示文字
const weekText = ref<string[]>(['日', '一', '二', '三', '四', '五', '六'])

// 最小年月日
const minDate = reactive<DateData>({
  year: 0,
  month: 0,
  date: 0,
})
// 最大年月日
const maxDate = reactive<DateData>({
  year: 0,
  month: 0,
  date: 0,
})

// 当前年月日
const currentDate = reactive<DateData>({
  year: 0,
  month: 0,
  date: 0,
})

// 当前选中的年月日
const currentSelectedDate = reactive<DateData>({
  year: 0,
  month: 0,
  date: 0,
})

// 日期范围内数据
const rangeDate = reactive<CalendarRangeSelectData>({})

// 更新modelValue
// 标记是否需要重新渲染日历
let needRenderCalendar = false
const updateModelValue = (changeEmit = true) => {
  const { modelValue, mode } = props
  const formatModelValue = formatDate(modelValue)
  let value: CalendarModelValueType = ''
  // 根据不同的模式，返回不同的值
  switch (mode) {
    case 'date':
      // 如果当前选中的日期不为空，则先将之前选中日期的选中状态修改为normal
      if (modelValue) {
        const dateDayjs = dayjs(formatModelValue as string, DEFAULT_DATE_FORMAT)
        updateDateStatus(dateDayjs, 'normal')
      }
      // 设置当前选中日期为激活状态
      updateDateStatus(currentSelectedDate, 'active')
      value = generateDateStr(currentSelectedDate)
      break
    case 'multi':
      // 判断当前选中的日期是否已经存在于modelValue中，如果存在，则将其从modelValue中移除
      // eslint-disable-next-line no-case-declarations
      const activeIndex = (formatModelValue as string[]).indexOf(
        generateDateStr(currentSelectedDate)
      )
      if (formatModelValue.length && activeIndex !== -1) {
        updateDateStatus(currentSelectedDate, 'normal')
        ;(formatModelValue as string[]).splice(activeIndex, 1)
        value = [...(formatModelValue as string[])]
      } else {
        updateDateStatus(currentSelectedDate, 'active')
        value = [
          ...(formatModelValue as string[]),
          generateDateStr(currentSelectedDate),
        ]
      }
      break
    case 'range':
      // 如果已选的值为空或者长度为2，则将当前选中的日期设置为开始日期
      if (
        !formatModelValue ||
        formatModelValue.length === 0 ||
        formatModelValue.length === 2
      ) {
        if (formatModelValue.length === 2) {
          // 清空原来设置的时间
          const startDateDayjs = dayjs(
            (formatModelValue as string[])[0],
            DEFAULT_DATE_FORMAT
          )
          const endDateDayjs = dayjs(
            (formatModelValue as string[])[1],
            DEFAULT_DATE_FORMAT
          )
          updateDateStatus(startDateDayjs, 'normal')
          updateDateStatus(endDateDayjs, 'normal')
        }
        value = [generateDateStr(currentSelectedDate)]
      } else {
        // 判断当前选中的日期是否比开始日期还要着，如果是则重新设置开始日期
        const currentDate = generateDateStr(currentSelectedDate)
        if (rangeDate.start) {
          if (rangeDate.start.isAfter(generateDateStr(currentSelectedDate))) {
            value = [currentDate]
          } else {
            // 将选择后的日添加为结束日期
            value = [
              ...(formatModelValue as string[]),
              generateDateStr(currentSelectedDate),
            ]
          }
        }
      }
      needRenderCalendar = true
      break
  }

  emits('update:modelValue', value)
  if (changeEmit) {
    nextTick(() => {
      emits('change', value)
    })
  }
}

// 当前月份在中数据中的索引
const currentMonthIndex = computed(() => {
  return calendarData.value.findIndex(
    item => item.month === currentSelectedDate.month
  )
})
// 当前月份中日期数据的长度
const currentMonthDateLength = computed(() => {
  return calendarData.value[currentMonthIndex.value]?.data?.length || 0
})

const current = getCurrentInstance()

const calendarId = `z-calendar-${current?.uid}`

// 单个日期的高度
const singleDateItemHeight = ref<number>(0)

// 日期容器的高度
const dateContainerHeight = computed<number>(
  () => Math.ceil(currentMonthDateLength.value / 7) * singleDateItemHeight.value
)

let initCount = 0
// 获取单个日期容器的信息
const getDateItemComponentRectInfo = async () => {
  try {
    const rectInfo = await z.getDomInfo(`#${calendarId}`, current)

    initCount = 0
    singleDateItemHeight.value =
      ((rectInfo.width ? rectInfo.width : 30) - 30) / 7 || 0
    if (props.mode === 'date' || props.mode === 'multi') {
      singleDateItemHeight.value += uni.upx2px(12)
    }
  } catch (err) {
    if (initCount > 10) {
      initCount = 0
      z.error(`z-calendar 获取单个日期容器信息失败: ${err}`)
      return
    }
    initCount++
    setTimeout(() => {
      getDateItemComponentRectInfo()
    }, 150)
  }
}

onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      getDateItemComponentRectInfo()
    }, 50)
  })
})

// 保存当前设置的日期信息
const activeDateValueMap = new Map<number, CalendarSelectDataMap>()

// 生成日历数据
const generateCalendarData = () => {
  const data: CalendarData = []
  // 填充日期数据
  const _fillDateData = (month: number, minDisabledDate = 0, maxDisabledDate = 0) => {
    const monthData: CalendarMonthData = {
      month,
      data: [],
    }

    // 获取对应年份和月份
    const activeDates = activeDateValueMap.get(currentSelectedDate.year)?.get(month)

    // 获取当前月份的天数
    const days = new Date(currentSelectedDate.year, month, 0).getDate()
    // 获取当前月份的第一天是星期几
    const firstDayWeek = new Date(`${currentSelectedDate.year}/${month}/1`).getDay()
    // 填充空白数据
    for (let i = 0; i < firstDayWeek; i++) {
      monthData.data.push({
        date: 0,
        status: 'disabled',
      })
    }
    // 填充日期数据
    for (let i = 1; i <= days; i++) {
      let status: CalendarItemDateStatus =
        i < minDisabledDate || (maxDisabledDate && i > maxDisabledDate)
          ? 'disabled'
          : 'normal'
      if (activeDates?.includes(i)) status = 'active'
      let desc = ''
      if (props.showLunar) {
        const lunarValue = solar2lunar(currentSelectedDate.year, month, i)
        if (lunarValue !== -1) {
          desc =
            lunarValue.IDayCn === '初一' ? lunarValue.IMonthCn : lunarValue.IDayCn
        }
      }

      // 设置日期范围数据
      if (props.mode === 'range') {
        const { start, end } = rangeDate
        if (start && start.isSame(`${currentSelectedDate.year}/${month}/${i}`)) {
          status = 'active'
          desc = props.rangeStartDesc
        }
        if (end && end.isSame(`${currentSelectedDate.year}/${month}/${i}`)) {
          status = 'active'
          desc = props.rangeEndDesc
        }
        if (start && end) {
          // 判断是否在范围内
          const currentDateDayjs = dayjs(
            `${currentSelectedDate.year}/${month}/${i}`,
            DEFAULT_DATE_FORMAT
          )
          if (currentDateDayjs.isAfter(start) && currentDateDayjs.isBefore(end)) {
            status = 'range'
          }
        }
      }

      monthData.data.push({
        date: i,
        status,
        desc,
      })
    }

    return monthData
  }

  // 填充月份数据
  let minMonth = 1
  let maxMonth = 12

  // 如果当前选中的年份等于最小年份，那么最小月份就是最小年份的月份
  if (currentSelectedDate.year === minDate.year) {
    minMonth = minDate.month
  }
  if (currentSelectedDate.year === maxDate.year) {
    maxMonth = maxDate.month
  }

  if (minMonth === 0 || maxMonth === 0) return

  for (let i = minMonth; i <= maxMonth; i++) {
    let minDisabledDate = 0
    let maxDisabledDate = 0
    // 如果当前选中的年份等于最小年份，那么最小月份就是最小年份的月份
    if (currentSelectedDate.year === minDate.year && i === minMonth) {
      minDisabledDate = minDate.date
      maxDisabledDate = 0
    }
    if (currentSelectedDate.year === maxDate.year && i === maxMonth) {
      minDisabledDate = 0
      maxDisabledDate = maxDate.date
    }
    data.push(_fillDateData(i, minDisabledDate, maxDisabledDate))
  }

  calendarData.value = data
}

watch(
  () => props.modelValue,
  (val: CalendarModelValueType) => {
    if (val || val.length) {
      const { mode } = props
      let modelValue: string[] = []
      if (mode === 'date') modelValue = [val as string]
      else modelValue = val as string[]

      activeDateValueMap.clear()

      // 遍历获取对应已设置的日期信息
      modelValue.forEach(item => {
        const dateDayjs = dayjs(formatDate(item), DEFAULT_DATE_FORMAT)
        const year = dateDayjs.year()
        const month = dateDayjs.month() + 1
        const date = dateDayjs.date()
        // 设置当前激活的年份和月份
        if (currentSelectedDate.year === 0) {
          currentSelectedDate.year = year
          currentSelectedDate.month = month
        }
        if (activeDateValueMap.has(year)) {
          let monthDates = activeDateValueMap.get(year)?.get(month)
          if (!monthDates) monthDates = [date]
          else monthDates.push(date)
          activeDateValueMap.get(year)?.set(month, monthDates)
        } else {
          activeDateValueMap.set(year, new Map([[month, [date]]]))
        }
      })

      // 如果是选择日期范围，则设置开始和结束时间
      if (mode === 'range') {
        rangeDate.start = undefined
        rangeDate.end = undefined
        if (modelValue?.[0]) {
          // 开始时间
          rangeDate.start = dayjs(modelValue[0], DEFAULT_DATE_FORMAT)
        }
        if (modelValue?.[1]) {
          // 结束时间
          rangeDate.end = dayjs(modelValue[1], DEFAULT_DATE_FORMAT)
        }
      }

      if (needRenderCalendar) {
        needRenderCalendar = false
        nextTick(() => {
          generateCalendarData()
        })
      }
    }
  },
  {
    immediate: true,
    deep: true,
  }
)

// 根据传递的日期，设置当前日期的状态
const updateDateStatus = (
  dateData: DateData | Dayjs,
  status: CalendarItemDateStatus
) => {
  let month = 0
  let date = 0
  if (dateData.toString() === '[object Object]') {
    month = (dateData as DateData).month
    date = (dateData as DateData).date
  } else {
    month = (dateData as Dayjs).month() + 1
    date = (dateData as Dayjs).date()
  }
  const monthIndex = calendarData.value.findIndex(item => item.month === month)
  if (monthIndex === -1) return
  const dateIndex = calendarData.value[monthIndex].data.findIndex(
    item => item.date === date
  )
  if (dateIndex === -1) return
  calendarData.value[monthIndex].data[dateIndex].status = status
}

// 初始化最小、最大年月日
const initDateData = () => {
  let { minDate: _minDate, maxDate: _maxDate, modelValue, mode } = props

  // 当前时间的 dayjs 对象
  const currentDayjs = dayjs()
  currentDate.year = currentDayjs.year()
  currentDate.month = currentDayjs.month() + 1
  currentDate.date = currentDayjs.date()

  // 如果没有设置最小值，那么最小值就是当前年月日
  if (!_minDate) {
    _minDate = currentDayjs.format(DEFAULT_DATE_FORMAT)
  } else {
    _minDate = formatDate(_minDate)
  }
  const minDateDayjs = dayjs(_minDate, DEFAULT_DATE_FORMAT)
  minDate.year = minDateDayjs.year()
  minDate.month = minDateDayjs.month() + 1
  minDate.date = minDateDayjs.date()

  // 如果没有设置最大值，那么最大值就是当前年份最后一个月的最后一天
  if (!_maxDate) {
    _maxDate = currentDayjs.endOf('year').format(DEFAULT_DATE_FORMAT)
  } else {
    _maxDate = formatDate(_maxDate)
  }
  const maxDateDayjs = dayjs(_maxDate, DEFAULT_DATE_FORMAT)
  maxDate.year = maxDateDayjs.year()
  maxDate.month = maxDateDayjs.month() + 1
  maxDate.date = maxDateDayjs.date()

  let noGenerateAfterInit = false
  // 如果没有设置默认值，那么默认值就是当前年月
  if (!modelValue || !modelValue?.length) {
    currentSelectedDate.year = Math.max(currentDate.year, minDate.year)
    currentSelectedDate.month =
      currentDate.year === minDate.year
        ? Math.max(currentDate.month, minDate.month)
        : currentDate.month

    // 如果当前是单选日期模式，那么默认选中当前日期
    if (
      mode === 'date' &&
      currentSelectedDate.year === currentDate.year &&
      currentSelectedDate.month === currentDate.month
    ) {
      currentSelectedDate.date = currentDate.date
      emits('update:modelValue', generateDateStr(currentSelectedDate))
    }
  } else {
    let initDefaultDate = ''
    switch (mode) {
      case 'date':
        initDefaultDate = formatDate(modelValue as string)
        // 判断设置的默认值是否在最小、最大年月日范围内，如果不在，那么默认值就是最小、最大年月日
        if (minDateDayjs.isAfter(initDefaultDate)) {
          initDefaultDate = minDateDayjs.format(DEFAULT_DATE_FORMAT)
          emits('update:modelValue', initDefaultDate)
        }
        if (maxDateDayjs.isBefore(initDefaultDate)) {
          initDefaultDate = maxDateDayjs.format(DEFAULT_DATE_FORMAT)
          emits('update:modelValue', initDefaultDate)
        }
        break
      case 'multi':
        // 筛选出在最小、最大年月日范围内的日期
        // eslint-disable-next-line no-case-declarations
        const multiDefaultModelValue = (modelValue as string[]).filter(date => {
          const dateDayjs = dayjs(date)
          return (
            (dateDayjs.isAfter(minDateDayjs) && dateDayjs.isBefore(maxDateDayjs)) ||
            dateDayjs.isSame(minDateDayjs) ||
            dateDayjs.isSame(maxDateDayjs)
          )
        })
        if (multiDefaultModelValue.length !== (modelValue as string[]).length) {
          emits('update:modelValue', multiDefaultModelValue)
        }
        initDefaultDate = multiDefaultModelValue[0]

        break
      case 'range':
        if (modelValue.length !== 2) {
          z.error('z-calendar 在 range 模式下 modelValue 长度必须为 2')
          return
        }
        // eslint-disable-next-line no-case-declarations
        const rangeMinDateDayjs = dayjs((modelValue as string[])[0])
        // eslint-disable-next-line no-case-declarations
        const rangeMaxDateDayjs = dayjs((modelValue as string[])[1])
        // 判断是否超过最大范围
        if (
          rangeMinDateDayjs.isAfter(maxDateDayjs) ||
          rangeMaxDateDayjs.isBefore(minDateDayjs)
        ) {
          z.error('z-calendar 在 range 模式下 modelValue 超过最大范围')
          return
        }
        // eslint-disable-next-line no-case-declarations
        const rangeDefaultModelValue = modelValue as string[]
        if (rangeMinDateDayjs.isBefore(minDateDayjs)) {
          rangeDefaultModelValue[0] = minDateDayjs.format(DEFAULT_DATE_FORMAT)
          initDefaultDate = rangeDefaultModelValue[0]
        }
        if (rangeMaxDateDayjs.isAfter(maxDateDayjs)) {
          rangeDefaultModelValue[1] = maxDateDayjs.format(DEFAULT_DATE_FORMAT)
        }
        emits('update:modelValue', rangeDefaultModelValue)
        noGenerateAfterInit = true

        break
    }
    if (initDefaultDate) {
      const initDefaultDateDayjs = dayjs(initDefaultDate, DEFAULT_DATE_FORMAT)
      currentSelectedDate.year = initDefaultDateDayjs.year()
      currentSelectedDate.month = initDefaultDateDayjs.month() + 1
      currentSelectedDate.date = initDefaultDateDayjs.date()
    }
  }
  if (!noGenerateAfterInit || calendarData.value.length === 0) {
    nextTick(() => {
      // 生成日历数据
      generateCalendarData()
    })
  }
}
initDateData()

// 如果修改了最小、最大年月日，那么重新初始化最小、最大年月日
watch(
  () => [props.minDate, props.maxDate],
  () => {
    initDateData()
  }
)

// dateItem点击事件
const dateItemClickEvent = (date: CalendarItem) => {
  if (
    (date.status === 'active' && props.mode === 'date') ||
    date.status === 'disabled' ||
    date.date === 0
  )
    return
  currentSelectedDate.date = date.date
  updateModelValue()
}

// 滑动切换月份事件
const swiperSwitchMonthEvent = (event: any) => {
  const { current } = event.detail
  currentSelectedDate.month = calendarData.value[current].month
  clearSwiperAnimationFlagTimer = setTimeout(() => {
    swiperSwitchAnimationFinish = true
    if (clearSwiperAnimationFlagTimer) {
      clearTimeout(clearSwiperAnimationFlagTimer)
      clearSwiperAnimationFlagTimer = null
    }
  }, 300)
  emits('changeMonth', currentSelectedDate.month)
}
// 月份切换动画结束
let swiperSwitchAnimationFinish = true
let clearSwiperAnimationFlagTimer: ReturnType<typeof setTimeout> | null = null
const swiperSwitchMonthAnimationFinishEvent = () => {
  swiperSwitchAnimationFinish = true
  if (clearSwiperAnimationFlagTimer) {
    clearTimeout(clearSwiperAnimationFlagTimer)
    clearSwiperAnimationFlagTimer = null
  }
}

// 切换月份
const switchMonth = (type: 'prev' | 'next') => {
  if (!props.allowChangeMonth || !swiperSwitchAnimationFinish) return
  swiperSwitchAnimationFinish = false
  if (type === 'prev') {
    if (
      (currentSelectedDate.year === minDate.year &&
        currentSelectedDate.month === minDate.month) ||
      currentSelectedDate.month === 1
    )
      return
    currentSelectedDate.month--
  } else {
    if (
      (currentSelectedDate.year === maxDate.year &&
        currentSelectedDate.month === maxDate.month) ||
      currentSelectedDate.month === 12
    )
      return
    currentSelectedDate.month++
  }
}

// 切换年份
const switchYear = (type: 'prev' | 'next') => {
  if (!props.allowChangeYear) return
  if (type === 'prev') {
    if (currentSelectedDate.year === minDate.year) return
    currentSelectedDate.year--
    currentSelectedDate.month = 12
    currentSelectedDate.date = 31
  } else {
    if (currentSelectedDate.year === maxDate.year) return
    currentSelectedDate.year++
    currentSelectedDate.month = 1
    currentSelectedDate.date = 1
  }

  emits('changeYear', currentSelectedDate.year)

  reloadMonthSwiper.value = true
  setTimeout(() => {
    reloadMonthSwiper.value = false
  }, 0)

  // 重新生产日历数据
  generateCalendarData()
}

type itemStyleType = (status: CalendarItemDateStatus) => CSSProperties

const itemStyle = computed<itemStyleType>(() => {
  return (status: CalendarItemDateStatus) => {
    const style: CSSProperties = {}

    if (status === 'active') {
      if (props.activeBgColor) {
        style.backgroundColor = props.activeBgColor
      }

      if (props.activeTextColor) {
        style.color = props.activeTextColor
      } else if (!props.activeBgColor && !props.activeTextColor) {
        style.color = '#fff'
      }
    } else if (status === 'range') {
      if (props.rangeBgColor) {
        style.backgroundColor = props.rangeBgColor
      } else {
        style.backgroundColor = props.activeBgColor
      }

      if (props.rangeTextColor) {
        style.color = props.rangeTextColor
      } else {
        style.color = props.activeTextColor
      }
    } else if (status === 'disabled') {
      style.opacity = 0.5
    }
    return style
  }
})
</script>

<template>
  <div :id="calendarId" :class="'z-calendar-' + props.mode" class="pr z-calendar">
    <!-- 操作区域 -->
    <div class="pr df jcc aic operation">
      <!-- 年切换按钮 -->
      <div
        v-if="allowChangeYear && currentSelectedDate.year !== minDate.year"
        class="year"
        @tap.stop="switchYear('prev')"
      >
        <zIcon name="chevron-left1"></zIcon>
      </div>
      <!-- 年月显示 -->
      <div style="margin: 0 20rpx">{{ currentSelectedDate.year }}年</div>
      <!-- 年切换按钮 -->
      <div
        v-if="allowChangeYear && currentSelectedDate.year !== maxDate.year"
        class="year"
        @tap.stop="switchYear('next')"
      >
        <zIcon name="chevron-right1"></zIcon>
      </div>
    </div>

    <!-- 星期文字提示 -->
    <div class="pr df aic fwnw week-text">
      <div v-for="(item, index) in weekText" :key="index" class="f1 df jcc aic">
        {{ item }}
      </div>
    </div>

    <!-- 数据展示区域 -->
    <div
      class="pr ofh data"
      :style="{
        height: `${dateContainerHeight ? `${dateContainerHeight}px` : 'auto'}`,
      }"
    >
      <!-- 月份背景 -->
      <div class="pa df jcc aic month-bg">
        {{ currentSelectedDate.month }}
      </div>
      <!-- 月份切换按钮 -->
      <div
        v-if="
          allowChangeMonth &&
          !(
            (currentSelectedDate.year === minDate.year &&
              currentSelectedDate.month === minDate.month) ||
            currentSelectedDate.month === 1
          )
        "
        class="left month-btn pa df jcc aic fwb ofh"
        @tap.stop="switchMonth('prev')"
      >
        <zIcon name="chevron-left1"></zIcon>
      </div>
      <div
        v-if="
          allowChangeMonth &&
          !(
            (currentSelectedDate.year === maxDate.year &&
              currentSelectedDate.month === maxDate.month) ||
            currentSelectedDate.month === 12
          )
        "
        class="right month-btn pa df jcc aic fwb ofh"
        @tap.stop="switchMonth('next')"
      >
        <zIcon name="chevron-right1"></zIcon>
      </div>
      <swiper
        v-if="!reloadMonthSwiper"
        class="swiper pr"
        :current="currentMonthIndex"
        :indicator-dots="false"
        :autoplay="false"
        :circular="false"
        adjust-height="none"
        @change="swiperSwitchMonthEvent"
        @animationfinish="swiperSwitchMonthAnimationFinishEvent"
      >
        <swiper-item v-for="(item, index) in calendarData" :key="index" class="item">
          <div class="df fww">
            <div
              v-for="(dateItem, dateIndex) in item.data"
              :key="dateIndex"
              class="date pr"
              :style="itemStyle(dateItem.status)"
            >
              <div
                v-if="dateItem.date != 0"
                class="content pa dfc jcc aic"
                @tap.stop="dateItemClickEvent(dateItem)"
              >
                <div class="date">{{ dateItem.date }}</div>
                <div v-if="dateItem.desc" class="desc">
                  {{ dateItem.desc }}
                </div>
              </div>
            </div>
          </div>
        </swiper-item>
      </swiper>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-calendar {
  width: 100%;
  background-color: @cw;
  color: #1a1a1a;
  .operation {
    width: 95%;
    padding: 20rpx;
    .year {
      font-size: 34rpx;
      line-height: 1;
      color: @info;
    }
  }
  .week-text {
    width: 92%;
    padding: 10rpx 30rpx;
  }
  .data {
    width: 92%;
    background-color: #eeeeee;
    padding: 0rpx 30rpx;
    transition: height 0.3s linear;
    .month-bg {
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      font-size: 200rpx;
      line-height: 1;
      color: #cccccc;
    }
    .month-btn {
      top: 0;
      height: 100%;
      width: 30rpx;
      font-size: 38rpx;
      color: @info;
    }
    .left {
      left: 0;
    }
    .right {
      right: 0;
    }
    .swiper {
      width: 100%;
      height: 100%;
      .item {
        /* #ifndef MP-ALIPAY */
        position: relative;
        /* #endif */
        width: 100%;
        height: 100%;
        .date {
          width: calc(100% / 7 - 12rpx);
          height: auto;
          padding-bottom: calc(100% / 7 - 12rpx);
          border-radius: 50%;
          margin: 6rpx;
          display: flex;
          justify-content: center;
          align-items: center;
          .content {
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            line-height: 1;
          }
        }
        .desc {
          font-size: 22rpx;
          color: inherit;
          margin-top: 6rpx;
        }
      }
    }
  }
}
</style>
