<!--
 * @Description: z-avatar-group 头像组组件
 * @Author: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import { computed } from 'vue'
import zAvatar from '../../components/z-avatar/z-avatar.vue'
import zText from '../../components/z-text/z-text.vue'
import zTest from '../../libs/zTest'
import z from '../../libs/z'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
/**
 * @description: z-avatar-group 头像组组件传参
 * @param: urls     头像图片组 （默认 [] ）
 * @param: maxCount 最多展示的头像数量 （ 默认 5 ）
 * @param: shape    头像形状（ 'circle' (默认) | 'square' ）
 * @param: mode     图片裁剪模式（默认 'scaleToFill' ）
 * @param: showMore 超出maxCount时是否显示查看更多的提示 （默认 true ）
 * @param: size     头像大小 （默认 40 ）
 * @param: keyName  指定从数组的对象元素中读取哪个属性作为图片地址
 * @param: gap      头像之间的遮挡比例（0.4代表遮挡40%）  （默认 0.5 ）
 * @param: extraValue  需额外显示的值
 * @event  showMore 头像组更多点击
 * @param: otherStyle 其他的样式
 *
 * @event: click 点击触发
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  urls?: Array<string>
  maxCount?: string | number
  shape?: string
  mode?: string
  showMore?: boolean
  size?: string | number
  keyName?: string
  gap?: string | number
  extraValue?: string | number
}

interface EmitsType {
  (e: 'showMore'): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  urls: () => [],
  maxCount: 5,
  shape: 'circle',
  mode: 'scaleToFill',
  showMore: true,
  size: 40,
  keyName: '',
  gap: 0.5,
  extraValue: 0,
})

const emits = defineEmits<EmitsType>()

const showUrl = computed(() => {
  return props.urls.slice(0, Number(props.maxCount))
})

function clickHandler() {
  emits('showMore')
}
</script>

<template>
  <div class="z-avatar-group df">
    <div
      class="item pr"
      v-for="(item, index) in showUrl"
      :key="index"
      :style="{
        marginLeft: index === 0 ? 0 : z.addUnit(-size * gap),
      }"
    >
      <zAvatar
        :size="size"
        :shape="shape"
        :mode="mode"
        :src="
          zTest.object(item) ? (keyName && item[keyName]) || item.url : item
        "
      ></zAvatar>
      <div
        class="show-more pa df jcc aic"
        v-if="
          showMore &&
          index === showUrl.length - 1 &&
          (urls.length > maxCount || extraValue > 0)
        "
        @tap="clickHandler"
      >
        <zText
          color="#ffffff"
          :size="size * 0.4"
          :text="`+${extraValue || urls.length - showUrl.length}`"
          align="center"
          :otherStyle="{ justifyContent: center }"
        ></zText>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-avatar-group {
  .item {
    margin-left: -10px;

    &--no-indent {
      margin-left: 0;
    }

    .show-more {
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: rgba(0, 0, 0, 0.3);
      border-radius: 100px;
    }
  }
}
</style>
