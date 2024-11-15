<!--
 * @Description: z-weekCalendar 周日历组件
 * @Author: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
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
  CSSProperties,
} from 'vue'
import z from '../../libs/z'
import zColor from '../../libs/zColor'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
import zIcon from '../../components/z-icon/z-icon.vue'
import dayjs from '../../libs/dayjs'
/**
 * @description: z-weekCalendar 周日历传参
 * @param: modelValue 绑定月份选中日期的值
 * @param: activeBgColor	选中时的背景颜色
 * @param: activeTextColor	选中时的文字颜色
 * @param: year  绑定的年份，如果为空则使用当前年份
 * @param: month  绑定的月份，如果为空则使用当前月份
 * @param: minDate  最小允许选择月份的日期
 * @param: maxDate  最大允许选择月份的日期
 * @param: customData  自定义数据
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */

interface WeekCalendarCustomData {
  date: number
  desc: string
}

type WeekCalanderDateStatus = 'active' | 'normal' | 'disabled'

type WeekCalendarData = Array<Array<WeekCalendarItem>>

interface WeekCalendarItem {
  date: number
  status: WeekCalanderDateStatus
  desc?: string
}

interface PropsType extends PropsTypeHook {
  modelValue?: number
  activeBgColor?: string
  activeTextColor?: string
  year?: [string, number]
  month?: [string, number]
  minDate?: [string, number]
  maxDate?: [string, number]
  customData?: Array<WeekCalendarCustomData>
}

interface EmitsType {
  (e: 'update:modelValue', value: number): void
  (e: 'change', value: number): void
  (e: 'week-change', value: number): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  modelValue: 0,
  activeBgColor: '#409eff',
  activeTextColor: '#fff',
  customData: () => [],
})

const emits = defineEmits<EmitsType>()

const currentDateDayjs = dayjs()

const instance = getCurrentInstance()

const componentDateItemId = `z-week-calendar-${instance?.uid}`

// 存放日期节点容器的高度
const dateItemContainerHeight = ref<number>(0)

let initCount = 0
// 获取日期节点信息
const getDateItemNodeInfo = async () => {
  try {
    const nodeInfo = await z.getDomInfo(`#${componentDateItemId}-0-0`, instance)

    dateItemContainerHeight.value = nodeInfo.height || 0
    dateItemContainerHeight.value += uni.upx2px(16)
  } catch (err) {
    if (initCount > 10) {
      initCount = 0
      z.error(`z-week-calendar 获取日期节点信息失败：${err}`)
      return
    }
    initCount++
    setTimeout(() => {
      getDateItemNodeInfo()
    }, 150)
  }
}

onMounted(() => {
  // #ifndef APP-PLUS || H5 || MP-ALIPAY
  nextTick(() => {
    getDateItemNodeInfo()
  })
  // #endif
  // #ifdef APP-PLUS || H5 || MP-ALIPAY
  setTimeout(() => {
    getDateItemNodeInfo()
  }, 150)
  // #endif
})

// 当前日期的年份
const currentYear = computed<number>(() =>
  props.year ? Number(props.year) : currentDateDayjs.year()
)
// 当前日期的月份
const currentMonth = computed<number>(() =>
  props.month ? Number(props.month) : currentDateDayjs.month() + 1
)
// 最小可选日期
const minDate = computed<number>(() =>
  props.minDate
    ? Number(props.minDate)
    : currentDateDayjs.year() === currentYear.value &&
      currentDateDayjs.month() + 1 === currentMonth.value
    ? currentDateDayjs.date()
    : 1
)
// 最大可选日期
const maxDate = computed<number>(() =>
  props.maxDate ? Number(props.maxDate) : currentDateDayjs.daysInMonth()
)

// 用户自定义日期描述数据
const customDescData = computed<Map<number, string>>(() => {
  const map = new Map<number, string>()
  props.customData.forEach((item) => {
    map.set(item.date, item.desc)
  })
  return map
})

// 星期提示文字
const weekText = ref<string[]>(['日', '一', '二', '三', '四', '五', '六'])

// 周日历数据
const weekCalendarData = ref<WeekCalendarData>([])

// 当前激活的日期
const activeDate = computed<number>(() => {
  return props.modelValue ? props.modelValue : 0
})
// 当前选中的轮播位置
const currentSwiperIndex = ref<number>(0)

// 更新指定的日期为激活状态
const updateActiveDate = (date: number) => {
  weekCalendarData.value.forEach((week) => {
    week.forEach((item) => {
      if (item.status !== 'disabled') {
        if (item.date === date) {
          item.status = 'active'
        } else {
          item.status = 'normal'
        }
      }
    })
  })
}

// 更新modelValue的值
const updateModelValue = (value: number, changeEmits = true) => {
  emits('update:modelValue', value)
  if (changeEmits) {
    updateActiveDate(value)
    nextTick(() => {
      emits('change', value)
    })
  }
}

// 生成周日历数据
const generateWeekCalendarData = () => {
  const data: WeekCalendarItem[] = []

  const generateMonthDayjs = dayjs(
    `${currentYear.value}/${currentMonth.value}/01`
  )
  const dates = generateMonthDayjs.daysInMonth()
  const firstDayWeek = generateMonthDayjs.day()

  // 填充空白数据
  for (let i = 0; i < firstDayWeek; i++) {
    data.push({
      date: 0,
      status: 'disabled',
    })
  }

  // 填充日期数据
  for (let i = 1; i <= dates; i++) {
    let status: WeekCalanderDateStatus =
      i >= minDate.value && i <= maxDate.value ? 'normal' : 'disabled'
    if (i === activeDate.value) {
      status = 'active'
      // 设置当前激活日期所在的位置
      currentSwiperIndex.value = Math.floor((i + firstDayWeek - 1) / 7)
    }
    const desc = customDescData.value.get(i)
    data.push({
      date: i,
      status,
      desc,
    })
  }

  // 分割数据，每7个为一组
  const result: WeekCalendarData = []
  for (let i = 0; i < data.length; i += 7) {
    result.push(data.slice(i, i + 7))
  }
  weekCalendarData.value = result
}

// 初始化周日历数据
const initWeekCalendarData = () => {
  let updateModelValueDate = false
  let modelValue = props.modelValue
  // 判断modelValue是否有值，并且在最小和最大日期范围内
  // 如果没有值则以当前日期为准
  if (!modelValue) {
    modelValue = currentDateDayjs.date()
    updateModelValueDate = true
  }
  // 如果比最小日期小，则以最小日期为准
  if (modelValue < minDate.value) {
    modelValue = minDate.value
    updateModelValueDate = true
  }
  // 如果比最大日期大，则以最大日期为准
  if (modelValue > maxDate.value) {
    modelValue = maxDate.value
    updateModelValueDate = true
  }

  if (updateModelValueDate) {
    updateModelValue(modelValue)
  }

  nextTick(() => {
    generateWeekCalendarData()
  })
}
initWeekCalendarData()

// 日期选中事件
const dateItemClick = (item: WeekCalendarItem) => {
  if (item.status === 'active' || item.status === 'disabled' || item.date === 0)
    return
  updateModelValue(item.date)
}

// 切换星期
const switchWeek = (type: 'prev' | 'next') => {
  console.log(type)
  if (type === 'prev') {
    if (currentSwiperIndex.value === 0) return
    currentSwiperIndex.value--
  }
  if (type === 'next') {
    if (currentSwiperIndex.value === weekCalendarData.value.length - 1) return
    currentSwiperIndex.value++
  }
  emits('week-change', currentSwiperIndex.value)
}

// 滑动切换星期
const swiperChangeWeek = (event: any) => {
  currentSwiperIndex.value = event.detail.current
  emits('week-change', currentSwiperIndex.value)
}

// 如果自定义数据发生变化，重新生成周日历数据
watch(
  () => props.customData,
  () => {
    generateWeekCalendarData()
  },
  {
    deep: true,
  }
)

type WeekCalendarItemStyle = (status: WeekCalanderDateStatus) => CSSProperties

// dateItem的样式
const itemStyle = computed<WeekCalendarItemStyle>(() => {
  return (status: WeekCalanderDateStatus) => {
    const style: CSSProperties = {}

    if (status === 'active') {
      style.backgroundColor = zColor.getTypeColor(props.activeBgColor)

      if (props.activeTextColor) {
        style.color = zColor.getTypeColor(props.activeTextColor)
      } else if (!props.activeBgColor && !props.activeTextColor) {
        style.color = '#fff'
      }
    }

    return style
  }
})
</script>

<template>
  <div class="pr z-week-calendar">
    <!-- 星期中文数据 -->
    <div class="pr df fwnw weeks">
      <div
        v-for="(item, index) in weekText"
        :key="index"
        class="week df jcc aic"
      >
        {{ item }}
      </div>
    </div>

    <!-- 周日历数据 -->
    <div
      class="pr data"
      :style="{
        height: `${
          dateItemContainerHeight ? `${dateItemContainerHeight}px` : 'auto'
        }`,
      }"
    >
      <!-- 星期切换 -->
      <div
        v-if="currentSwiperIndex > 0"
        class="left week_btn"
        @tap.stop="switchWeek('prev')"
      >
        <zIcon name="chevron-left1"></zIcon>
      </div>
      <div
        v-if="currentSwiperIndex < weekCalendarData.length - 1"
        class="right week_btn"
        @tap.stop="switchWeek('next')"
      >
        <zIcon name="chevron-right1"></zIcon>
      </div>
      <swiper
        class="swiper pr"
        :indicator-dots="false"
        :autoplay="false"
        :circular="false"
        :current="currentSwiperIndex"
        @change="swiperChangeWeek"
      >
        <swiper-item
          v-for="(item, index) in weekCalendarData"
          :key="index"
          class="swiper_item"
        >
          <div class="pr df aic fwnw dates">
            <template v-for="(dateItem, dateIndex) in item" :key="dateIndex">
              <div
                :id="`${componentDateItemId}-${index}-${dateIndex}`"
                class="date pr"
                @tap.stop="dateItemClick(dateItem)"
              >
                <div class="dateItem pr" :style="itemStyle(dateItem.status)">
                  <div
                    v-if="dateItem.date"
                    class="dateItemValue pa dfc aic jcc"
                  >
                    <div class="value">
                      {{ dateItem.date }}
                    </div>
                    <div class="desc">
                      {{ dateItem.desc }}
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </swiper-item>
      </swiper>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-week-calendar {
  width: 100%;
  background-color: #fff;
  color: #1a1a1a;
  .weeks {
    width: 92%;
    padding: 20rpx 30rpx;
    .week {
      flex-grow: 1;
      flex-shrink: 1;
    }
  }
  .data {
    width: 92%;
    padding: 0rpx 30rpx;
    background-color: #eeeeee;
    .week_btn {
      position: absolute;
      top: 0;
      height: 100%;
      width: 30rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 38rpx;
      color: #666666;
    }
    .left {
      left: 0rpx;
    }
    .right {
      left: 720rpx;
    }
    .swiper {
      height: 100%;
      width: 100%;
      .swiper_item {
        /* #ifndef MP-ALIPAY */
        position: relative;
        /* #endif */
        width: 100%;
        height: 100%;
        .dates {
          width: 100%;
          height: 100%;
          overflow: hidden;
          .date {
            width: calc(100% / 7);
            height: 0;
            padding-bottom: calc(100% / 7);
            .dateItem {
              width: 100%;
              height: 0;
              padding-bottom: 100%;
              border-radius: 50%;
              .dateItemValue {
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                line-height: 1;
                .value {
                  font-size: 32rpx;
                }
                .desc {
                  font-size: 20rpx;
                  margin-top: 4rpx;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
