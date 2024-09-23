<!--
 * @Description: z-search-box 搜索框组件
 * @Author: ZGGUI & ui.zggui.cn & zggamazing@163.com
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
import zIcon from '@/ZGGUI/components/z-icon/z-icon.vue'
import { debounce, throttle } from '@/ZGGUI/libs/lodash'
import zColor from '@/ZGGUI/libs/zColor'
import { zSize } from '@/ZGGUI/libs/utils'
import { propsHook, PropsTypeHook } from '@/ZGGUI/libs/zHooks'
/**
 * @description: z-search-box 搜索框组件传参
 * @param: modelValue 搜索框绑定的值
 * @param: placeholder	搜索框的占位符
 * @param: placeholderIcon	搜索框占位符旁边的图标
 * @param: shape  搜索框的形状
 * @param: size  搜索框的尺寸,small、normal、large
 * @param: textColor  搜索框文字的颜色
 * @param: placeholderColor  搜索框占位文字颜色
 * @param: textAlign  搜索框文字对齐方式
 * @param: border  显示边框
 * @param: borderColor  边框颜色
 * @param: focus  获取搜索框焦点
 * @param: disabled  是否禁用搜索框
 * @param: clearable  是否显示清除按钮
 * @param: searchButton  是否显示搜索按钮
 * @param: searchButtonText  搜索按钮的文字
 * @param: searchButtonTextColor  搜索按钮字体颜色
 * @param: searchButtonBgColor  搜索按钮背景颜色
 * @param: throllte  输入是否节流
 * @param: throllteTime  节流延迟时间，单位毫秒
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zggui.cn & zggamazing@163.com
 * @example:
 */

type searchBoxAlign = 'left' | 'center' | 'right'
type searchBoxShape = 'square' | 'round'

interface PropsType extends PropsTypeHook {
  modelValue?: string
  placeholder?: string
  placeholderIcon?: string
  shape?: searchBoxShape
  size?: zSize
  textColor?: string
  placeholderColor?: string
  textAlign?: searchBoxAlign
  border?: boolean
  borderColor?: string
  focus?: boolean
  disabled?: boolean
  clearable?: boolean
  searchButton?: boolean
  searchButtonText?: string
  searchButtonTextColor?: string
  searchButtonBgColor?: string
  throllte?: boolean
  throllteTime?: number
}

interface EmitsType {
  (e: 'update:modelValue', value: string): void //搜索框内容改变
  (e: 'change', value: string): void //搜索框内容改变
  (e: 'input', value: string): void //搜索框输入时触发
  (e: 'click'): void //点击搜索框时触发
  (e: 'focus'): void //聚焦搜索输入框时触发
  (e: 'blur'): void //搜索输入框失去焦点时触发
  (e: 'search', value: string): void //点击搜索按钮时触发
  (e: 'clear'): void //点击清除按钮时触发
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  modelValue: '',
  placeholder: '请输入搜索内容',
  placeholderIcon: 'search',
  shape: 'square',
  size: 'normal',
  textAlign: 'left',
  border: true,
  clearable: true,
  searchButton: true,
  searchButtonText: '搜 索',
  throllte: true,
  throllteTime: 1000,
})

const emits = defineEmits<EmitsType>()

// 是否显示placeholder
const showPlaceholder = ref<boolean>(!props.modelValue)

// 输入框的值
const inputValue = ref<string>(props.modelValue)
watch(
  () => props.modelValue,
  (val) => {
    if (props.modelValue === inputValue.value) return
    inputValue.value = val
    showPlaceholder.value = !val
  }
)
// 输入框聚焦
const inputFocus = ref<boolean>(false)
if (props.focus) {
  showPlaceholder.value = false
  nextTick(() => {
    inputFocus.value = true
  })
}

// searchBox点击事件
const searchBoxClickEvent = () => {
  emits('click')
  if (props.disabled) return
  showPlaceholder.value = false
  inputFocus.value = true
}

// 输入框获取焦点事件
const inputFocusEvent = () => {
  emits('focus')
}

// 输入框失去焦点事件
const inputBlurEvent = () => {
  showPlaceholder.value = !inputValue.value
  inputFocus.value = false
  emits('blur')
}

// 输入框输入事件
const inputHandle = () => {
  emits('update:modelValue', inputValue.value)

  nextTick(() => {
    emits('change', inputValue.value)
    emits('input', inputValue.value)
  })
}
const inputValueEvent = props.throllte
  ? throttle(inputHandle, props.throllteTime)
  : inputHandle

// 清除按钮点击事件
const clearClickEvent = () => {
  inputValue.value = ''
  emits('update:modelValue', '')

  nextTick(() => {
    inputFocus.value = true
    emits('change', '')
    emits('clear')
  })
}

// 点击search按钮事件
const searchBtnClickEvent = debounce(() => {
  if (props.disabled) return
  emits('search', inputValue.value)
}, 250)

// 搜索框的类
const searchBoxClass = computed<string>(() => {
  const cls: string[] = [
    'z-search-box',
    `z-search-box-${props.shape}`,
    props.disabled ? 'z-search-box-disabled' : '',
  ]

  if (props.border) {
    cls.push('z-search-box-border')
  }

  return cls.join(' ')
})
// 搜索框的样式
const searchBoxStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  style.color = zColor.getTypeColor(
    props.textColor || zColor.getTypeColor('primary')
  )

  if (props.border) {
    style.borderColor = zColor.getTypeColor(
      props.borderColor || zColor.getTypeColor('info')
    )
  }
  switch (props.size) {
    case 'small': {
      style.height = '48rpx'
      style.fontSize = '24rpx'
      break
    }
    case 'normal': {
      style.height = '56rpx'
      style.fontSize = '28rpx'
      break
    }
    case 'large': {
      style.height = '64rpx'
      style.fontSize = '32rpx'
      break
    }
  }

  return style
})

// 搜索框占位文字的类
const placeholderClass = computed<string>(() => {
  const cls: string[] = ['z-search-box-placeholder', `${props.textAlign}`]

  return cls.join(' ')
})
// 搜索框占位文字的样式
const placeholderStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  style.color = zColor.getTypeColor(
    props.placeholderColor || zColor.getTypeColor('disabled')
  )

  switch (props.size) {
    case 'small': {
      style.fontSize = '24rpx'
    }
    case 'normal': {
      style.fontSize = '28rpx'
    }
    case 'large': {
      style.fontSize = '32rpx'
    }
  }

  return style
})

// 搜索按钮的类
const searchButtonClass = computed<string>(() => {
  const cls: string[] = ['search-button']

  return cls.join(' ')
})
// 搜索按钮的样式
const searchButtonStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  style.backgroundColor = zColor.getTypeColor(
    props.searchButtonBgColor || zColor.getTypeColor('primary')
  )

  switch (props.size) {
    case 'small': {
      style.padding = '0rpx 20rpx'
    }
    case 'normal': {
      style.padding = '0rpx 26rpx'
    }
    case 'large': {
      style.padding = '0rpx 26rpx'
    }
  }

  style.color = zColor.getTypeColor(
    props.searchButtonTextColor || zColor.getTypeColor('cw')
  )

  return style
})
</script>

<template>
  <div
    :class="[searchBoxClass]"
    :style="searchBoxStyle"
    @tap.stop="searchBoxClickEvent"
  >
    <!-- 搜索框内容输入区 -->
    <div class="content">
      <div
        v-if="showPlaceholder"
        :class="[placeholderClass]"
        :style="placeholderStyle"
      >
        <slot name="placeholder">
          <div v-if="placeholderIcon" class="placeholder-icon">
            <zIcon :name="placeholderIcon"></zIcon>
          </div>
          <div v-if="placeholder" class="placeholder-text">
            {{ placeholder }}
          </div>
        </slot>
      </div>
      <template v-else>
        <!-- input输入框 -->
        <input
          v-model="inputValue"
          class="input"
          :class="`input-${textAlign}`"
          :focus="inputFocus"
          confirm-type="search"
          @focus="inputFocusEvent"
          @blur="inputBlurEvent"
          @input="inputValueEvent"
          @confirm="searchBtnClickEvent"
        />
        <!-- 清除按钮 -->
        <div
          v-if="clearable && inputValue"
          class="df jcc aic"
          @tap.stop="clearClickEvent"
        >
          <zIcon name="cuowu-circle"></zIcon>
        </div>
      </template>
    </div>

    <!-- 搜索按钮 -->
    <div
      v-if="searchButton"
      :class="[searchButtonClass]"
      :style="searchButtonStyle"
      hover-class="btn-hover"
      :hover-stay-time="150"
      @tap.stop="searchBtnClickEvent"
    >
      <slot name="search">
        {{ searchButtonText }}
      </slot>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-search-box {
  position: relative;
  padding: 10rpx 10rpx 10rpx 20rpx;
  display: flex;
  align-items: center;
  background-color: transparent;
  line-height: 1;
  .content {
    flex-grow: 1;
    display: flex;
    background-color: transparent;
    color: inherit;
    font-size: inherit;
    padding: 0rpx;
    height: 100%;
    min-height: 100%;
    line-height: 1;
    .input {
      flex-grow: 1;
      background-color: transparent;
      color: inherit;
      font-size: inherit;
      padding: 0rpx;
      height: 100%;
      min-height: 100%;
      line-height: 1;
    }
    .left {
      text-align: left;
    }
    .center {
      text-align: center;
    }
    .right {
      text-align: right;
    }
    .z-search-box-placeholder {
      width: 100%;
      display: flex;
      align-items: center;
      .placeholder-icon {
        margin-right: 8rpx;
        font-size: inherit;
      }
    }
    .left {
      justify-content: flex-start;
    }
    .center {
      justify-content: center;
    }
    .right {
      justify-content: flex-end;
    }
  }
  .search-button {
    flex-shrink: 0;
    height: 100%;
    margin-left: 10rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .btn-hover {
    background-color: #eeeeee;
    opacity: 0.8;
  }
}
.z-search-box-disabled {
  opacity: 0.4;
}
.z-search-box-border {
  border-width: 1rpx;
  border-style: solid;
}
.z-search-box-square {
  border-radius: 15rpx;
  .search-button {
    border-radius: 15rpx;
  }
}
.z-search-box-round {
  border-radius: 1000rpx;
  .search-button {
    border-radius: 1000rpx;
  }
  .content {
    .input {
      padding-left: 16rpx;
    }
  }
}
</style>
