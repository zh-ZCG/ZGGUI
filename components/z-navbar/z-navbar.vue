<!-- z-navbar 自定义导航栏组件,建议使用uniapp自带导航栏，如有特殊要求在使用自定义导航烂 -->
<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref, getCurrentInstance, watch } from 'vue'
import type { Ref, PropType } from 'vue'
import zstatusBar from '@/ZGGUI/components/z-status-bar/z-status-bar.vue'

export interface PropsType {
  //是否留出状态栏高度，默认开启,
  safeBarHeight: boolean
  //固定在顶部，防止自定义导航栏塌陷
  fixedHeight: boolean
  //自定义导航栏是否固定在顶部
  fixed: boolean
  //导航栏背景颜色
  bgcolor: string
  //标题字体大小
  titleSize: number
  //标题颜色
  titlecolor: string
  //是否显示导航栏下边框
  bottomborder: boolean
  //左侧图标（font class）
  leftIcon: string
  //左侧图标大小
  leftIconSize: number
  //左侧标题
  leftTitle: string
  //中间标题
  centerTitle: string
  //右侧图标
  rightIcon: string
  //右侧标题
  rightTitle: string
  //默认点击左侧的图标和文字返回上一级，为true则clickleft方法无效
  clickLeftBack: boolean
}

const props = withDefaults(defineProps<PropsType>(), {
  safeBarHeight: true,
  fixedHeight: true,
  fixed: true,
  bgcolor: '#fff',
  titleSize: 16,
  titlecolor: '#1a1a1a',
  bottomborder: false,
  leftIcon: 'icon-youjiantou1',
  leftIconSize: 40,
  leftTitle: '',
  centerTitle: '',
  rightIcon: '',
  rightTitle: '',
  clickLeftBack: true,
})

const emits = defineEmits(['clickleft', 'clickcenter', 'clickright'])

const statusBarHeight = ref(20)

onLoad(() => {
  uni.getSystemInfo({
    success: (res) => {
      statusBarHeight.value = res.statusBarHeight ? res.statusBarHeight : 20
    },
  })
})

/**点击左侧图标或名称即可退出，前提是clickLeftBack为true */
function goback() {
  uni.navigateBack()
}
</script>

<template>
  <div
    v-if="fixed && fixedHeight"
    :style="
      'height:' +
      (statusBarHeight + 44) +
      'px;background-color:' +
      bgcolor +
      ';color:'
    "
    style="width: 100vw"
  ></div>
  <div :class="fixed ? 'pf' : ''" class="z2" style="top: 0">
    <zstatusBar v-if="props.safeBarHeight" :bgcolor="bgcolor"></zstatusBar>
    <div
      style="height: 44px; width: 100vw"
      :style="
        'font-size:' +
        titleSize +
        'px;background-color:' +
        bgcolor +
        ';color:' +
        titlecolor +
        ';' +
        (bottomborder ? 'border-bottom:1rpx solid #eeeeee' : '')
      "
      class="dfr aic pr"
    >
      <slot name="left">
        <div
          class="pa dfr aic"
          style="padding-left: 13px"
          v-if="leftIcon || leftTitle"
          @tap.stop="clickLeftBack ? goback() : emits('clickleft')"
        >
          <i
            class="iconfont"
            :class="leftIcon"
            :style="'font-size:' + leftIconSize + 'rpx'"
            v-if="leftIcon"
          ></i>
          <text style="margin-left: 3px" v-if="leftTitle">
            {{ leftTitle }}
          </text>
        </div>
      </slot>
      <slot name="center">
        <div
          class="tac"
          style="width: 100vw"
          v-if="centerTitle"
          @tap.stop="emits('clickcenter')"
        >
          {{ centerTitle }}
        </div>
      </slot>
      <slot name="right">
        <div
          class="pa"
          style="padding-right: 13px"
          v-if="rightIcon || rightTitle"
          @tap.stop="emits('clickright')"
        >
          <i class="iconfont" :class="rightIcon" v-if="rightIcon"></i>
          <text style="margin-left: 3px" v-if="rightTitle">
            {{ rightTitle }}
          </text>
        </div>
      </slot>
    </div>
  </div>
</template>

<style lang="less" scoped></style>
