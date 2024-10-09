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

      case 'bgDefault':
        return '#f3f4f6'
      case 'grayLight':
        return '#f8f7f8'
      case 'colorInfo':
        return '#909399'
      case 'colorPrimary':
        return '#409eff'
      case 'colorPrimaryLight':
        return 'rgb(236, 245, 255)'
      case 'colorPrimaryText':
        return '#303133'
      case 'colorRegularText':
        return '#606266'
      case 'colorBorderBase':
        return '#dcefe6'
      case 'colorBorderLighter':
        return '#ebeef5'
      case 'colorError':
        return '#f56c6c'
      case 'colorBackgroundBase':
        return '#f5f7fa'
      case 'colorSuccess':
        return '#67c23a'
      case 'colorWarning':
        return '#e6a23c'
      case 'colorPlaceholder':
        return '#c0c4cc'
      case 'colorGray':
        return 'rgb(228, 231, 237)'
      case 'colorRed':
        return 'red'
      case 'colorOrange':
        return 'rgb(248, 108, 2)'
      case 'colorPurple':
        return 'rgb(192, 29, 221)'
      case 'colorCyan':
        return 'rgb(93, 252, 225)'
      case 'colorLightCyan':
        return 'rgb(0, 207, 253)'

      case 'cp1':
        return '#D8F3FF'
      case 'cp2':
        return '#B2E3FF'
      case 'cp3':
        return '#8CD0FF'
      case 'cp4':
        return '#6FBDFF'
      case 'cp5':
        return '#409EFF'
      case 'cp6':
        return '#2E7BDB'
      case 'cp7':
        return '#205BB7'
      case 'cp8':
        return '#144093'
      case 'cp9':
        return '#0C2C7A'
      case 'cs1':
        return '#EDFBD0'
      case 'cs2':
        return '#D7F7A3'
      case 'cs3':
        return '#B5E871'
      case 'cs4':
        return '#91D24C'
      case 'cs5':
        return '#62B51B'
      case 'cs6':
        return '#4B9B13'
      case 'cs7':
        return '#36820D'
      case 'cs8':
        return '#256808'
      case 'cs9':
        return '#195605'
      case 'ci1':
        return '#FDFDFD'
      case 'ci2':
        return '#FCFCFC'
      case 'ci3':
        return '#F7F7F7'
      case 'ci4':
        return '#F0F0F0'
      case 'ci5':
        return '#e6e6e6'
      case 'ci6':
        return '#000000'
      case 'ci7':
        return '#000000'
      case 'ci8':
        return '#000000'
      case 'ci9':
        return '#000000'
      case 'cw1':
        return '#FFF7D8'
      case 'cw2':
        return '#FFEEB2'
      case 'cw3':
        return '#FFE18B'
      case 'cw4':
        return '#FFD56F'
      case 'cw5':
        return '#FFC23F'
      case 'cw6':
        return '#DB9E2E'
      case 'cw7':
        return '#B77D1F'
      case 'cw8':
        return '#935E14'
      case 'cw9':
        return '#7A480C'
      case 'ce1':
        return '#FFE9D7'
      case 'ce2':
        return '#FFCDB0'
      case 'ce3':
        return '#FFAB88'
      case 'ce4':
        return '#FF8A6B'
      case 'ce5':
        return '#FF543A'
      case 'ce6':
        return '#DB332A'
      case 'ce7':
        return '#B71D21'
      case 'ce8':
        return '#931220'
      case 'ce9':
        return '#7A0B1F'

      // 常见颜色
      case 'cblack1':
        return '#000000'
      case 'cblack2':
        return '#1a1a1a'
      case 'cblack3':
        return '#333333'
      case 'cblack4':
        return '#4d4d4d'
      case 'cblack5':
        return '#666666'
      case 'cgray1':
        return '#808080'
      case 'cgray2':
        return '#999999'
      case 'cgray3':
        return '#b3b3b3'
      case 'cgray4':
        return '#cccccc'
      case 'cgray5':
        return '#e6e6e6'
      case 'cred1':
        return '#ff0000'
      case 'cred2':
        return '#FF503F'
      case 'cred3':
        return '#FF8066'
      case 'cred4':
        return '#FFB399'
      case 'cred5':
        return '#FFDDCC'
      case 'cpink1':
        return '#FFC0CB'
      case 'cpink2':
        return '#FFCFD3'
      case 'cpink3':
        return '#FFD9D9'
      case 'cpink4':
        return '#FFE8E5'
      case 'cpink5':
        return '#FFF4F2'
      case 'corange1':
        return '#FFA500'
      case 'corange2':
        return '#FFC23F'
      case 'corange3':
        return '#FFD466'
      case 'corange4':
        return '#FFE699'
      case 'corange5':
        return '#FFF4CC'
      case 'cyellow1':
        return '#FFFF00'
      case 'cyellow2':
        return '#FFFF3F'
      case 'cyellow3':
        return '#FFFF66'
      case 'cyellow4':
        return '#ffff99'
      case 'cyellow5':
        return '#ffffcc'
      case 'cgreen1':
        return '#38B73D'
      case 'cgreen2':
        return '#6AD365'
      case 'cgreen3':
        return '#95E988'
      case 'cgreen4':
        return '#C2F7B3'
      case 'cgreen5':
        return '#E3FBD8'
      case 'cblue1':
        return '#409eff'
      case 'cblue2':
        return '#6FBDFF'
      case 'cblue3':
        return '#8CD0FF'
      case 'cblue4':
        return '#B2E3FF'
      case 'cblue5':
        return '#D8F3FF'
      case 'cbluegray1':
        return '#668cff'
      case 'cbluegray2':
        return '#8CABFF'
      case 'cbluegray3':
        return '#A3BEFF'
      case 'cbluegray4':
        return '#C1D5FF'
      case 'cbluegray5':
        return '#E0EBFF'
      case 'ccyan1':
        return '#00ffff'
      case 'ccyan2':
        return '#3FFFEE'
      case 'ccyan3':
        return '#66FFE4'
      case 'ccyan4':
        return '#99FFE4'
      case 'ccyan5':
        return '#CCFFED'
      case 'cpurple1':
        return '#800080'
      case 'cpurple2':
        return '#B22CA7'
      case 'cpurple3':
        return '#D856C2'
      case 'cpurple4':
        return '#F291D9'
      case 'cpurple5':
        return '#F8C6E7'
      case 'cbrown1':
        return '#8b4513'
      case 'cbrown2':
        return '#a05a2a'
      case 'cbrown3':
        return '#b87333'
      case 'cbrown4':
        return '#cc9966'
      case 'cbrown5':
        return '#e6b886'

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
      return arr.map((val) => Number(val))
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
