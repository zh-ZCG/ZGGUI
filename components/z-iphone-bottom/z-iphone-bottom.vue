<!-- 该组件作用是适配iphonex底部按键冲突高度问题 -->
<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref, getCurrentInstance, watch } from 'vue'
import type { Ref, PropType } from 'vue'

const iphonebottom = ref(60) //默认60rpx高度

onLoad(() => {
  uni.getSystemInfo({
    success: res => {
      iphonebottom.value =
        res.safeAreaInsets?.bottom != null && res.safeAreaInsets?.bottom != undefined
          ? res.safeAreaInsets?.bottom
          : 60
    },
  })
})
</script>

<template>
  <div :style="'height:' + iphonebottom + 'rpx'" style="width: 100vw"></div>
</template>

<style lang="less" scoped></style>
