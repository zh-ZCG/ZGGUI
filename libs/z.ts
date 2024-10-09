//全局方法
import { getCurrentInstance, ref } from 'vue'
import type { ComponentInternalInstance } from 'vue'
import zTest from '../libs/zTest'

// #ifdef APP-NVUE
const dom = uni.requireNativePlugin('dom')
// #endif

/**
 * 节流防抖
 */
let timer: ReturnType<typeof setTimeout> | null = null
let timeout: ReturnType<typeof setTimeout> | null = null
let flag = ref(false)

const z = {
  /**非nvue获取当前的节点信息 */
  getDomInfo(
    selector: string,
    instance?: ComponentInternalInstance | null
  ): Promise<UniApp.NodeInfo> {
    if (!instance) {
      instance = getCurrentInstance()
    }

    let query: UniApp.SelectorQuery | null = null
    // #ifndef MP-ALIPAY || APP-PLUS
    query = uni.createSelectorQuery().in(instance)
    // #endif
    // #ifdef APP-PLUS
    query = uni.createSelectorQuery().in((instance as any).ctx.$scope)
    // #endif
    // #ifdef MP-ALIPAY
    query = uni.createSelectorQuery().in(null)
    // #endif
    return new Promise((resolve, reject) => {
      if (query) {
        query
          .select(selector)
          .boundingClientRect((res) => {
            const selectRes: UniApp.NodeInfo = res as UniApp.NodeInfo
            if (selectRes) {
              resolve(selectRes)
            } else {
              reject(new Error(`未找到对应节点: ${selector}`))
            }
          })
          .exec()
      } else {
        reject(new Error('未找到对应的SelectorQuery实例'))
      }
    })
  },
  getDomInfos(
    selector: string,
    instance?: ComponentInternalInstance | null
  ): Promise<UniApp.NodeInfo[]> {
    return new Promise((resolve, reject) => {
      if (!instance) {
        instance = getCurrentInstance()
      }
      let query: UniApp.SelectorQuery | null = null
      // #ifndef MP-ALIPAY || APP-PLUS
      query = uni.createSelectorQuery().in(instance)
      // #endif
      // #ifdef APP-PLUS
      query = uni.createSelectorQuery().in((instance as any).ctx.$scope)
      // #endif
      // #ifdef MP-ALIPAY
      query = uni.createSelectorQuery().in(null)
      // #endif
      if (query) {
        query
          .selectAll(selector)
          .boundingClientRect((res) => {
            const selectRes: UniApp.NodeInfo[] = res as UniApp.NodeInfo[]
            if (selectRes && selectRes.length > 0) {
              resolve(selectRes)
            } else {
              reject(new Error(`未找到对应节点: ${selector}`))
            }
          })
          .exec()
      } else {
        reject(new Error('未找到对应的SelectorQuery实例'))
      }
    })
  },
  /**nvue获取当前节点的信息 */
  getDomInfoNvue(ref: any) {
    return new Promise((resolve) => {
      dom.getComponentRect(ref, (res: any) => {
        resolve(res.size)
      })
    })
  },
  /**
   *  对象深拷贝
   * @param obj 需要深层复制的对象
   * @returns newObj 复制的对象
   */
  deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    if (Array.isArray(obj)) {
      const newArr: any[] = []
      for (let i = 0; i < obj.length; i++) {
        newArr[i] = z.deepClone(obj[i])
      }
      return newArr as T
    }

    const newObj: Record<string, any> = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        newObj[key] = z.deepClone(obj[key])
      }
    }
    return newObj as T
  },
  /**
   *对象深度合并
   * @param target 目标对象
   * @param source 合并对象
   * @returns target
   */
  deepMerge(
    target: {
      [index: string]: any
    },
    source: {
      [index: string]: any
    }
  ) {
    target = z.deepClone(target)
    if (typeof target !== 'object' || typeof source !== 'object') return target

    for (const prop in source) {
      if (!Object.prototype.hasOwnProperty.call(source, prop)) continue
      if (prop in target) {
        if (typeof target[prop] !== 'object') {
          target[prop] = source[prop]
        } else {
          if (typeof source[prop] !== 'object') {
            target[prop] = source[prop]
          } else {
            if (target[prop].concat && source[prop].concat) {
              target[prop] = target[prop].concat(source[prop])
            } else {
              target[prop] = z.deepMerge(target[prop], source[prop])
            }
          }
        }
      } else {
        target[prop] = source[prop]
      }
    }

    return target
  },
  /**
   * 判断是否带有单位，若没有则添加px为单位返回
   * @param value 参数值
   * @returns
   */
  addUnit(value: number | string): string {
    // 如果传入的值是数字类型，添加 'px' 单位并返回
    if (typeof value === 'number') {
      return `${value}px`
    } else if (typeof value === 'string') {
      // 如果传入的是字符串，先尝试将其转换为数字
      const numericValue = parseFloat(value)
      // 如果转换后的结果是有效数字，则添加 'px' 单位并返回
      if (!isNaN(numericValue)) {
        return `${numericValue}px`
      }
      // 如果转换后的结果不是有效数字，则直接返回原字符串
      return value
    } else {
      // 其他情况直接返回传入的值的字符串形式
      return value
    }
  },
  /**
   *  通过传入主题标记（primary，success，error，info，warning），返回背景和颜色class,以背景为颜色对象
   * @param value 主题标记
   */
  getBGColorClass(value: string): string {
    switch (value) {
      case 'primary':
        return 'bgprimary'
      case 'success':
        return 'bgsuccess'
      case 'error':
        return 'bgerror'
      case 'info':
        return 'bginfo'
      case 'warning':
        return 'bgwarning'
      default:
        return value
    }
  },
  /**
   *  通过传入主题标记（primary，success，error，info，warning），返回背景和颜色class,以内容为颜色对象
   * @param value 主题标记
   */
  getColorClass(value: string): string {
    switch (value) {
      case 'primary':
        return 'cprimary'
      case 'success':
        return 'csuccess'
      case 'cerror':
        return 'cerror'
      case 'info':
        return 'cinfo'
      case 'warning':
        return 'cwarning'
      default:
        return value
    }
  },
  /**
   *  判断传入的字符串参数是否是全局的class颜色，是则返回class，否则返回style
   * @param value 主题标记
   */
  isClassOrStyle(str: string): 'class' | 'style' {
    if (str.startsWith('c') || str.startsWith('bg')) {
      return 'class'
    } else {
      return 'style'
    }
  },
  /**
   * 阻塞代码，延时效果
   * @param value 延时时间 单位ms
   */
  sleep(value = 30): Promise<void> {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve()
      }, value)
    })
  },
  /**
   * 判断数据类型
   * @param value
   */
  getType(value: any): string {
    const type = typeof value
    if (type !== 'object') {
      return type
    }
    if (Array.isArray(value)) {
      return 'array'
    }
    if (value === null) {
      return 'null'
    }
    if (value instanceof Date) {
      return 'date'
    }
    if (value instanceof RegExp) {
      return 'regexp'
    }
    return 'object'
  },
  /**
   * 字段赋值
   * @param obj1 obj2
   * 相同字段赋值，obj2赋值给obj1，相同字段覆盖，不同字段不加入obj1
   */
  assignObject(obj1: any, obj2: any): void {
    for (let key in obj1) {
      if (obj2.hasOwnProperty(key)) {
        obj1[key] = obj2[key]
      }
    }
  },
  /**
   * 节流
   * @param func 要执行的回调函数 wait 延时的时间 immediate 是否立即执行
   * 在一定时间内，只能触发一次
   */
  throttle(
    func: () => void,
    wait: number = 500,
    immediate: boolean = true
  ): void {
    if (immediate) {
      if (!flag.value) {
        flag.value = true
        // 在wait毫秒内开始时执行
        typeof func === 'function' && func()
        timer = setTimeout(() => {
          flag.value = false
        }, wait)
      }
    } else if (!flag.value) {
      flag.value = true
      // 在wait毫秒内的结束处执行
      timer = setTimeout(() => {
        flag.value = false
        typeof func === 'function' && func()
      }, wait)
    }
  },
  /**
   * 防抖原理：一定时间内，只有最后一次操作，再过wait毫秒后才执行函数
   *
   * @param func 要执行的回调函数 wait 延时的时间 immediate 是否立即执行
   * @return null
   */
  debounce(
    func: () => void,
    wait: number = 500,
    immediate: boolean = false
  ): void {
    // 清除定时器
    if (timeout !== null) clearTimeout(timeout)
    // 立即执行，此类情况一般用不到
    if (immediate) {
      const callNow = !timeout
      timeout = setTimeout(() => {
        timeout = null
      }, wait)
      if (callNow) typeof func === 'function' && func()
    } else {
      // 设置定时器，当最后一次操作后，timeout不会再被清除，所以在延时wait毫秒后执行func回调方法
      timeout = setTimeout(() => {
        typeof func === 'function' && func()
      }, wait)
    }
  },
  /**
   * @param str 需要去除空格的字符串
   * @param position {'both' | 'left' | 'right' | 'all'} [postion='both'] 去除空格的位置，both(左右)|left|right|all，默认both
   * @returns {string} 去除空格后的字符串
   */
  trim(
    str: string,
    postion: 'both' | 'left' | 'right' | 'all' = 'both'
  ): string {
    str = String(str)
    if (postion === 'both') {
      return str.replace(/^\s+|\s+$/g, '')
    }
    if (postion === 'left') {
      return str.replace(/^\s*/, '')
    }
    if (postion === 'right') {
      return str.replace(/\s*$/, '')
    }
    if (postion === 'all') {
      return str.replace(/\s+/g, '')
    }
    return str
  },
  /**
   * 把对象转字符串，或者字符串转对象
   * @param customStyle 需要转换的目标
   * @param 转换的目的，object-转为对象，string-转为字符串
   * @returns {Record<string, string> | string}
   */
  addStyle(
    customStyle: Record<string, string> | string,
    target: 'object' | 'string' = 'object'
  ): Record<string, string> | string {
    // 字符串转字符串，对象转对象情形，直接返回
    if (
      !customStyle ||
      (typeof customStyle === 'object' && target === 'object') ||
      (target === 'string' && typeof customStyle === 'string')
    ) {
      return customStyle
    }

    // 字符串转对象
    if (target === 'object') {
      customStyle = this.trim(customStyle as string)
      // 将字符串转为数组形式
      const styleArray = customStyle.split(';')
      const style: Record<string, string> = {}
      // 将数组拼接成对象
      for (const item of styleArray) {
        // 'font-size:20px;color:red;'，如此最后字符串有";"的话，会导致styleArray最后一个元素为空字符串，这里需要过滤
        if (item) {
          const [key, value] = item.split(':')
          if (key && value) {
            style[this.trim(key)] = this.trim(value)
          }
        }
      }
      return style
    }

    // 对象转字符串
    let string = ''
    for (const key in customStyle as Record<string, string>) {
      if (customStyle.hasOwnProperty(key)) {
        // 驼峰转为中划线的形式，否则css内联样式，无法识别驼峰样式属性名
        const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
        string += `${kebabKey}:${(customStyle as Record<string, string>)[key]};`
      }
    }

    // 去除两端空格
    return this.trim(string)
  },

  /**
   * 用于获取用户传递值的px值
   * @param value 用户传递值的px值 unit 是否返回带单位的字符串，默认为false
   * @returns 转换后的px值，带单位或不带单位
   */
  getPx(value: number | string, unit: boolean = false): number | string {
    if (zTest.number(value)) {
      return unit ? `${value}px` : Number(value)
    }

    // 如果带有rpx，先取出其数值部分，再转为px值
    if (/(rpx|upx)$/.test(value.toString())) {
      const numericValue = parseInt(value.toString())
      const pxValue = uni.upx2px(numericValue)
      return unit ? `${pxValue}px` : pxValue
    }

    const numericValue = parseInt(value.toString())
    return unit ? `${numericValue}px` : numericValue
  },
  /**
   * @description 对名字脱敏，用星号替换中间字符
   * @param {string} name 需要脱敏的名字
   * @returns {string} 脱敏后的名字
   */
  formatName(name: string): string {
    let value = ''
    if (name.length === 2) {
      value = name.substring(0, 1) + '*'
    } else if (name.length > 2) {
      let char = ''
      for (let i = 0, len = name.length - 2; i < len; i++) {
        char += '*'
      }
      value = name.substring(0, 1) + char + name.substring(name.length - 1)
    } else {
      value = name
    }
    return value
  },
  /**
   * @description 数字格式化
   * @param {number|string} number 要格式化的数字
   * @param {number} [decimals=0] 保留几位小数
   * @param {string} [decimalPoint='.'] 小数点符号
   * @param {string} [thousandsSeparator=','] 千分位符号
   * @returns {string} 格式化后的数字
   */
  priceFormat(
    number: number | string,
    decimals: number = 0,
    decimalPoint: string = '.',
    thousandsSeparator: string = ','
  ): string {
    // 将number转换为字符串，并去除非数字、加号、减号、小数点和E/e字符
    number = `${number}`.replace(/[^0-9+-Ee.]/g, '')
    // 将number转换为数字，如果转换失败则默认为0
    const n = !isFinite(+number) ? 0 : +number
    // 保留的小数位数，转换为绝对值并确保其为有限数字
    const prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)
    // 千分位符号
    const sep = thousandsSeparator
    // 小数点符号
    const dec = decimalPoint
    let s: string[] = []

    // 对数字进行四舍五入处理，并转化为字符串
    const round = (num: number, precision: number): number => {
      const factor = Math.pow(10, precision)
      return Math.round(num * factor) / factor
    }

    s = (prec ? round(n, prec).toString() : Math.round(n).toString()).split('.')

    // 正则表达式匹配负号和千分位
    const re = /(-?\d+)(\d{3})/
    while (re.test(s[0])) {
      s[0] = s[0].replace(re, `$1${sep}$2`)
    }

    // 如果小数位数不足，补全0
    if ((s[1] || '').length < prec) {
      s[1] = s[1] || ''
      s[1] += new Array(prec - s[1].length + 1).join('0')
    }

    // 返回格式化后的字符串
    return s.join(dec)
  },
  /**
   * @description 格式化时间
   * @param {string | number | null} dateTime 需要格式化的时间戳
   * @param {string} formatStr 格式化规则 yyyy:mm:dd|yyyy:mm|yyyy年mm月dd日|yyyy年mm月dd日 hh时MM分等,可自定义组合 默认yyyy-mm-dd
   * @returns {string} 返回格式化后的字符串
   */
  timeFormat(
    dateTime: string | number | null = null,
    formatStr: string = 'yyyy-mm-dd'
  ): string {
    let date: Date

    // 若传入时间为假值，则取当前时间
    if (!dateTime) {
      date = new Date()
    }
    // 若为unix秒时间戳，则转为毫秒时间戳（逻辑有点奇怪，但不敢改，以保证历史兼容）
    else if (
      typeof dateTime === 'number' &&
      /^\d{10}$/.test(dateTime.toString().trim())
    ) {
      date = new Date(dateTime * 1000)
    }
    // 若用户传入字符串格式时间戳，new Date无法解析，需做兼容
    else if (typeof dateTime === 'string' && /^\d+$/.test(dateTime.trim())) {
      date = new Date(Number(dateTime))
    }
    // 处理平台性差异，在Safari/Webkit中，new Date仅支持/作为分割符的字符串时间
    // 处理 '2022-07-10 01:02:03'，跳过 '2022-07-10T01:02:03'
    else if (
      typeof dateTime === 'string' &&
      dateTime.includes('-') &&
      !dateTime.includes('T')
    ) {
      date = new Date(dateTime.replace(/-/g, '/'))
    }
    // 其他都认为符合 RFC 2822 规范
    else {
      date = new Date(dateTime)
    }

    const timeSource: { [key: string]: string } = {
      y: date.getFullYear().toString(), // 年
      m: (date.getMonth() + 1).toString().padStart(2, '0'), // 月
      d: date.getDate().toString().padStart(2, '0'), // 日
      h: date.getHours().toString().padStart(2, '0'), // 时
      M: date.getMinutes().toString().padStart(2, '0'), // 分
      s: date.getSeconds().toString().padStart(2, '0'), // 秒
      // 有其他格式化字符需求可以继续添加，必须转化成字符串
    }

    for (const key in timeSource) {
      const match = new RegExp(`${key}+`).exec(formatStr)
      if (match) {
        const [ret] = match
        // 年可能只需展示两位
        const beginIndex = key === 'y' && ret.length === 2 ? 2 : 0
        formatStr = formatStr.replace(ret, timeSource[key].slice(beginIndex))
      }
    }

    return formatStr
  },
  /**
   * @description console.error提示
   * @param {*} err 错误内容
   */
  error(err: any) {
    // 开发环境才提示，生产环境不会提示
    if (process.env.NODE_ENV === 'development') {
      console.error(`错误提示：${err}`)
    }
  },
  /**
   * 从对象中获取属性，支持通过点分割的键路径访问（例如 'a.b.c'）。
   * @param obj 要获取属性的对象。
   * @param key 属性键，使用点分割表示多层属性访问路径。
   * @returns 属性的值，如果找不到则返回 undefined。
   */
  getProperty(obj: any, key: string): any {
    if (!obj) {
      return undefined
    }
    if (typeof key !== 'string' || key === '') {
      return undefined
    }

    if (key.includes('.')) {
      const keys = key.split('.')
      let currentObj = obj

      for (let i = 0; i < keys.length; i++) {
        if (!currentObj) {
          return undefined
        }
        currentObj = currentObj[keys[i]]
      }

      return currentObj
    } else {
      return obj[key]
    }
  },

  /**
   * 设置对象的属性值，支持通过点分割的键路径进行设置。
   * 如果路径不存在，将逐层创建对象。
   * @param obj 要设置属性的对象。
   * @param key 属性键，使用点分割表示多层属性访问路径。
   * @param value 要设置的值。
   */
  setProperty(obj: any, key: string, value: any): void {
    if (!obj) {
      return
    }

    const setValue = function (_obj: any, keys: string[], v: any): void {
      if (keys.length === 1) {
        _obj[keys[0]] = v
        return
      }

      const k = keys[0]
      if (!_obj[k] || typeof _obj[k] !== 'object') {
        _obj[k] = {}
      }

      setValue(_obj[k], keys.slice(1), v)
    }

    if (typeof key !== 'string' || key === '') {
      return
    } else if (key.includes('.')) {
      const keys = key.split('.')
      setValue(obj, keys, value)
    } else {
      obj[key] = value
    }
  },
  /**
   * 显示消息提示框
   * @param title 提示的内容，长度与 icon 取值有关。
   * @param duration 提示的延迟时间，单位毫秒，默认：2000
   */
  toast(title: string, duration: number = 2000): void {
    uni.showToast({
      title: String(title),
      icon: 'none',
      duration,
    })
  },
  /**
* @description 获取父组件的参数，因为支付宝小程序不支持provide/inject的写法
   this.$parent在非H5中，可以准确获取到父组件，但是在H5中，需要多次this.$parent.$parent.xxx
   这里默认值等于undefined有它的含义，因为最顶层元素(组件)的$parent就是undefined，意味着不传name
   值(默认为undefined)，就是查找最顶层的$parent
*  @param {string|undefined} name 父组件的参数名
*/
  // $parent(
  //   name = '',
  //   current = getCurrentInstance()
  // ): ComponentInternalInstance | null {
  //   if (current) {
  //     let parent = current.parent
  //     // 通过while历遍，这里主要是为了H5需要多层解析的问题
  //     while (parent) {
  //       // 父组件
  //       if (
  //         parent.proxy &&
  //         parent.proxy.$options &&
  //         parent.proxy.$options.name !== name
  //       ) {
  //         // 如果组件的name不相等，继续上一级寻找
  //         parent = parent.parent
  //       } else {
  //         return parent
  //       }
  //     }
  //     return null
  //   } else {
  //     return null
  //   }
  // },
  /**
   * 检查变量是否为 undefined 或 null，如果是，则返回默认值；否则返回变量本身。
   *
   * @param variable - 要检查的变量。
   * @param defaultValue - 如果变量为 undefined 或 null 时返回的默认值。默认值为 undefined。
   * @returns 如果变量为 undefined 或 null，则返回 defaultValue；否则返回变量。
   */
  isEmptyVariableInDefault: <T = any>(
    variable: any,
    defaultValue: any = undefined
  ): T => {
    return variable === undefined || variable === null ? defaultValue : variable
  },

  /**
   * 检查两个变量中的一个是否为 undefined 或 null。如果第一个变量为 undefined 或 null，则检查第二个变量；
   * 如果第二个变量也为 undefined 或 null，则返回默认值；否则返回第一个不为 undefined 或 null 的变量。
   *
   * @param variable1 - 要检查的第一个变量。
   * @param variable2 - 要检查的第二个变量。
   * @param defaultValue - 如果两个变量都为 undefined 或 null 时返回的默认值。默认值为 undefined。
   * @returns 如果第一个变量为 undefined 或 null，则返回第二个变量的值（如果第二个变量也为 undefined 或 null，则返回 defaultValue）；否则返回第一个变量。
   */
  isEmptyDoubleVariableInDefault: <T = any>(
    variable1: any,
    variable2: any,
    defaultValue: any = undefined
  ): T => {
    return z.isEmptyVariableInDefault(
      variable1,
      z.isEmptyVariableInDefault(variable2, defaultValue)
    )
  },
}

export default z
