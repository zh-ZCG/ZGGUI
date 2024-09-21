/**
 * 验证格式方法对象
 */

const zTest = {
  /**
   * 验证电子邮箱格式
   */
  email(value: any): boolean {
    return /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/.test(
      value
    )
  },

  /**
   * 验证手机格式
   */
  mobile(value: any): boolean {
    return /^1([3589]\d|4[5-9]|6[1-2,4-7]|7[0-8])\d{8}$/.test(value)
  },

  /**
   * 验证URL格式
   */
  url(value: any): boolean {
    return /^((https|http|ftp|rtsp|mms):\/\/)(([0-9a-zA-Z_!~*'().&=+$%-]+: )?[0-9a-zA-Z_!~*'().&=+$%-]+@)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([0-9a-zA-Z_!~*'()-]+\.)*([0-9a-zA-Z][0-9a-zA-Z-]{0,61})?[0-9a-zA-Z]\.[a-zA-Z]{2,6})(:[0-9]{1,4})?((\/?)|(\/[0-9a-zA-Z_!~*'().;?:@&=+$,%#-]+)+\/?)$/.test(
      value
    )
  },

  /**
   * 验证日期格式
   */
  date(value: any): boolean {
    if (!value) return false
    if (zTest.number(value)) value = +value
    return !/Invalid|NaN/.test(new Date(value).toString())
  },

  /**
   * 验证ISO类型的日期格式
   */
  dateISO(value: any): boolean {
    return /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test(value)
  },

  /**
   * 验证十进制数字
   */
  number(value: any): boolean {
    return /^[\+-]?(\d+\.?\d*|\.\d+|\d\.\d+e\+\d+)$/.test(value)
  },

  /**
   * 验证字符串
   */
  string(value: any): boolean {
    return typeof value === 'string'
  },

  /**
   * 验证整数
   */
  digits(value: any): boolean {
    return /^\d+$/.test(value)
  },

  /**
   * 验证身份证号码
   */
  idCard(value: any): boolean {
    return /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/.test(
      value
    )
  },

  /**
   * 是否车牌号
   */
  carNo(value: any): boolean {
    const xreg =
      /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}(([0-9]{5}[DF]$)|([DF][A-HJ-NP-Z0-9][0-9]{4}$))/
    const creg =
      /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]{1}$/
    if (value.length === 7) {
      return creg.test(value)
    } else if (value.length === 8) {
      return xreg.test(value)
    }
    return false
  },

  /**
   * 金额,只允许2位小数
   */
  amount(value: any): boolean {
    return /^[1-9]\d*(,\d{3})*(\.\d{1,2})?$|^0\.\d{1,2}$/.test(value)
  },

  /**
   * 中文
   */
  chinese(value: any): boolean {
    const reg = /^[\u4e00-\u9fa5]+$/gi
    return reg.test(value)
  },

  /**
   * 只能输入字母
   */
  letter(value: any): boolean {
    return /^[a-zA-Z]*$/.test(value)
  },

  /**
   * 只能是字母或者数字
   */
  enOrNum(value: any): boolean {
    const reg = /^[0-9a-zA-Z]*$/g
    return reg.test(value)
  },

  /**
   * 验证是否包含某个值
   */
  contains(value: string, param: string): boolean {
    return value.indexOf(param) >= 0
  },

  /**
   * 验证一个值是否在范围[min, max]内
   */
  range(value: number, param: [number, number]): boolean {
    return value >= param[0] && value <= param[1]
  },

  /**
   * 验证一个长度是否在范围[min, max]内
   */
  rangeLength(value: { length: number }, param: [number, number]): boolean {
    return value.length >= param[0] && value.length <= param[1]
  },

  /**
   * 是否固定电话
   */
  landline(value: any): boolean {
    const reg = /^\d{3,4}-\d{7,8}(-\d{3,4})?$/
    return reg.test(value)
  },

  /**
   * 判断是否为空
   */
  empty(value: any): boolean {
    switch (typeof value) {
      case 'undefined':
        return true
      case 'string':
        return value.replace(/(^[ \t\n\r]*)|([ \t\n\r]*$)/g, '').length === 0
      case 'boolean':
        return !value
      case 'number':
        return value === 0 || isNaN(value)
      case 'object':
        if (value === null || value.length === 0) return true
        for (const i in value) {
          return false
        }
        return true
      default:
        return false
    }
  },

  /**
   * 是否json字符串
   */
  jsonString(value: any): boolean {
    if (typeof value === 'string') {
      try {
        const obj = JSON.parse(value)
        return typeof obj === 'object' && obj !== null
      } catch (e) {
        return false
      }
    }
    return false
  },

  /**
   * 是否数组
   */
  array(value: any): boolean {
    return Array.isArray(value)
  },

  /**
   * 是否对象
   */
  object(value: any): boolean {
    return Object.prototype.toString.call(value) === '[object Object]'
  },

  /**
   * 是否短信验证码
   */
  code(value: any, len: number = 6): boolean {
    return new RegExp(`^\\d{${len}}$`).test(value)
  },

  /**
   * 是否函数方法
   */
  func(value: any): boolean {
    return typeof value === 'function'
  },

  /**
   * 是否promise对象
   */
  promise(value: any): boolean {
    return zTest.object(value) && zTest.func(value.then) && zTest.func(value.catch)
  },

  /**
   * 是否图片格式
   */
  image(value: any): boolean {
    const newValue = value.split('?')[0]
    const IMAGE_REGEXP = /\.(jpeg|jpg|gif|png|svg|webp|jfif|bmp|dpg)/i
    return IMAGE_REGEXP.test(newValue)
  },

  /**
   * 是否视频格式
   */
  video(value: any): boolean {
    const VIDEO_REGEXP = /\.(mp4|mpg|mpeg|dat|asf|avi|rm|rmvb|mov|wmv|flv|mkv|m3u8)/i
    return VIDEO_REGEXP.test(value)
  },

  /**
   * 是否为正则对象
   */
  regExp(value: any): boolean {
    return value && Object.prototype.toString.call(value) === '[object RegExp]'
  },
}

export default zTest
