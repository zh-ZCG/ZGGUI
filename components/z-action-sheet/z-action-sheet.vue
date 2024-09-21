<!--
 * @Description: z-action-sheet 操作菜单组件
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
  reactive,
} from 'vue'
import z from '@/ZCGUI/libs/z'
import zPopup from '@/ZCGUI/components/z-popup/z-popup.vue'
import { propsHook, PropsTypeHook } from '@/ZCGUI/libs/zHooks'
import { isBoolean } from '@/ZCGUI/libs/lodash'
import { isPromise } from '@vue/shared'
/**
 * @description: z-action-sheet 操作菜单组件传参
 * @param: bgColor 背景颜色 （默认 'transparent' ）
 * @param: height		 分割高度, （默认 20px ）
 * @param: marginTop	与上一个组件的距离，（ 默认 0px ）
 * @param: marginBottom  与下一个组件的距离，（默认 0px ）
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZCGUI & ui.zcgui.cn & zcgamazing@163.com
 * @example:
 */

interface ActionSheetAction {
  /**
   * @description 选项文字
   */
  text: string
  /**
   * @description 选项备注
   */
  desc?: string
  /**
   * @description 选项的值
   */
  value?: string | number
}

/**
 * @description ActionSheet options配置项
 */
interface ActionSheetOptions {
  /**
   * @description 选项列表
   */
  actions: ActionSheetAction[]
  /**
   * @description 标题
   */
  title?: string
  /**
   * @description 取消按钮文字，如果为空则不显示取消按钮
   */
  cancelText?: string
  /**
   * @description 是否显示遮罩
   */
  mask?: boolean
  /**
   * @description 点击取消按钮触发的回调函数，返回 false 或者返回 Promise 且被 reject 则取消关闭
   */
  cancel?: () => (Promise<boolean> | void) | boolean
  /**
   * @description 点击选项触发的回调函数，返回 false 或者返回 Promise 且被 reject 则取消关闭
   */
  select?: (
    index: number,
    value: string | number
  ) => (Promise<boolean> | void) | boolean
}

interface PropsType extends PropsTypeHook {
  zIndex: number
}

interface EmitsType {}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  zIndex: 550,
})

const emits = defineEmits<EmitsType>()

const instance = getCurrentInstance()
if (!instance) {
  z.error('zActionSheet 请在 setup 中使用 useActionSheet')
}

const { slots } = instance!

// 默认配置项
const defaultOptions: ActionSheetOptions = {
  actions: [],
  title: '',
  cancelText: '取 消',
  mask: true,
  cancel: undefined,
  select: undefined,
}
// 配置项
const options = reactive<ActionSheetOptions>({
  actions: [],
  title: '',
  cancelText: '取 消',
  mask: true,
  cancel: undefined,
  select: undefined,
})

// 操作菜单数据
const data = computed(() => options.actions)
// 是否显示标题
const showTitle = computed(() => !!slots?.title || !!options.title)
const title = computed(() => options.title)
// 是否显示取消按钮
const showCancel = computed(() => !!slots?.cancel || !!options.cancelText)
const cancelText = computed(() => options.cancelText)
// 是否显示遮罩
const overlay = computed(() => {
  return options.mask === undefined ? true : options.mask
})

// 弹出popup弹框
const openPopup = ref<boolean>(false)

// popup弹框关闭事件
const popupCloseEvent = () => {
  if (!options.cancel) {
    openPopup.value = false
    return
  }

  const shouldCancel = options.cancel()
  const isPromiseOrBoolean = [
    isPromise(shouldCancel),
    isBoolean(shouldCancel),
  ].includes(true)
  if (!isPromiseOrBoolean) {
    z.error('zActionSheet cancel 函数返回值必须是 Promise 或者 Boolean 类型')
    return
  }

  if (isPromise(shouldCancel)) {
    shouldCancel.then(res => {
      if (res) {
        openPopup.value = false
      }
    })
  } else {
    if (shouldCancel) {
      openPopup.value = false
    }
  }
}

// 选项点击事件
const actionClickEvent = (index: number) => {
  if (!options.select) {
    openPopup.value = false
    return
  }

  const shouldSelect = options.select(index, options.actions[index].value!)
  const isPromiseOrBoolean = [
    isPromise(shouldSelect),
    isBoolean(shouldSelect),
  ].includes(true)
  if (!isPromiseOrBoolean) {
    z.error('zActionSheet select 函数返回值必须是 Promise 或者 Boolean 类型')
    return
  }

  if (isPromise(shouldSelect)) {
    shouldSelect.then(res => {
      if (res) {
        openPopup.value = false
      }
    })
  } else {
    if (shouldSelect) {
      openPopup.value = false
    }
  }
}

const showActionSheet = (_options: ActionSheetOptions) => {
  Object.assign(options, defaultOptions, _options)
  openPopup.value = true
}

defineExpose({
  show: showActionSheet,
})
</script>

<template>
  <zPopup
    :show="openPopup"
    :overlay="overlay"
    :zIndex="zIndex"
    :clickCloseOverlay="false"
    @close="popupCloseEvent"
  >
    <div class="pr z-action-sheet">
      <!-- 标题 -->
      <div v-if="showTitle" class="df jcc aic title">
        <slot name="title">
          {{ title }}
        </slot>
      </div>

      <!-- 选项 -->
      <div class="actions">
        <div
          v-for="(item, index) in data"
          :key="index"
          class="action dfc jcc aic"
          hover-class="btn-hover"
          :hover-stay-time="150"
          @tap.stop="actionClickEvent(index)"
        >
          <!-- 选项显示内容 -->
          <div class="text">{{ item.text }}</div>
          <!-- 选项描述 -->
          <div v-if="item.desc" class="desc">{{ item.desc }}</div>
        </div>
      </div>

      <!-- 取消按钮 -->
      <div
        v-if="showCancel"
        class="cancel df jcc aic"
        hover-class="btn-hover"
        :hover-stay-time="150"
        @tap.stop="popupCloseEvent"
      >
        <slot name="cancel">
          {{ cancelText }}
        </slot>
      </div>
    </div>
  </zPopup>
</template>

<style lang="less" scoped>
.z-action-sheet {
  width: 100%;
  background-color: #fff;
  border-radius: 15rpx 15rpx 0rpx 0rpx;
  margin-top: 30rpx;
  .title {
    padding: 22rpx;
    color: #666666;
    border-bottom: 8rpx solid #eeeeee;
    font-size: 26rpx;
  }
  .actions {
    width: 100%;
    .action {
      padding: 30rpx;
      border-bottom: 1rpx solid #eeeeee;
      .desc {
        font-size: 24rpx;
        color: rgba(0, 0, 0, 0.5);
        margin-top: 8rpx;
      }
    }
    .btn-hover {
      background-color: #eeeeee;
      opacity: 0.8;
    }
  }
  .cancel {
    padding: 26rpx;
    border-top: 10rpx solid #eeeeee;
    color: @error;
  }
  .btn-hover {
    background-color: #eeeeee;
    opacity: 0.8;
  }
}
</style>
