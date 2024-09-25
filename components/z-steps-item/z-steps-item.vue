<!--
 * @Description: z-steps-item 步骤条子组件
 * @Author: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
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
  onUnmounted,
  inject,
} from 'vue'
import z from '../../libs/z'
import zIcon from '../../components/z-icon/z-icon.vue'
import {
  stepModes,
  stepsContextKey,
  StepContext,
} from '../../components/z-steps/z-steps'
import zColor from '../../libs/zColor'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
/**
 * @description: z-steps-item 步骤条子组件传参
 * @param: color 默认颜色
 * @param: activeColor	激活时颜色
 * @param: disabled	禁止点击
 * @param: title  标题
 * @param: icon  默认的图标
 * @param: activeIcon  激活时的图标
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */

type ModeSelector = 'dot' | 'icon'

type StepModeClass = (selector?: ModeSelector) => string
type StepModeStyle = (selector?: ModeSelector) => CSSProperties

interface PropsType extends PropsTypeHook {
  color?: string
  activeColor?: string
  disabled?: boolean
  title?: string
  icon?: string
  activeIcon?: string
}

interface EmitsType {
  (e: 'click'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
})

const emits = defineEmits<EmitsType>()

const instance = getCurrentInstance()
if (!instance) {
  z.error('zStep 请在 setup 中使用 useStep')
}

const { uid } = instance!

// 判断当前是否被激活
const isActive = computed<boolean>(
  () => stepsContext?.activeUidList.includes(uid) || false
)

// 步骤条模式
const stepMode = computed<stepModes>(() => stepsContext?.mode || 'dot')

// item点击事件
const itemClickEvent = () => {
  if (props.disabled || stepsContext?.disabled) return

  stepsContext?.setActiveItem(uid)

  emits('click')
}

onMounted(() => {
  nextTick(() => {
    stepsContext?.addItem({ uid })
  })
})

onUnmounted(() => {
  stepsContext?.removeItem(uid)
})

const stepsContext = inject(stepsContextKey)

const normalColor = computed<string | undefined>(
  () => props.color || stepsContext?.color
)
const activeColor = computed<string | undefined>(
  () => props.activeColor || stepsContext?.activeColor
)

// step对应的类
const stepClass = computed<string>(() => {
  const cls: string[] = ['z-step-item']

  if (isActive.value) cls.push('z-step-item-active')

  return cls.join(' ')
})
// step对应的样式
const stepStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  // 设置颜色
  if (isActive.value) {
    style.color = zColor.getTypeColor(
      activeColor.value || zColor.getTypeColor('primary')
    )
  } else {
    style.color = zColor.getTypeColor(
      normalColor.value || zColor.getTypeColor('info')
    )
  }

  return style
})

// step-mode对应的类
const modeClass = computed<StepModeClass>(() => {
  return (selector?: ModeSelector) => {
    const cls: string[] = []

    if (!selector) {
      cls.push(`mode-${stepMode.value}`)
    }

    return cls.join(' ')
  }
})
// step-mode对应的样式
const modeStyle = computed<StepModeStyle>(() => {
  return (selector?: ModeSelector) => {
    const style: CSSProperties = {}

    if (stepMode.value === 'dot') {
      if (isActive.value) {
        style.backgroundColor = zColor.getTypeColor(
          activeColor.value || zColor.getTypeColor('primary')
        )
      } else {
        style.backgroundColor = zColor.getTypeColor(
          normalColor.value || zColor.getTypeColor('info')
        )
      }
    }

    if (stepMode.value === 'number') {
      if (isActive.value) {
        style.backgroundColor = zColor.getTypeColor(
          activeColor.value || zColor.getTypeColor('primary')
        )
        style.color = zColor.getTypeColor('cw')
      }
    }

    if (stepMode.value === 'dotIcon') {
      if (isActive.value && selector === 'icon') {
        style.color = zColor.getTypeColor(
          activeColor.value || zColor.getTypeColor('primary')
        )
      }
      if (!isActive.value && selector === 'dot') {
        style.backgroundColor = zColor.getTypeColor(
          normalColor.value || zColor.getTypeColor('info')
        )
      }
    }

    return style
  }
})

// step-line对应的类
const lineClass = computed<string>(() => {
  const cls: string[] = ['line', !props.title ? 'no-title' : '']

  return cls.join(' ')
})
// step-line对应的样式
const lineStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}

  if (isActive.value) {
    style.backgroundColor = zColor.getTypeColor(
      activeColor.value || zColor.getTypeColor('primary')
    )
  } else {
    style.backgroundColor = zColor.getTypeColor(
      normalColor.value || zColor.getTypeColor('info')
    )
  }

  return style
})
</script>

<template>
  <div :class="[stepClass]" :style="stepStyle">
    <!-- 步骤内容容器 -->
    <div class="container" @tap.stop="itemClickEvent">
      <!-- 模式 -->
      <div class="mode-item">
        <slot>
          <!-- 点模式 -->
          <div
            v-if="stepMode === 'dot'"
            :class="[modeClass()]"
            :style="modeStyle()"
          ></div>
          <!-- 数字模式 -->
          <div
            v-if="stepMode === 'number'"
            :class="[modeClass()]"
            :style="modeStyle()"
          >
            <div class="icon">
              <zIcon name="zhengque"></zIcon>
            </div>
          </div>
          <!-- 点图标模式 -->
          <div
            v-if="stepMode === 'dotIcon'"
            :class="[modeClass()]"
            :style="modeStyle()"
          >
            <div
              class="dot"
              :class="[modeClass('dot')]"
              :style="modeStyle('dot')"
            ></div>
            <div
              class="icon"
              :class="[modeClass('icon')]"
              :style="modeStyle('icon')"
            >
              <zIcon :name="activeIcon ? activeIcon : ''"></zIcon>
            </div>
          </div>
          <!-- 图标模式 -->
          <div
            v-if="stepMode === 'icon'"
            :class="[modeClass()]"
            :style="modeStyle()"
          >
            <div class="icon">
              <zIcon
                :name="
                  isActive ? (activeIcon ? activeIcon : '') : icon ? icon : ''
                "
              ></zIcon>
            </div>
          </div>
        </slot>
      </div>

      <!-- 标题 -->
      <div v-if="title" class="mode-title">{{ title }}</div>
    </div>

    <!-- 横线 -->
    <div :class="[lineClass]" :style="lineStyle"></div>
  </div>
</template>

<style lang="less" scoped>
.z-step-item {
  flex: 1;
  position: relative;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  .container {
    display: flex;

    flex-direction: column;
    align-items: center;
    justify-content: center;
    .mode-item {
      position: relative;
      width: 50rpx;
      height: 50rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
      .mode-dot {
        width: 20rpx;
        height: 20rpx;
        border-radius: 50%;
        transition: background-color 0.3s ease;
      }
      .mode-number {
        position: relative;
        width: 80%;
        height: 80%;
        border-radius: 50%;
        border: 1rpx solid @info;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        transition: background-color 0.3s ease, border-color 0.3s ease;

        &::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          line-height: 1;
          opacity: 1;
          transition: opacity 0.3s ease;
        }
        .icon {
          line-height: 1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
      }

      .mode-dotIcon {
        position: relative;
        width: 100%;
        height: 100%;

        .dot {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 20rpx;
          height: 20rpx;
          border-radius: 50%;
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
          transform-origin: center center;
          transition: background-color 0.3s ease, opacity 0.3s ease,
            transform 0.3s ease;
        }
        .icon {
          font-size: 42rpx;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) scale(0);
          transform-origin: center center;
          opacity: 0;
          transition: color 0.3s ease, opacity 0.3s ease, transform 0.3s ease;
        }
      }
      .mode-icon {
        font-size: 42rpx;
        .icon {
          transition: color 0.3s ease;
          transform-origin: center center;
        }
      }
    }
    .mode-title {
      transition: color 0.3s ease;
      margin-top: 6rpx;
    }
  }
  .line {
    position: absolute;
    right: calc(50rpx * 1.35);
    top: calc(50rpx / 2 - 2rpx);
    width: calc(100% - 50rpx);
    height: 4rpx;
    z-index: 1;
    transition: background-color 0.3s ease;
  }
  .no-title {
    right: calc(50rpx);
  }
  &:first-of-type {
    flex: auto;
    flex-grow: 0;
    flex-shrink: 0;
    width: fit-content;
    max-width: fit-content;

    .line {
      display: none;
    }
  }
  .generate-nth-child(@i) when (@i > 0) {
    &:nth-child(@{i}) {
      .container {
        .mode-number {
          &::before {
            content: '@{i}';
          }
        }
      }
    }

    // 递归调用，生成下一个 nth-child
    .generate-nth-child(@i - 1);
  }

  .generate-nth-child(10);
}
.z-step-item-active {
  .container {
    .mode-item {
      .mode-number {
        border-color: transparent;

        &::before {
          opacity: 0;
        }

        .icon {
          opacity: 1;
        }
      }
      .mode-dotIcon {
        .dot {
          opacity: 0;
          transform: translate(-50%, -50%) scale(2);
        }
        .icon {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
      }
      .mode-icon {
        .icon {
          animation: icon-mode-switch-animation 0.3s ease;
        }
      }
    }
  }
}
/* 图标模式下切换动画 */
@keyframes icon-mode-switch-animation {
  from {
    opacity: 0;
    transform: scale(1.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
