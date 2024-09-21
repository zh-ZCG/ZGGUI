<!--
 * @Description: z-footer 页脚组件
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
  CSSProperties,
} from 'vue'
import z from '@/ZCGUI/libs/z'
import { propsHook, PropsTypeHook } from '@/ZCGUI/libs/zHooks'
import zIphoneBottom from '@/ZCGUI/components/z-iphone-bottom/z-iphone-bottom.vue'
/**
 * @description: z-footer 页脚组件传参
 * @param: content 页脚内容
 * @param: navigator	页脚导航信息
 * @param: textColor	内容字体颜色
 * @param: size  页脚字体尺寸大小
 * @param: navigatorTextColor  导航信息字体颜色
 * @param: offsetBottom  页脚距离底部的距离
 * @param: fixed  是否固定在底部
 * @param: fixedMode  固定在底部的方式
 * @param: safeAreaInsetBottom  是否开启底部安全边距
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZCGUI & ui.zcgui.cn & zcgamazing@163.com
 * @example:
 */

interface FooterNavigator {
  /**
   * @description 导航标题
   */
  title: string
  /**
   * @description 导航链接
   */
  url?: string
  /**
   * @description 导航连接字体颜色
   */
  textColor?: string
}

type FooterNavigatorData = FooterNavigatorItem[]

type footerFixedMode = 'page' | 'container'

interface PropsType extends PropsTypeHook {
  content?: string
  navigator?: FooterNavigatorData
  textColor?: string
  size?: string
  navigatorTextColor?: string
  offsetBottom?: string
  fixed?: boolean
  fixedMode?: footerFixedMode
  safeAreaInsetBottom?: boolean
}

interface EmitsType {
  (e: 'click'): void
  (e: 'navigatorClick', navigator: FooterNavigator): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  navigator: () => [],
  fixed: true,
  fixedMode: 'container',
  safeAreaInsetBottom: true,
})

const emits = defineEmits<EmitsType>()

// 页脚点击事件
const footerClickEvent = () => {
  emits('click')
}

// 页脚导航点击事件
const navigatorClickEvent = (item: FooterNavigatorItem) => {
  emits('navigatorClick', item)
}

interface FooterNavigatorItem {
  title: string
  url: string
  textColor: string
}

type FooterNavigatorStyleType = (item: FooterNavigatorItem) => CSSProperties

// 页脚的样式
const footerStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  if (props.offsetBottom) style.bottom = z.addUnit(props.offsetBottom)

  if (props.size) {
    style.fontSize = z.addUnit(props.size)
  }

  // 是否固定在底部
  if (props.fixed) {
    style.left = 0
    style.bottom = 0
    style.position = 'fixed'
  }

  return style
})

// 页脚内容的样式
const contentStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  // 设置颜色
  if (props.textColor) style.color = props.textColor || '#666666'

  return style
})

// 页脚导航的样式
const navigatorStyle = computed<FooterNavigatorStyleType>(() => {
  return (item: FooterNavigatorItem) => {
    const style: CSSProperties = {}

    // 设置颜色
    if (item.textColor) style.color = item.textColor || '#666666'

    return style
  }
})

// 导航数据
const navigatorData = computed<FooterNavigatorData>(() => {
  return props.navigator.map(nav => {
    return {
      title: nav.title || '',
      url: nav?.url || '',
      textColor: nav?.textColor ? nav?.textColor : '',
    }
  })
})
</script>

<template>
  <div
    class="z-footer pr dfc aic jcc"
    :style="footerStyle"
    @tap.stop="footerClickEvent"
  >
    <!-- 导航内容 -->
    <div v-if="navigatorData.length" class="df aic navigators">
      <div
        v-for="(item, index) in navigatorData"
        :key="index"
        class="navigator pr"
        :style="navigatorStyle(item)"
        @tap.stop="navigatorClickEvent(item)"
      >
        {{ item.title }}
      </div>
    </div>

    <!-- 页脚内容 -->
    <div v-if="content" class="content" :style="contentStyle">
      {{ content }}
    </div>
    <zIphoneBottom v-if="props.safeAreaInsetBottom"></zIphoneBottom>
  </div>
</template>

<style lang="less" scoped>
.z-footer {
  width: 100%;
  .navigators {
    padding-bottom: 10rpx;
    .navigator {
      & + & {
        padding-left: 30rpx;

        &::before {
          content: '';
          position: absolute;
          left: 15rpx;
          top: 50%;
          width: 1rpx;
          height: 60%;
          background-color: rgba(0, 0, 0, 0.5);
          transform: translate(0, -50%);
        }
      }
    }
  }
}
</style>
