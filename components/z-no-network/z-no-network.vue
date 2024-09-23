<!--
 * @Description: z-np-network 无网络提示组件
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
import zOverlay from '@/ZGGUI/components/z-overlay/z-overlay.vue'
import zIcon from '@/ZGGUI/components/z-icon/z-icon.vue'
import zButton from '@/ZGGUI/components/z-button/z-button.vue'
import { propsHook, PropsTypeHook } from '@/ZGGUI/libs/zHooks'
/**
 * @description: z-np-network 无网络提示组件传参
 * @param: tips 没有网络时的提示语（默认：'网络信号丢失，请检查' ）
 * @param: zIndex		zIndex
 * @param: image	无网络的图片提示，可用的src地址或base64图片或内置图标
 *
 * @event: retry 重试
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zggui.cn & zggamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  tips?: string
  zIndex?: string | number
  image?: string
}

interface EmitsType {
  (e: 'retry'): void
  (e: 'disconnected'): void
  (e: 'connected'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  tips: '网络信号丢失，请检查',
  zIndex: 6000,
  image: 'empty-network',
})

const emits = defineEmits<EmitsType>()

const isConnected = ref(true)
const networkType = ref('none')

const isIOS = ref(false)

onMounted(() => {
  isIOS.value = uni.getSystemInfoSync().platform === 'ios'
  uni.onNetworkStatusChange((res) => {
    isConnected.value = res.isConnected
    networkType.value = res.networkType
    emitEvent(networkType.value)
  })
  uni.getNetworkType({
    success: (res) => {
      networkType.value = res.networkType
      emitEvent(networkType.value)
      if (res.networkType == 'none') {
        isConnected.value = false
      } else {
        isConnected.value = true
      }
    },
  })
})

function retry() {
  // 重新检查网络
  uni.getNetworkType({
    success: (res) => {
      networkType.value = res.networkType
      emitEvent(networkType.value)
      if (res.networkType == 'none') {
        isConnected.value = false
      } else {
        isConnected.value = true
      }
    },
  })
  emits('retry')
}
// 发出事件给父组件
function emitEvent(networkType: string) {
  if (networkType === 'none') {
    emits('disconnected')
  } else {
    emits('connected')
  }
}
async function openSettings() {
  if (networkType.value == 'none') {
    openSystemSettings()
    return
  }
}
function openSystemSettings() {
  // 以下方法来自5+范畴，如需深究，请自行查阅相关文档
  // https://ask.dcloud.net.cn/docs/
  if (isIOS.value) {
    gotoiOSSetting()
  } else {
    gotoAndroidSetting()
  }
}
function gotoiOSSetting() {
  var UIApplication = (plus.ios as any).import('UIApplication')
  var application2 = UIApplication.sharedApplication()
  var NSURL2 = (plus.ios as any).import('NSURL')
  var setting2 = NSURL2.URLWithString('App-prefs:root=General')
  application2.openURL(setting2)
  plus.ios.deleteObject(setting2)
  plus.ios.deleteObject(NSURL2)
  plus.ios.deleteObject(application2)
}
function gotoAndroidSetting() {
  var Intent = plus.android.importClass('android.content.Intent') as any
  var Settings = plus.android.importClass('android.provider.Settings')
  var mainActivity = plus.android.runtimeMainActivity()
  var intent = new Intent((Settings as any).ACTION_SETTINGS) as any
  ;(mainActivity as any).startActivity(intent)
}
</script>

<template>
  <zOverlay
    :show="!isConnected"
    :zIndex="zIndex"
    @touchmove.stop.prevent="1"
    :other-style="{
      backgroundColor: '#fff',
      display: 'flex',
      justifyContent: 'center',
    }"
  >
    <div class="z-no-network dfc jcc aic">
      <zIcon
        :name="image"
        :size="150"
        :width="150"
        :height="150"
        imgMode="widthFit"
      ></zIcon>
      <text class="tips">{{ tips }}</text>
      <!-- 只有APP平台，才能跳转设置页，因为需要调用plus环境 -->
      <!-- #ifdef APP-PLUS -->
      <div class="app">
        <text class="setting">请检查网络，或前往</text>
        <text class="to-setting" @tap="openSettings">设置</text>
      </div>
      <!-- #endif -->
      <div class="retry">
        <zButton
          size="normal"
          text="重试"
          type="primary"
          plain
          @click="retry"
        ></zButton>
      </div>
    </div>
  </zOverlay>
</template>

<style lang="less" scoped>
.z-no-network {
  margin-top: -100px;
  .tips {
    color: #666666;
    font-size: 14px;
    margin-top: 15px;
  }
  .app {
    display: flex;
    flex-direction: row;
    margin-top: 6px;
    .setting {
      color: #eeeeee;
      font-size: 13px;
    }
    .to-setting {
      font-size: 13px;
      color: @primary;
      margin-left: 3px;
    }
  }
  .retry {
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin-top: 15px;
  }
}
</style>
