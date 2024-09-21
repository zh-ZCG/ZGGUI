<!-- 状态栏安全高度 -->
<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref, getCurrentInstance, watch, onMounted } from 'vue'
import type { Ref, PropType } from 'vue'

const statusBarHeight = ref(20) //默认40rpx

export interface PropsType {
  bgcolor: string
}

export interface EmitsType {}

const props = withDefaults(defineProps<PropsType>(), {
  bgcolor: '',
})

onMounted(() => {
  uni.getSystemInfo({
    success: res => {
      statusBarHeight.value = res.statusBarHeight ? res.statusBarHeight : 20
    },
  })
})
</script>

<template>
  <div
    :style="
      'height:' + statusBarHeight + 'px;background-color:' + props.bgcolor + ';'
    "
    style="width: 100vw"
  ></div>
</template>

<style lang="less" scoped></style>
