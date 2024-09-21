//全局方法
import { getCurrentInstance } from 'vue'
import type { ComponentInternalInstance } from 'vue'

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/**
 * 最大安全整数
 */
export const MAX_SAFE_INTEGER = 9007199254740991

const zMath = {
  /**
   *  控制数值范围 value小于min取min，大于max取max
   * @param value 主题标记
   */
  range(min = 0, max = 0, value = 0) {
    return Math.max(min, Math.min(max, Number(value)))
  },
  // 以下为时间处理方法
  /**
   * 将输入的数字用前导零填充，直到达到指定的目标长度。
   * @param num - 要填充的数字。
   * @param targetLength - 结果字符串的目标长度，默认为2。
   * @returns 填充后的数字字符串。
   */
  padZero(num: number, targetLength: number = 2): string {
    // 将数字转换为字符串
    let str: string = `${num}`
    // 当字符串长度小于目标长度时，在前面加'0'
    while (str.length < targetLength) {
      str = `0${str}`
    }
    // 返回填充后的字符串
    return str
  },
  /**
   * 将时间（以毫秒为单位）解析为天、小时、分钟、秒和毫秒。
   * @param time - 以毫秒为单位的时间。
   * @returns 包含天、小时、分钟、秒和毫秒的对象。
   */
  parseTimeData(time: number): {
    days: number
    hours: number
    minutes: number
    seconds: number
    milliseconds: number
  } {
    // 计算天数
    const days = Math.floor(time / DAY)
    // 计算小时数
    const hours = Math.floor((time % DAY) / HOUR)
    // 计算分钟数
    const minutes = Math.floor((time % HOUR) / MINUTE)
    // 计算秒数
    const seconds = Math.floor((time % MINUTE) / SECOND)
    // 计算毫秒数
    const milliseconds = Math.floor(time % SECOND)
    // 返回包含天、小时、分钟、秒和毫秒的对象
    return {
      days,
      hours,
      minutes,
      seconds,
      milliseconds,
    }
  },
  /**
   * 将时间数据按照指定的格式进行格式化。
   * @param format - 格式化字符串，例如 "DD:HH:mm:ss.SSS"。
   * @param timeData - 包含天、小时、分钟、秒和毫秒的时间数据对象。
   * @returns 格式化后的时间字符串。
   */
  parseFormat(
    format: string,
    timeData: {
      days: number
      hours: number
      minutes: number
      seconds: number
      milliseconds: number
    }
  ): string {
    // 解构时间数据对象
    let { days, hours, minutes, seconds, milliseconds } = timeData
    // 如果格式化字符串中不存在 "DD" (天)，则将天的时间转为小时
    if (format.indexOf('DD') === -1) {
      hours += days * 24
    } else {
      // 对天补0并替换格式化字符串中的 "DD"
      format = format.replace('DD', this.padZero(days))
    }
    // 如果格式化字符串中不存在 "HH" (小时)，则将小时的时间转为分钟
    if (format.indexOf('HH') === -1) {
      minutes += hours * 60
    } else {
      // 对小时补0并替换格式化字符串中的 "HH"
      format = format.replace('HH', this.padZero(hours))
    }
    // 如果格式化字符串中不存在 "mm" (分钟)，则将分钟的时间转为秒
    if (format.indexOf('mm') === -1) {
      seconds += minutes * 60
    } else {
      // 对分钟补0并替换格式化字符串中的 "mm"
      format = format.replace('mm', this.padZero(minutes))
    }
    // 如果格式化字符串中不存在 "ss" (秒)，则将秒的时间转为毫秒
    if (format.indexOf('ss') === -1) {
      milliseconds += seconds * 1000
    } else {
      // 对秒补0并替换格式化字符串中的 "ss"
      format = format.replace('ss', this.padZero(seconds))
    }
    // 对毫秒补0并替换格式化字符串中的 "SSS"
    return format.replace('SSS', this.padZero(milliseconds, 3))
  },
  /**
   * 判断两个时间（以毫秒为单位）是否在同一秒内。
   * @param time1 - 第一个时间，单位为毫秒。
   * @param time2 - 第二个时间，单位为毫秒。
   * @returns 如果两个时间在同一秒内，则返回 true；否则返回 false。
   */
  isSameSecond(time1: number, time2: number): boolean {
    // 将时间除以1000并取整，判断两个时间是否在同一秒内
    return Math.floor(time1 / 1000) === Math.floor(time2 / 1000)
  },
  /**
   * @description 取一个区间数
   * @param {number} min 最小值
   * @param {number} max 最大值
   * @returns {number} 随机数
   */
  random(min: number, max: number): number {
    if (min >= 0 && max > 0 && max >= min) {
      const gap = max - min + 1
      return Math.floor(Math.random() * gap + min)
    }
    return 0
  },
}

export default zMath
