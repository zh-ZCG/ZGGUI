<!--
 * @Description: z-keyboard 软键盘组件
 * @Author: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import { ref, computed, watch, toRef, nextTick } from 'vue'
import z from '../../libs/z'
import { zLongPress } from '../../libs/zLongPress'
import zPopup from '../../components/z-popup/z-popup.vue'
import zIcon from '../../components/z-icon/z-icon.vue'
import {
  carKeyboardCnData,
  carKeyboardEnData,
  carKeyboardSpecialData,
} from '../z-keyboard/car-keyboard-data'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
/**
 * @description: z-keyboard 软键盘组件传参
 * @param: show 是否显示键盘
 * @param: modelValue 键盘输入绑定的值
 * @param: mode		键盘类型（默认number）
 * @param: carLang		车牌键盘中/英文模式，在 `mode` 为 `car` 时生效(默认cn)
 * @param: vibrate 点击按钮是否有震动效果（默认true）
 * @param: longPressDelete 是否允许长按删除删除内容
 * @param: disabled		禁止键盘输入
 * @param: overlay	  是否显示遮罩层
 * @param: overlayCloseable		点击遮罩关闭键盘
 * @param: zIndex 层级
 * @param: otherStyle 其他的样式
 *
 * @event: end 滚动到目标后触发
 * @tutorial: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  show?: boolean
  modelValue?: string
  mode?: 'number' | 'digit' | 'idcard' | 'random' | 'car'
  carLang?: 'cn' | 'en'
  vibrate?: boolean
  longPressDelete?: boolean
  disabled?: boolean
  overlay?: boolean
  overlayCloseable?: boolean
  zIndex?: number
}

interface EmitsType {
  (e: 'close'): void
  (e: 'confirm'): void
  (e: 'update:show', data: boolean): void
  (e: 'update:modelValue', data: string): void
  (e: 'update:carLang', data: 'cn' | 'en'): void
  (e: 'change', data: string): void
  (e: 'backspace'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  show: false,
  modelValue: '',
  mode: 'number',
  carLang: 'cn',
  vibrate: true,
  longPressDelete: true,
  disabled: false,
  overlay: false,
  overlayCloseable: true,
  zIndex: 9999,
})

const emits = defineEmits<EmitsType>()

// 弹出隐藏键盘
const showKeyboard = ref<boolean>(false)
watch(
  () => props.show,
  (val) => {
    showKeyboard.value = val
  }
)

//输入的值
const inputValue = ref<string>(props.modelValue || '')

watch(
  () => props.modelValue,
  (val) => (inputValue.value = val)
)

// popup弹框关闭事件
function popupClose() {
  emits('close')
  emits('update:show', false)
}

type KeyboardDataItem = {
  value: string
  disabled: boolean
}
type KeyboardData = Array<KeyboardDataItem>

const generateNormalKeyboardData = (
  digit = false,
  idcard = false,
  random = false
): KeyboardData => {
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
  if (digit) numbers.push('.')
  if (idcard) numbers.push('X')
  if (random) numbers.sort(() => Math.random() - 0.5)

  return numbers.map((item) => {
    return {
      value: item,
      disabled: props.disabled,
    }
  })
}

const keyboardData = computed<KeyboardData>(() => {
  let data: KeyboardData = []
  switch (props.mode) {
    case 'number':
      data = generateNormalKeyboardData()
      break
    case 'digit':
      data = generateNormalKeyboardData(true)
      break
    case 'idcard':
      data = generateNormalKeyboardData(false, true)
      break
    case 'random':
      data = generateNormalKeyboardData(false, false, true && props.show)
      break
  }
  return data
})

// 车牌键盘数据
const carKeyboardData = computed<KeyboardData[]>(() => {
  const data: KeyboardData[] = []

  const _fillCarKeyboardData = (rawData: string[]): KeyboardData => {
    return rawData.map((item) => {
      return {
        value: item,
        disabled: carKeyboardSpecialData.includes(item) || props.disabled,
      }
    })
  }

  if (props.mode === 'car') {
    if (props.carLang === 'cn') {
      const fillCnData = _fillCarKeyboardData(carKeyboardCnData)
      data.push(
        fillCnData.slice(0, 10),
        fillCnData.slice(10, 20),
        fillCnData.slice(20, 30),
        fillCnData.slice(30, 37)
      )
    } else {
      const fillEnData = _fillCarKeyboardData(carKeyboardEnData)
      data.push(
        fillEnData.slice(0, 10),
        fillEnData.slice(10, 20),
        fillEnData.slice(20, 29),
        fillEnData.slice(29, 36)
      )
    }
  }

  return data
})

// 键盘点击事件
const keyboardClickEvent = (value: string, disabled: boolean) => {
  if (disabled) return
  if (props.vibrate) {
    uni.vibrateShort()
  }
  let concatValue = true
  if (value === 'confirm') {
    popupClose()
    emits('confirm')
    return
  } else if (value === 'cancel') {
    popupClose()
    return
  } else {
    // 处理小数的0位和小数点位置
    if (props.mode === 'digit') {
      // 判断当前点击的value是是否位.
      if (value === '.') {
        // 判断modelValue中是否已经存在.，如果存在，则直接return
        if (inputValue.value.includes('.')) {
          return
        }
        // 当小数点在第一位时，前面自动补0
        if (inputValue.value === '') {
          inputValue.value = '0.'
          concatValue = false
        }
      }
      // 判断当前点击的value是否为0
      if (value === '0') {
        // 判断第一位是否为0，如果是，直接return
        if (inputValue.value === '0') {
          return
        }
      }
      // 如果第一位为0，第二位不为.，则将第一位替换为当前点击的value
      if (inputValue.value === '0' && value !== '.') {
        inputValue.value = value
        concatValue = false
      }
    }
    if (
      props.mode === 'idcard' &&
      value === 'X' &&
      inputValue.value.includes('X')
    ) {
      return
    }
    if (concatValue) {
      inputValue.value += value
    }
  }

  emits('update:modelValue', inputValue.value)
  nextTick(() => {
    emits('change', inputValue.value)
  })
}

// 单独处理删除事件
const backspaceEvent = () => {
  if (inputValue.value === '') {
    clearBackspaceLongPressEvent()
    return
  }
  if (props.vibrate) {
    uni.vibrateShort()
  }
  inputValue.value = inputValue.value.slice(0, -1)

  emits('backspace')
  emits('update:modelValue', inputValue.value)
  nextTick(() => {
    emits('change', inputValue.value)
  })
}

const {
  handleLongPressEvent: handleBackspaceEvent,
  clearLongPressTimer: clearBackspaceLongPressEvent,
} = zLongPress(backspaceEvent, toRef(props, 'longPressDelete'))

// 车牌键盘中英文切换
const carKeyboardLang = ref<'cn' | 'en'>(
  z.isEmptyVariableInDefault(props.carLang, 'cn')
)
let updateCarLangInner = false
watch(
  () => props.carLang,
  (val) => {
    if (updateCarLangInner) {
      updateCarLangInner = false
      return
    }
    carKeyboardLang.value = val
  }
)

const carKeyboardSwitchLang = () => {
  if (carKeyboardLang.value === 'cn') {
    carKeyboardLang.value = 'en'
  } else {
    carKeyboardLang.value = 'cn'
  }

  updateCarLangInner = true
  emits('update:carLang', carKeyboardLang.value)
}
</script>

<template>
  <zPopup
    :overlay="props.overlay"
    :clickCloseOverlay="props.overlayCloseable"
    mode="bottom"
    :overlayOpacity="0"
    :popup="false"
    :show="props.show"
    @close="popupClose"
    :zIndex="props.zIndex"
    :otherStyle="{
      backgroundColor: 'rgb(214, 218, 220)',
    }"
  >
    <div
      class="pr df z-keyboard"
      :style="props.mode == 'car' ? 'display:block' : ''"
    >
      <!-- 普通键盘 -->
      <template v-if="props.mode !== 'car'">
        <!-- 左边操作区域 -->
        <div class="df fww left">
          <div
            v-for="(item, index) in keyboardData"
            :key="index"
            class="normal-item"
            :class="[
              {
                full: keyboardData.length === 10 && index === 9,
                fill: keyboardData.length === 11 && index === 9,
                disabled: item.disabled,
              },
            ]"
            :hover-class="item.disabled ? '' : 'keyboard-btn-hover'"
            :hover-stay-time="150"
            @tap.stop="keyboardClickEvent(item.value, item.disabled)"
          >
            {{ item.value }}
          </div>
        </div>
        <!-- 右边操作区域 -->
        <div class="dfc right">
          <div
            class="normal-item delete"
            hover-class="keyboard-btn-hover"
            :hover-stay-time="150"
            @touchstart.stop.prevent="handleBackspaceEvent"
            @touchend.stop.prevent="clearBackspaceLongPressEvent"
          >
            <zIcon name="backspace"></zIcon>
          </div>
          <div
            class="normal-item confirm"
            hover-class="keyboard-btn-hover"
            :hover-stay-time="150"
            @tap.stop="keyboardClickEvent('confirm', false)"
          >
            确认
          </div>
        </div>
      </template>

      <!-- 汽车键盘 -->
      <template v-else>
        <!-- 顶部操作栏 -->
        <div class="df aic jcsb z-keyboard-car">
          <div class="cancel" @tap.stop="keyboardClickEvent('cancel', false)">
            取消
          </div>
          <div class="confirm" @tap.stop="keyboardClickEvent('confirm', false)">
            确认
          </div>
        </div>
        <div class="dfc aic z-keyboard-car-column">
          <!-- 行数据 -->
          <div
            v-for="(item, index) in carKeyboardData"
            :key="index"
            class="column-data"
          >
            <!-- 如果是最后一行，显示切换按钮 -->
            <div
              v-if="index === 3"
              class="car-item switch-mode"
              hover-class="keyboard-btn-hover"
              :hover-stay-time="150"
              @tap.stop="carKeyboardSwitchLang"
              :style="carKeyboardLang === 'cn' ? '' : 'font-size:14px'"
            >
              {{ carKeyboardLang === 'cn' ? 'ABC' : '返回' }}
            </div>

            <!-- 列数据 -->
            <div
              v-for="(rowData, rowIndex) in item"
              :key="rowIndex"
              class="car-item"
              :class="[{ disabled: rowData.disabled }]"
              :hover-class="rowData.disabled ? '' : 'keyboard-btn-hover'"
              :hover-stay-time="150"
              @tap.stop="keyboardClickEvent(rowData.value, rowData.disabled)"
            >
              {{ rowData.value }}
            </div>

            <!-- 如果是最后一行，显示删除按钮 -->
            <div
              v-if="index === 3"
              class="car-item delete"
              hover-class="keyboard-btn-hover"
              :hover-stay-time="150"
              @touchstart.stop.prevent="handleBackspaceEvent"
              @touchend.stop.prevent="clearBackspaceLongPressEvent"
            >
              <zIcon name="backspace"></zIcon>
            </div>
          </div>
        </div>
      </template>
    </div>
  </zPopup>
</template>

<style lang="less" scoped>
.z-keyboard {
  width: 100%;
  box-shadow: 0rpx -6rpx 30rpx 0rpx rgba(0, 0, 0, 0.05);
  background-color: #fff;
  .left {
    width: 76%;
    .normal-item {
      width: calc(100% / 3 - 20rpx);
      margin: 10rpx;
      box-shadow: 0rpx 0rpx 20rpx 2rpx rgba(0, 0, 0, 0.06);
      background-color: #fff;

      display: flex;
      align-items: center;
      justify-content: center;
      padding: 28rpx 0rpx;
      border-radius: 8rpx;

      font-size: 32rpx;
      line-height: 1;
    }
    .full {
      width: calc(100% - 20rpx);
    }
    .fill {
      width: calc(100% * 2 / 3 - 20rpx);
    }
    .disabled {
      opacity: 0.3;
    }
    .delete {
      width: calc(100% - 10rpx);
      height: fit-content;
      font-size: 40rpx;
      margin-left: 0rpx;
      padding: 24rpx 0rpx;
    }
    .confirm {
      flex-grow: 1;
      width: calc(100% - 10rpx);
      margin-left: 0rpx;
      background-color: @primary;
      color: @cw;
    }
    .keyboard-btn-hover {
      box-shadow: inset 0rpx 0rpx 2rpx 5rpx rgba(0, 0, 0, 0.3);
      opacity: 0.8;
    }
  }
  .right {
    width: 24%;
    height: auto;
    .normal-item {
      width: calc(100% / 3 - 20rpx);
      margin: 10rpx;
      box-shadow: 0rpx 0rpx 20rpx 2rpx rgba(0, 0, 0, 0.06);
      background-color: @cw;

      display: flex;
      align-items: center;
      justify-content: center;
      padding: 28rpx 0rpx;
      border-radius: 8rpx;

      font-size: 32rpx;
      line-height: 1;
    }
    .full {
      width: calc(100% - 20rpx);
    }
    .fill {
      width: calc(100% * 2 / 3 - 20rpx);
    }
    .disabled {
      opacity: 0.3;
    }
    .delete {
      width: calc(100% - 10rpx);
      height: fit-content;
      font-size: 44rpx;
      margin-left: 0rpx;
      padding: 28rpx 0rpx;
    }
    .confirm {
      flex-grow: 1;
      width: calc(100% - 10rpx);
      margin-left: 0rpx;
      background-color: @primary;
      color: @cw;
    }
    .keyboard-btn-hover {
      box-shadow: inset 0rpx 0rpx 2rpx 5rpx rgba(0, 0, 0, 0.3);
      opacity: 0.8;
    }
  }
}
.z-keyboard-car {
  border-bottom: 1rpx solid #999999;
  .cancel {
    font-size: 30rpx;
    padding: 14rpx 30rpx;
    color: @error;
  }
  .confirm {
    font-size: 30rpx;
    padding: 14rpx 30rpx;
    color: @primary;
  }
}
.z-keyboard-car-column {
  width: 100%;
  padding: 10rpx;
  .column-data {
    width: 100%;
    display: flex;
    margin: 10rpx 0rpx;
  }
  .car-item {
    flex: 1;
    padding: 24rpx 0rpx;
    margin: 0rpx 10rpx;
    border-radius: 8rpx;
    box-shadow: 0rpx 0rpx 20rpx 2rpx rgba(0, 0, 0, 0.06);
    background-color: @cw;
    line-height: 1;

    display: flex;
    align-items: center;
    justify-content: center;
  }
  .disabled {
    opacity: 0.3;
  }
  .switch-mode {
    padding-left: 12rpx;
    padding-right: 12rpx;
  }
  .keyboard-btn-hover {
    box-shadow: inset 0rpx 0rpx 2rpx 5rpx rgba(0, 0, 0, 0.3);
    opacity: 0.8;
  }
  .delete {
    font-size: 32rpx;
    padding-left: 14rpx;
    padding-right: 14rpx;
  }
}
</style>
