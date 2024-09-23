import { getCurrentInstance } from 'vue'

import type { ComponentInternalInstance } from 'vue'

import z from '@/ZGGUI/libs/z'
//组件的共同方法

interface PropsTypeHook {
  otherStyle: object | any
  otherClass: string
  url: string
  linkType: string
}

const propsHook: PropsTypeHook = {
  otherStyle: () => ({}),
  otherClass: '',
  url: '',
  linkType: 'navigateTo',
}

// 跳转某一个页面
const openPage = (url: string, linkType: string = 'navigateTo') => {
  if (url) {
    ;(uni as any)[linkType]({ url })
  }
}

export { PropsTypeHook, propsHook, openPage }
