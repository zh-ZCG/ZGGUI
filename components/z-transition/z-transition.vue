<!--
 * @Description: z-transition 动画组件
 * @Author: ZGGUI & ui.zggui.cn & zggamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import { ref, watch, nextTick, computed } from 'vue'

/**
 * @description: z-transition 动画组件传参
 * @param: show 是否展示动画，动画是通过外部的show来控制的，当要结束时，通过show为false实现
 * @param: name  动画名称，通过传入name，对class进行拼接
 * @param: duration 动画从初始态到结束态的时间 单位ms
 * @param: timingFun 动画的方法，例如ease-in-out
 * @param: otherStyle 其他样式
 *
 * @event: click 点击动画组件
 * @event: beforeEnter 动画开始前
 * @event: enter 动画开始中
 * @event: afterEnter 动画开始后
 * @event: beforeLeave 动画结束前
 * @event: leave 动画结束中
 * @event: afterLeave 动画结束后
 * @tutorial: ZGGUI & ui.zggui.cn & zggamazing@163.com
 * @example:
 */
interface PropsType {
  show?: boolean
  name?: string
  duration?: number
  timingFun?: string
  otherStyle?: object
}

interface EmitsType {
  (e: 'click'): void
  (e: 'beforeEnter'): void
  (e: 'enter'): void
  (e: 'afterEnter'): void
  (e: 'beforeLeave'): void
  (e: 'leave'): void
  (e: 'afterLeave'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  show: false,
  name: 'fade',
  duration: 300,
  timingFun: 'ease-in-out',
})

const emits = defineEmits<EmitsType>()

/**开始变量 */
const begin = ref(false) //控制该组件动画效果开始

/**动画名称，反向为名称-back */
const name = ref('')

/**当前动画状态 */
const status = ref('') //enter进入,leave退出,末尾加-to则表示向另外一种状态过渡

/**组件是否结束 */
const isEnd = ref(false)

//通过外部传入的show控制动画显隐
watch(
  () => props.show,
  (newVal, oldVal) => {
    newVal ? Enter() : Leave()
  },
  {
    immediate: true,
  }
)
const transitionStyle = computed(() => {
  return {
    // #ifndef APP-NVUE
    transitionDuration: `${props.duration}ms`,
    transitionTimingFunction: props.timingFun,
    // #endif
    ...props.otherStyle,
  }
})

function getClassNames(name: string) {
  return {
    enter: `z-${name}-enter z-${name}-enter-active`,
    enterto: `z-${name}-enter-to z-${name}-enter-active`,
    leave: `z-${name}-leave z-${name}-leave-active`,
    leaveto: `z-${name}-leave-to z-${name}-leave-active`,
  }
}

/**动画开始函数*/
function Enter() {
  const classNames = getClassNames(props.name)
  status.value = 'enter'
  emits('beforeEnter') //动画进入之前
  begin.value = false
  begin.value = true
  name.value = classNames.enter
  nextTick(() => {
    emits('enter')
    isEnd.value = false
    emits('afterEnter')
    name.value = classNames.enterto
  })
}
/**动画结束函数*/
function Leave() {
  const classNames = getClassNames(props.name)
  status.value = 'leave'
  emits('beforeLeave')
  name.value = classNames.leave
  nextTick(() => {
    isEnd.value = false
    emits('leave')
    setTimeout(() => {
      //组件结束后的处理事件
      if (isEnd.value) return
      isEnd.value = true
      emits('afterLeave')
      if (!props.show) {
        begin.value = false
      }
    }, props.duration)
    name.value = classNames.leaveto
  })
}

/**组件被点击函数 */
function clickcomponent() {
  emits('click')
}
</script>

<template>
  <div
    v-if="begin"
    class="z-transition"
    :class="name"
    :style="[transitionStyle]"
    @tap="clickcomponent"
  >
    <slot></slot>
  </div>
</template>

<style lang="less" scoped>
// .z-transition {
// }
</style>
