<!--
 * @Description: z-index-list 索引列表组件
 * @Author: ZGGUI & ui.zggui.cn & zggamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
// #ifdef MP-WEIXIN
<script lang="ts">
export default {
  options: {
    // 在微信小程序中将组件节点渲染为虚拟节点，更加接近Vue组件的表现(不会出现shadow节点下再去创建元素)
    virtualHost: true,
  },
}
</script>
// #endif
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
import z from '@/ZGGUI/libs/z'
import zColor from '@/ZGGUI/libs/zColor'
import type { ExtractPropTypes } from 'vue'
import { useUniAppSystemRectInfo } from '@/ZGGUI/libs/use-uniapp-system-rect-info/use-uniapp-system-rect-info'
import { useComponentSize } from '@/ZGGUI/libs/use-component-size/use-component-size'
import { useTouch } from '@/ZGGUI/libs/use-Touch/use-Touch'
import zSticky from '@/ZGGUI/components/z-sticky/z-sticky.vue'
import { propsHook, PropsTypeHook } from '@/ZGGUI/libs/zHooks'
/**
 * @description: z-index-list 索引列表组件传参
 * @param: data 数据
 * @param: height	索引列表的高度
 * @param: stickyOffsetTop	标题吸顶距离，单位 `px`
 * @param: titleBgColor  标题背景颜色
 * @param: titleColor  标题文字颜色
 * @param: titleSize  标题尺寸,small、normal、large、xlarge
 * @param: showKeysList  是否显示右侧索引列表
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zggui.cn & zggamazing@163.com
 * @example:
 */
const indexListKeys = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  '#',
] as const

type IndexListKeys = (typeof indexListKeys)[number]

interface IndexListDataItem<T = any> {
  title: string
  data: IndexListDataItemData<T>[]
}

type IndexListData<T = any> = Partial<
  Record<IndexListKeys, IndexListDataItem<T>>
>

type IndexListDataItemData<T = any> = T & {
  star?: boolean
}

//////

interface IndexListDataItemType {
  key: string
  title: string
  data: any[]
}

type IndexListDataType = IndexListDataItemType[]

interface KeyListRectInfo {
  top: number
  height: number
}

interface PropsType extends PropsTypeHook {
  data?: IndexListData
  height?: number
  stickyOffsetTop?: number
  titleBgColor?: string
  titleColor?: string
  titleSize?: string
  showKeysList?: boolean
}

interface EmitsType {
  (e: 'click', key: IndexListKeys): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  data: () => ({}),
  stickyOffsetTop: 0,
  showKeysList: true,
})

const emits = defineEmits<EmitsType>()

const instance = getCurrentInstance()
if (!instance) {
  z.error('zIndexList 请在 setup 中使用 useIndexList')
}

const componentId = instance?.uid
const componentContentClass = `z-index-list-content-${componentId}`
const componentKeyListId = `z-index-list-key-list-${componentId}`

// 索引列表数据
const keysData = computed<string[]>(() => Object.keys(props.data))

// 列表数据
const listData = ref<IndexListDataType>([])
watch(
  () => props.data,
  (val) => {
    // 带星标的数据
    const starData: IndexListDataItemType = {
      key: '★',
      title: '★',
      data: [],
    }
    listData.value = Object.entries(val).map(([key, value]) => {
      starData.data = starData.data.concat(
        value.data.filter((item) => item?.star)
      )
      return {
        key,
        title: value.title,
        data: value.data,
      }
    })
    if (starData.data.length) {
      if (!keysData.value.includes('★')) {
        keysData.value.unshift('★')
      }
      listData.value.unshift(starData)
    }
  },
  {
    immediate: true,
  }
)

// 容器的高度
const { systemScreenInfo } = useUniAppSystemRectInfo()
const contentContainerHeight = computed<number>(
  () => props.height || systemScreenInfo.height - props.stickyOffsetTop
)

// 内容节点的top值
let contentTopValues: number[] = []
// scroll-view的top值
const scrollViewTopValue = ref<number>(0)

// 获取全部列表项的节点信息
let initCount = 0
const getContentItemNodeInfo = async () => {
  try {
    const contentNodeInfos = await z.getDomInfos(
      `.${componentContentClass}`,
      instance
    )

    initCount = 0
    contentTopValues = contentNodeInfos.map((item) => item.top || 0)
  } catch (err) {
    if (initCount > 10) {
      initCount = 0
      z.error(`zIndexList 获取全部列表项的节点信息失败：${err}`)
      return
    }
    initCount++
    setTimeout(() => {
      getContentItemNodeInfo()
    }, 150)
  }
}

const {
  currentY: keyListTouchCurrentY,
  updateOptions: updateKeyListTouchOptions,
  onTouchStart: keyListTouchStartEvent,
  onTouchMove: keyListTouchMoveEvent,
  onTouchEnd: keyListTouchEndEvent,
} = useTouch()
// 获取索引列表的容器信息
let keyListTop = 0
let keyListItemRectInfo: KeyListRectInfo[] = []
const getKeyListNodeInfo = async () => {
  try {
    const keyListNodeInfo = await z.getDomInfo(
      `#${componentKeyListId}`,
      instance
    )
    const keyListItemNodeInfo = await z.getDomInfos(
      `#${componentKeyListId} .key-value`,
      instance
    )

    initCount = 0
    keyListTop = keyListNodeInfo.top || 0
    keyListItemRectInfo = keyListItemNodeInfo.map((item) => {
      return {
        top: (item.top || 0) - keyListTop,
        height: item.height || 0,
      }
    })
    updateKeyListTouchOptions({
      left: keyListNodeInfo.left,
      right: keyListNodeInfo.right,
      top: keyListNodeInfo.top,
      bottom: keyListNodeInfo.bottom,
    })
  } catch (err) {
    if (initCount > 10) {
      initCount = 0
      z.error(`zIndexList 获取索引列表的容器信息失败：${err}`)
      return
    }
    initCount++
    setTimeout(() => {
      getKeyListNodeInfo()
    }, 150)
  }
}

// 提示框的top值
const keyListTipsTopValue = ref<number>(0)

const currentTouchKeyIndex = ref<number>(-1)
const currentTouchKeyValue = computed<string>(
  () => keysData.value[currentTouchKeyIndex.value]
)
// 设置当前滑动、点击索引的值
const updateKeyListIndexValue = () => {
  // 判断当前滑动位置在哪里
  let index = -1
  // #ifndef APP-PLUS || MP-ALIPAY
  index = keyListItemRectInfo.findLastIndex(
    (item) => item.top < keyListTouchCurrentY.value
  )
  // #endif
  // #ifdef APP-PLUS || MP-ALIPAY
  index = keyListItemRectInfo.findIndex(
    (item) => item.top > keyListTouchCurrentY.value
  )
  index = index - 1
  // #endif
  if (index !== -1) {
    const keyListRectItem = keyListItemRectInfo[index]
    keyListTipsTopValue.value = keyListRectItem.top + keyListRectItem.height / 2

    const top = contentTopValues[index]
    scrollViewTopValue.value = top - contentTopValues[0]
    // #ifdef MP-ALIPAY
    scrollViewTopValue.value = scrollViewTopValue.value + 1
    // #endif

    currentTouchKeyIndex.value = index
  }
}

// 触摸事件
const onKeyListTouchStart = (event: any) => {
  keyListTouchStartEvent(event)
}
const onKeyListTouchMove = (event: any) => {
  keyListTouchMoveEvent(event)
  updateKeyListIndexValue()
}
const onKeyListTouchEnd = (event: any) => {
  console.log(event)
  keyListTouchEndEvent(event)
  updateKeyListIndexValue()

  emits('click', currentTouchKeyValue.value as IndexListKeys)
  currentTouchKeyIndex.value = -1
}

onMounted(() => {
  // #ifndef APP-PLUS || MP-ALIPAY
  nextTick(() => {
    getContentItemNodeInfo()
    if (props.showKeysList) getKeyListNodeInfo()
  })
  // #endif
  // #ifdef APP-PLUS || MP-ALIPAY
  setTimeout(() => {
    getContentItemNodeInfo()
    if (props.showKeysList) getKeyListNodeInfo()
  }, 500)
  // #endif
})

// 解析尺寸
const { sizeType } = useComponentSize(props.titleSize)

// 标题的类
const titleClass = computed<string>(() => {
  const cls: string[] = ['title']

  return cls.join(' ')
})

// 标题的样式
const titleStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  style.backgroundColor = zColor.getTypeColor(
    props.titleBgColor || zColor.getTypeColor('colorGrayLight')
  )

  style.color = zColor.getTypeColor(
    props.titleColor || zColor.getTypeColor('disabled')
  )

  if (props.titleSize && sizeType.value === 'custom')
    style.fontSize = z.addUnit(props.titleSize)
  else if (props.titleSize && sizeType.value === 'inner') {
    switch (props.titleSize) {
      case 'small': {
        style.fontSize = '24rpx'
        break
      }
      case 'normal': {
        style.fontSize = '28rpx'
        break
      }
      case 'large': {
        style.fontSize = '32rpx'
        break
      }
      case 'xlarge': {
        style.fontSize = '36rpx'
        break
      }
    }
  }

  return style
})
</script>

<template>
  <div
    class="z-index-list pr"
    :style="{ height: `${contentContainerHeight}px` }"
  >
    <!-- 列表内容 -->
    <scroll-view
      class="scroll-view pr"
      scroll-y
      :scroll-top="scrollViewTopValue"
    >
      <div
        :style="{
          paddingTop: `${stickyOffsetTop || 0}px`,
        }"
      >
        <div
          v-for="(item, index) in listData"
          :key="index"
          :class="[componentContentClass]"
        >
          <zSticky :offset-top="stickyOffsetTop">
            <div :class="[titleClass]" :style="titleStyle">
              {{ item.title }}
            </div>
          </zSticky>
          <div class="content">
            <div
              v-for="(dataItem, dataIndex) in item.data"
              :key="dataIndex"
              class="content-item"
            >
              <slot :data="dataItem"></slot>
            </div>
          </div>
        </div>
      </div>
    </scroll-view>

    <!-- 右侧索引 -->
    <div
      v-if="showKeysList"
      :id="componentKeyListId"
      class="key-list pa dfc aic jcc"
      @touchstart.stop.prevent="onKeyListTouchStart"
      @touchmove.stop.prevent="onKeyListTouchMove"
      @touchend.stop.prevent="onKeyListTouchEnd"
    >
      <div
        v-for="(item, index) in keysData"
        :key="index"
        class="key-list-value key-value"
      >
        {{ item }}
      </div>

      <!-- 提示框 -->
      <div
        v-if="currentTouchKeyIndex !== -1"
        class="key-list-tips-value pa df aic jcc fwb"
        :style="{ top: `${keyListTipsTopValue}px` }"
      >
        {{ currentTouchKeyValue }}
        <div class="auxiliary-element pa"></div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-index-list {
  width: 100%;
  .scroll-view {
    height: 100%;
    .title {
      padding: 4rpx 24rpx;
    }
  }
  .key-list {
    right: 4%;
    top: 50%;
    transform: translate(50%, -50%);
    z-index: 99999;
    font-size: 24rpx;
    .key-list-value {
      padding: 4rpx 0rpx;
      text-align: center;
    }
    .key-list-tips-value {
      top: 0;
      left: -80rpx;
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      background-color: @colorBorderLighter;
      color: @info;
      transform: translate(-50%, -50%);
      font-size: 46rpx;
      line-height: 1;
      .auxiliary-element {
        height: 0;
        width: 0;
        right: 0;
        top: 50%;
        border-color: transparent transparent transparent @colorBorderLighter;
        border-width: 30rpx;
        border-style: solid;
        transform: translate(47rpx, -50%);
      }
    }
  }
}
</style>
