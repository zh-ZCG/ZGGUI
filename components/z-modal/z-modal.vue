<!--
 * @Description: z-modal 模态框组件
 * @Author: ZGGUI & ui.zggui.cn & zcgamazing@163.com
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
import z from '@/ZGGUI/libs/z'
import zType from '@/ZGGUI/libs/zType'
import zColor from '@/ZGGUI/libs/zColor'
import zPopup from '@/ZGGUI/components/z-popup/z-popup.vue'
import { propsHook, PropsTypeHook } from '@/ZGGUI/libs/zHooks'
/**
 * @description: z-modal 模态框组件传参
 * @param: zIndex zIndex(默认1500)
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * @example:
 */

/**
 * @description Modal配置项
 */
interface ModalOptions {
  /**
   * @description 内容
   */
  content: string
  /**
   * @description 标题
   */
  title?: string
  /**
   * @description 是否显示取消按钮
   */
  showCancel?: boolean
  /**
   * @description 取消按钮的文字
   */
  cancelText?: string
  /**
   * @description 取消按钮的样式
   */
  cancelStyle?: ModalBtnStyle
  /**
   * @description 确认按钮的文字
   */
  confirmText?: string
  /**
   * @description 确认按钮的样式
   */
  confirmStyle?: ModalBtnStyle
  /**
   * @description 是否显示遮罩
   */
  mask?: boolean
  /**
   * @description 是否允许点击遮罩关闭
   */
  maskClosable?: boolean
  /**
   * @description 点击取消按钮触发的回调函数，返回 false 或者返回 Promise 且被 reject 则取消关闭
   */
  cancel?: () => (Promise<boolean> | void) | boolean
  /**
   * @description 点击确认按钮触发的回调函数，返回 false 或者返回 Promise 且被 reject 则取消关闭
   */
  confirm?: () => (Promise<boolean> | void) | boolean
}

interface ModalBtnStyle {
  /**
   * @description 按钮的背景色
   */
  bgColor?: string
  /**
   * @description 按钮的文字颜色
   */
  color?: string
}

interface PropsType extends PropsTypeHook {
  zIndex?: number
}

interface EmitsType {}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  zIndex: 1500,
})

const emits = defineEmits<EmitsType>()

const openModal = ref(false)

// 弹框标题
const title = ref<Required<ModalOptions>['title']>('')

// 弹框内容
const content = ref<Required<ModalOptions>['content']>('')

// 是否显示取消按钮
const showCancel = ref<Required<ModalOptions>['showCancel']>(false)

// 取消按钮的文字
const cancelText = ref<Required<ModalOptions>['cancelText']>('')

// 取消按钮的样式
const cancelStyle = ref<Required<ModalOptions>['cancelStyle']>({})

// 确认按钮的文字
const confirmText = ref<Required<ModalOptions>['confirmText']>('')

// 确认按钮的样式
const confirmStyle = ref<Required<ModalOptions>['confirmStyle']>({})

// 是否显示遮罩
const mask = ref<Required<ModalOptions>['mask']>(true)

// 是否允许点击遮罩关闭
const maskClosable = ref<Required<ModalOptions>['maskClosable']>(false)

// 点击取消按钮触发的回调函数
const cancelFunc = ref<ModalOptions['cancel']>(undefined)

// 点击确认按钮触发的回调函数
const confirmFunc = ref<ModalOptions['confirm']>(undefined)

// 打开弹窗
const showModal = (options: ModalOptions) => {
  openModal.value = true

  title.value = z.isEmptyVariableInDefault(options.title, '')
  content.value = options.content

  showCancel.value = z.isEmptyVariableInDefault(options?.showCancel, false)
  cancelText.value = z.isEmptyVariableInDefault(options?.cancelText, '取 消')
  cancelStyle.value = z.isEmptyVariableInDefault(options?.cancelStyle, {})
  confirmText.value = z.isEmptyVariableInDefault(options?.confirmText, '确 认')
  confirmStyle.value = z.isEmptyVariableInDefault(options?.confirmStyle, {})
  mask.value = z.isEmptyVariableInDefault(options?.mask, true)
  maskClosable.value = z.isEmptyVariableInDefault(options?.maskClosable, false)
  cancelFunc.value = options?.cancel
  confirmFunc.value = options?.confirm
}

// 关闭弹窗
const closeModal = () => {
  openModal.value = false
}

// 点击取消按钮
const clickCancel = () => {
  if (!cancelFunc.value) {
    closeModal()
    return
  }

  const func = cancelFunc.value()

  const isPromiseOrBool = [
    zType.isPromise(func),
    zType.isBoolean(func),
  ].includes(true)

  if (!isPromiseOrBool) {
    // 传递的是普通函数
    closeModal()
    return
  }

  if (zType.isPromise(func)) {
    func
      .then((res) => {
        if (res) closeModal()
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn(`${err}`)
      })
  } else if (func) {
    closeModal()
  }
}

// 点击确认按钮
const clickConfirm = () => {
  if (!confirmFunc.value) {
    closeModal()
    return
  }

  const func = confirmFunc.value()

  const isPromiseOrBool = [
    zType.isPromise(func),
    zType.isBoolean(func),
  ].includes(true)

  if (!isPromiseOrBool) {
    // 传递的是普通函数
    closeModal()
    return
  }

  if (zType.isPromise(func)) {
    func
      .then((res) => {
        if (res) closeModal()
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn(`${err}`)
      })
  } else if (func) {
    closeModal()
  }
}

const NewConfirmStyle = ref<ModalBtnStyle>({})
const NewCancelStyle = ref<ModalBtnStyle>({})

watch(
  () => confirmStyle,
  (value) => {
    NewConfirmStyle.value.bgColor = value.value.bgColor
    NewConfirmStyle.value.color = value.value.color
  },
  {
    deep: true,
  }
)
watch(
  () => cancelStyle,
  (value) => {
    NewCancelStyle.value.bgColor = value.value.bgColor
    NewCancelStyle.value.color = value.value.color
  },
  {
    deep: true,
  }
)

type OperationBtnComputedClass = (type: 'cancel' | 'confirm') => string
type OperationBtnComputedStyle = (type: 'cancel' | 'confirm') => CSSProperties

// 操作按钮所属类
const operationBtnClass = computed<OperationBtnComputedClass>(() => {
  return (type: 'cancel' | 'confirm') => {
    const cls: string[] = ['operation-btn', `operation-btn-${type}`]

    return cls.join(' ')
  }
})

// 操作按钮的样式
const operationBtnStyle = computed<OperationBtnComputedStyle>(() => {
  return (type: 'cancel' | 'confirm') => {
    const style: CSSProperties = {}

    if (type === 'cancel') {
      if (NewCancelStyle.value.bgColor)
        style.backgroundColor = zColor.getTypeColor(
          NewCancelStyle.value.bgColor
        )

      style.color = zColor.getTypeColor(
        NewCancelStyle.value.color ? NewCancelStyle.value.color : 'error'
      )
    }
    if (type === 'confirm') {
      if (NewConfirmStyle.value.bgColor)
        style.backgroundColor = zColor.getTypeColor(
          NewConfirmStyle.value.bgColor
        )

      style.color = zColor.getTypeColor(
        NewConfirmStyle.value.color ? NewConfirmStyle.value.color : 'primary'
      )
    }

    return style
  }
})

defineExpose({
  /**
   * @description 打开模态框
   */
  showModal,
})
</script>

<template>
  <zPopup
    :show="openModal"
    :mode="'center'"
    borderRadius="0"
    width="80%"
    :overlay="mask"
    :clickCloseOverlay="maskClosable"
    :z-index="zIndex"
    :otherStyle="{
      backgroundColor: 'transparent',
    }"
  >
    <div class="z-modal pr bgw ofh">
      <div v-if="title" class="title tac">
        {{ title }}
      </div>
      <div class="content">
        <slot>
          <div class="text">
            {{ content }}
          </div>
        </slot>
      </div>
      <div class="operation pr">
        <div
          v-if="showCancel"
          :class="[operationBtnClass('cancel')]"
          :style="operationBtnStyle('cancel')"
          hover-class="btn-hover"
          :hover-stay-time="300"
          @tap.stop="clickCancel"
        >
          {{ cancelText }}
        </div>
        <div
          :class="[operationBtnClass('confirm')]"
          :style="operationBtnStyle('confirm')"
          hover-class="btn-hover"
          :hover-stay-time="300"
          @tap.stop="clickConfirm"
        >
          {{ confirmText }}
        </div>
      </div>
    </div>
  </zPopup>
</template>

<style lang="less" scoped>
.z-modal {
  width: 100%;
  border-radius: 15rpx;
  .title {
    width: 100%;
    font-size: 38rpx;
    padding: 40rpx 30rpx 0 30rpx;
    box-sizing: border-box;
  }
  .content {
    width: 100%;
    line-height: 40rpx;
    font-size: 30rpx;
    padding: 50rpx 30rpx 0 30rpx;
    box-sizing: border-box;
    .text {
      width: 100%;
      word-wrap: break-word;
      text-align: center;
    }
  }
  .operation {
    width: 100%;
    margin-top: 40rpx;
    display: flex;
    border-top: 1rpx solid rgba(0, 0, 0, 0.3);
    .operation-btn {
      flex-grow: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 28rpx;
      font-size: 32rpx;

      & + & {
        border-top: 1rpx solid rgba(0, 0, 0, 0.3);
      }
    }
    .btn-hover {
      background-color: #eeeeee;
      opacity: 0.8;
    }
  }
}
</style>
