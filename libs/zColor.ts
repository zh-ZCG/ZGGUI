const zColor = {
  /**
   * 通过type获取color
   * @param type 可选（success error warning info primary）
   */
  getTypeColor(type: string): string {
    switch (type) {
      case 'primary':
        return '#409eff'
      case 'success':
        return '#62B51B'
      case 'info':
        return '#909399'
      case 'warning':
        return '#FFC23F'
      case 'error':
        return '#FF543A'
      case 'cw':
        return '#fff'
      case 'cb':
        return '#1a1a1a'
      case 'colorSliderDefault':
        return '#e4e9ec'
      case 'colorGrayLight':
        return '#e4e9ec'
      case 'disabled':
        return `rgba(0,0,0,0.5)`
      default:
        return type
    }
  },

  /**
   * 将十六进制颜色转换为 RGB 表示方式（可选返回字符串或数组）
   * @param sColor 十六进制颜色值
   * @param str 是否返回字符串，默认为 true
   * @returns RGB 表示方式的颜色值
   */
  hexToRgb(sColor: string, str: boolean = true): number[] | string {
    const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
    sColor = String(sColor).toLowerCase()
    if (sColor && reg.test(sColor)) {
      if (sColor.length === 4) {
        let sColorNew = '#'
        for (let i = 1; i < 4; i += 1) {
          sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1))
        }
        sColor = sColorNew
      }
      const sColorChange: number[] = []
      for (let i = 1; i < 7; i += 2) {
        sColorChange.push(parseInt(`0x${sColor.slice(i, i + 2)}`, 16))
      }
      if (!str) {
        return sColorChange
      }
      return `rgb(${sColorChange[0]},${sColorChange[1]},${sColorChange[2]})`
    }
    if (/^(rgb|RGB)/.test(sColor)) {
      const arr = sColor.replace(/(?:\(|\)|rgb|RGB)*/g, '').split(',')
      return arr.map(val => Number(val))
    }
    return sColor
  },

  /**
   * 将 RGB 表示方式转换为十六进制颜色
   * @param rgb RGB 表示方式的颜色值
   * @returns 十六进制表示方式的颜色值
   */
  rgbToHex(rgb: string): string {
    const _this = rgb
    const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
    if (/^(rgb|RGB)/.test(_this)) {
      const aColor = _this.replace(/(?:\(|\)|rgb|RGB)*/g, '').split(',')
      let strHex = '#'
      for (let i = 0; i < aColor.length; i++) {
        let hex = Number(aColor[i]).toString(16)
        hex = String(hex).length == 1 ? `0${hex}` : hex
        if (hex === '0') {
          hex += hex
        }
        strHex += hex
      }
      if (strHex.length !== 7) {
        strHex = _this
      }
      return strHex
    }
    if (reg.test(_this)) {
      const aNum = _this.replace(/#/, '').split('')
      if (aNum.length === 6) {
        return _this
      }
      if (aNum.length === 3) {
        let numHex = '#'
        for (let i = 0; i < aNum.length; i += 1) {
          numHex += aNum[i] + aNum[i]
        }
        return numHex
      }
      return _this
    } else {
      return _this
    }
  },

  /**
   * 计算两个颜色之间的渐变值
   * @param startColor 开始的颜色
   * @param endColor 结束的颜色
   * @param step 颜色等分的份额
   * @returns 渐变过程中的颜色数组
   */
  colorGradient(
    startColor: string = 'rgb(0, 0, 0)',
    endColor: string = 'rgb(255, 255, 255)',
    step: number = 10
  ): string[] {
    const startRGB = this.hexToRgb(startColor, false) as number[]
    const startR = startRGB[0]
    const startG = startRGB[1]
    const startB = startRGB[2]

    const endRGB = this.hexToRgb(endColor, false) as number[]
    const endR = endRGB[0]
    const endG = endRGB[1]
    const endB = endRGB[2]

    const sR: number = (endR - startR) / step
    const sG: number = (endG - startG) / step
    const sB: number = (endB - startB) / step
    const colorArr: string[] = []
    for (let i = 0; i < step; i++) {
      let hex = this.rgbToHex(
        `rgb(${Math.round(sR * i + startR)},${Math.round(
          sG * i + startG
        )},${Math.round(sB * i + startB)})`
      )
      if (i === 0) hex = this.rgbToHex(startColor)
      if (i === step - 1) hex = this.rgbToHex(endColor)
      colorArr.push(hex)
    }
    return colorArr
  },

  /**
   * 将十六进制颜色转换为 RGBA 表示方式
   * @param color 十六进制颜色值
   * @param alpha 透明度
   * @returns RGBA 表示方式的颜色值
   */
  colorToRgba(color: string, alpha: number): string {
    color = this.rgbToHex(color)
    const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
    let sColor = String(color).toLowerCase()
    if (sColor && reg.test(sColor)) {
      if (sColor.length === 4) {
        let sColorNew = '#'
        for (let i = 1; i < 4; i += 1) {
          sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1))
        }
        sColor = sColorNew
      }
      const sColorChange: number[] = []
      for (let i = 1; i < 7; i += 2) {
        sColorChange.push(parseInt(`0x${sColor.slice(i, i + 2)}`, 16))
      }
      return `rgba(${sColorChange.join(',')},${alpha})`
    }
    return sColor
  },
}

export default zColor
