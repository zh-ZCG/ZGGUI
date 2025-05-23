<!--
 * @Description: z-line-progress 线性进度条
 * @Author: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import { ref, getCurrentInstance, watch, computed, onMounted } from 'vue'
import type { Ref, PropType } from 'vue'
import z from '../../libs/z'
import zColor from '../../libs/zColor'
import zMath from '../../libs/zMath'

/**
 * @description: z-line-progress 线性进度条
 * @param: lineBgColor 进度条背景颜色，默认#ececec
 * @param: lineColor  进度条颜色
 * @param: lineText 是否显示进度条文字
 * @param: lineTextColor 进度条文字颜色
 * @param: percent 进度数值
 * @param: height 进度条高度
 *
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */
interface PropsType {
  lineBgColor?: string
  lineColor?: string
  lineText?: boolean
  lineTextColor?: string
  percent?: string | number
  height?: string | number
  otherStyle?: object
}

interface EmitsType {}

const props = withDefaults(defineProps<PropsType>(), {
  lineBgColor: '#ececec',
  lineColor: 'cs5',
  lineText: false,
  lineTextColor: '#fff',
  percent: 0,
  height: '12px',
})

const emits = defineEmits<EmitsType>()

/**进度条的宽度 */
const lineWidth = ref('0px')

const lineProgressStyle = computed(() => {
  let style = {}
  return z.deepMerge(style, props.otherStyle ? props.otherStyle : {})
})

const lineProgressBackgroundStyle = computed(() => {
  let style = {
    color: '',
    backgroundColor: '',
    height: '12px',
    width: '0px',
  }
  style.height = z.addUnit(props.height)
  style.width = lineWidth.value

  style.backgroundColor = zColor.getTypeColor(props.lineBgColor)

  style.color = zColor.getTypeColor(props.lineColor)

  return style
})

const lineProgressLineStyle = computed(() => {
  let style = {
    backgroundColor: '',
    height: '12px',
    width: '0px',
  }
  style.height = z.addUnit(props.height)
  style.width = lineWidth.value
  style.backgroundColor = zColor.getTypeColor(props.lineColor)

  return style
})

const lineProgressTextStyle = computed(() => {
  let style = {
    color: '',
  }
  style.color = zColor.getTypeColor(props.lineTextColor)

  return style
})

onMounted(() => {
  z.sleep(20).then(() => {
    resizeWidth()
  })
})

watch(
  () => props.percent,
  (newVal, oldVal) => {
    resizeWidth()
  }
)

/**获取当前实例对象 */
const that = getCurrentInstance()

// #ifdef APP-NVUE
const dom = uni.requireNativePlugin('dom')
// #endif

function getBackgroundWidth() {
  // #ifndef APP-NVUE
  return z.getDomInfo('#z-line-progress-background', that)
  // #endif

  // #ifdef APP-NVUE
  // 返回一个promise
  return new Promise((resolve) => {
    z.getDomInfoNvue('z-line-progress-background')
  })
  // #endif
}

function resizeWidth() {
  getBackgroundWidth().then((size: any) => {
    const { width } = size
    //计算具体长度
    lineWidth.value = (width * nowPercent.value) / 100 + 'px'
  })
}

/**
 * 获取当前进度数值
 */
const nowPercent = computed(() => {
  return zMath.range(0, 100, Number(props.percent))
})
</script>

<template>
  <div
    :style="[lineProgressStyle]"
    ref="z-line-progress"
    id="z-line-progress"
    class="dfr ais pr f1 ofh"
    style="border-radius: 100px"
  >
    <div
      class="f1"
      ref="z-line-progress-background"
      id="z-line-progress-background"
      :style="[lineProgressBackgroundStyle]"
      style="border-radius: 100px"
    ></div>
    <div
      class="pa z-line-progress-line dfr aic jcfe"
      ref="z-line-progress-line"
      id="z-line-progress-line"
      :style="[lineProgressLineStyle]"
    >
      <slot>
        <text
          v-if="props.lineText"
          class="z-line-progress-text"
          :style="lineProgressTextStyle"
        >
          {{ nowPercent + '%' }}
        </text>
      </slot>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-line-progress-line {
  top: 0;
  left: 0;
  border-radius: 100px;
  transition: width 0.3s ease;
}
.z-line-progress-text {
  font-size: 10px;
  align-items: center;
  text-align: right;
  margin-right: 5px;
  transform: scale(0.9);
}
</style>
