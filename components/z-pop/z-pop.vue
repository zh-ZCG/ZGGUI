<!-- loading全局弹窗页面 -->
<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref, onMounted, getCurrentInstance, onUnmounted } from 'vue'

const pageName = 'z-loading'
const triggered = ref(false)
onMounted(function () {
  ready()
  triggered.value = true
})

/** 准备好 */
function ready() {}

onUnmounted(() => {
  triggered.value = false
})
</script>

<template>
  <div class="pageDom">
    <div class="pageData">
      <div class="content">
        <i
          class="t-icon t-icon-loading"
          style="height: 100rpx; width: 100rpx"
          :class="triggered ? 'anim1' : ''"
        ></i>
        <div style="margin-top: 20rpx; color: #666666">加载中,请稍后</div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.pageDom {
  > .pageData {
    position: fixed;
    width: 750rpx;
    top: 0;
    bottom: 0;
    left: 0;
    flex: 1;
    z-index: 999;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    .content {
      height: 300rpx;
      width: 300rpx;
      background-color: #fff;
      border-radius: 20rpx;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .anim1 {
        animation: start_loadding 800ms linear 100ms infinite normal none running;
      }
      @keyframes start_loadding {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    }
  }
}
</style>
