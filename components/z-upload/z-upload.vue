<!--
 * @Description: z-upload 上传组件
 * @Author: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * Copyright (c) 2024, All Rights Reserved. 
-->
<script lang="ts" setup>
import { ref, onMounted, getCurrentInstance, computed, watch } from 'vue'
import type { Ref } from 'vue'
import z from '../../libs/z'
import zTest from '../../libs/zTest'
import zIcon from '../../components/z-icon/z-icon.vue'
import zLoadingIcon from '../../components/z-loading-icon/z-loading-icon.vue'
import { chooseFile } from '../../libs/zUploadUtils'
import { propsHook, PropsTypeHook, openPage } from '../../libs/zHooks'

/**
 * @description: z-upload 上传组件传参
 * @param: accept    文件类型（all/media/image(默认)/file/video）
 * @param: capture     图片选取模式，可选值为 camera/album (直接调起摄像头)
 * @param: compressed	    当accept为video时生效，是否压缩视频，默认为true
 * @param: camera	    当accept为video时生效，可选值为(back(默认)/front)
 * @param: maxDuration    当accept为video时生效，拍摄视频最长时间（默认 60s ）
 * @param: uploadIcon     上传区域的图标，只能内置图标（默认 'tianjia' ）
 * @param: uploadIconColor		上传区域的图标的字体颜色，只能内置图标（默认 #666666 ）
 * @param: useBeforeRead		是否开启文件读取前事件（默认 false ）
 * @param: previewFullImage	是否启用组件自带的图片预览功能（默认 true ）
 * @param: maxCount			最大上传数量（默认 9 ）
 * @param: disabled			是否启用（默认 false ）
 * @param: imageMode			预览上传的图片时的裁剪模式，与z-image组件mode属性一致（默认 'aspectFill' ）
 * @param: name				标识符，可以在回调函数的第二项参数中获取
 * @param: sizeType			所选的图片的尺寸, 可选值为original compressed（默认为['original', 'compressed'] ）
 * @param: multiple			是否开启图片多选 （默认 false ）
 * @param: deletable			是否展示删除按钮（默认 true ）
 * @param: maxSize				文件大小限制，单位为byte （默认 99999999 ）
 * @param: fileList			显示已上传的文件列表
 * @param: uploadText			上传区域的提示文字
 * @param: width				预览图片区域和选择图片区域宽度（默认 80px ）
 * @param: height				预览图片区域和选择图片区域高度（默认 80px ）
 * @param: otherStyle		组件其他样式
 * @param: afterRead		读取后的处理函数
 * @param: beforeRead		读取前的处理函数
 * @event: error	返回错误
 * @event: afterRead		读取后的处理函数
 * @event: beforeRead		读取前的处理函数
 * @event: oversize		文件超出大小限制
 * @event: delete 		删除图片
 * @tutorial: ZGGUI & ui.zggui.cn & zcgamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  accept?: 'all' | 'image' | 'video'
  capture?: 'album' | 'camera' | ['album', 'camera']
  compressed?: boolean
  camera?: 'back' | 'front'
  maxDuration?: number
  uploadIcon?: string
  uploadIconColor?: string
  useBeforeRead?: boolean
  previewFullImage?: boolean
  maxCount?: number
  disabled?: boolean
  imageMode?: string
  name?: string
  sizeType?: Array<string>
  multiple?: boolean
  deletable?: boolean
  maxSize?: number
  fileList?: Array<any>
  uploadText?: string
  width?: string | number
  height?: string | number
  previewImage?: boolean
  afterRead?: Function
  beforeRead?: Function
}

interface EmitsType {
  (e: 'error', data: any): void
  (e: 'beforeRead', data: any): void
  (e: 'afterRead', data: any): void
  (e: 'oversize', data: any): void
  (e: 'delete', data: any): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  accept: 'image',
  capture: () => ['album', 'camera'],
  compressed: true,
  camera: 'back',
  maxDuration: 60,
  uploadIcon: 'tianjia',
  uploadIconColor: '#666666',
  useBeforeRead: false,
  previewFullImage: true,
  maxCount: 9,
  disabled: false,
  imageMode: 'aspectFill',
  name: '',
  sizeType: () => ['original', 'compressed'],
  multiple: false,
  deletable: true,
  maxSize: 99999999,
  fileList: () => [],
  uploadText: '',
  width: 80,
  height: 80,
  previewImage: true,
})

const emits = defineEmits<EmitsType>()

// #ifdef APP-NVUE
const successIcon = ref(
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAKKADAAQAAAABAAAAKAAAAAB65masAAACP0lEQVRYCc3YXygsURwH8K/dpcWyG3LF5u/6/+dKVylSypuUl6uUPMifKMWL8oKEB1EUT1KeUPdR3uTNUsSLxb2udG/cbvInNuvf2rVnazZ/ZndmZ87snjM1Z+Z3zpzfp9+Z5mEAhlvjRtZgCKs+gnPAOcAkkMOR4jEHfItjDvgRxxSQD8cM0BuOCaAvXNCBQrigAsXgggYUiwsK0B9cwIH+4gIKlIILGFAqLiBAOTjFgXJxigJp4BQD0sIpAqSJow6kjSNAFTnRaHJwLenD6Mud52VQAcrBfTd2oyq+HtGaGGWAcnAVcXWoM3bCZrdi+ncPfaAcXE5UKVpdW/vitGPqqAtn98d0gXJwX7Qp6MmegUYVhvmTIezdmHlxJCjpHRTCFerLkRRu4k0aqdajN3sWOo0BK//msHa+xDuPC/oNFMKRhTtM4xjIX0SCNpXL4+7VIaHuyiWEp2L7ahWLf8fejfPdqPmC3mJicORZUp1CQzm+GiphvljGk+PBvWRbxii+xVTj5M6CiZ/tsDufvaXyxEUDxeLIyvu3m0iOyEFWVAkydcVYdyFrE9tQk9iMq6f/GNlvwt3LjQfh60LUrw9/cFyyMJUW/XkLSNMV4Mi6C5ML+ui4x5ClAX9sB9w0wV6wglJwJCv5fOxcr6EstgbGiEw4XcfUry4cWrcEUW8n+ARKxXEJHhw2WG43UKSvwI/TSZgvl7kh0b3XLZaLEy0QmMgLZAVH7J+ALOE+AVnDvQOyiPMAWcW5gSzjCPAV+78S5WE0GrQAAAAASUVORK5CYII='
)
// #endif

const lists = ref<any[]>([])

const isInCount = ref(true)

watch(
  () => props.fileList,
  (newVal) => {
    formatFileList()
  },
  {
    immediate: true,
  }
)

function formatFileList() {
  const listsCopy = props.fileList.map((item: any) =>
    Object.assign(Object.assign({}, item), {
      // 如果item.url为本地选择的blob文件的话，无法判断其为video还是image，此处优先通过accept做判断处理
      isImage: props.accept === 'image' || zTest.image(item.url || item.thumb),
      isVideo: props.accept === 'video' || zTest.video(item.url || item.thumb),
      deletable:
        typeof item.deletable === 'boolean' ? item.deletable : props.deletable,
    })
  )
  lists.value = listsCopy
  isInCount.value = listsCopy.length < props.maxCount
}
function chooseFileUpload() {
  if (props.disabled) return
  // 如果用户传入的是字符串，需要格式化成数组
  let capture
  try {
    capture = zTest.array(props.capture)
      ? props.capture
      : (props.capture as string).split(',')
  } catch (e) {
    capture = []
  }
  chooseFile(
    Object.assign(
      {
        accept: props.accept,
        multiple: props.multiple,
        capture: capture,
        compressed: props.compressed,
        maxDuration: props.maxDuration,
        sizeType: props.sizeType,
        camera: props.camera,
      },
      {
        maxCount: props.maxCount - lists.value.length,
      }
    )
  )
    .then((res) => {
      onBeforeRead(props.multiple ? res : res[0])
    })
    .catch((error) => {
      emits('error', error)
    })
}
// 文件读取之前
function onBeforeRead(file: any) {
  let res: any = true
  // beforeRead是否为一个方法
  if (zTest.func(props.beforeRead)) {
    // 如果用户定义了此方法，则去执行此方法，并传入读取的文件回调
    res = (props.beforeRead as Function)(file, getDetail())
  }
  if (props.useBeforeRead) {
    res = new Promise((resolve, reject) => {
      emits(
        'beforeRead',
        Object.assign(
          Object.assign(
            {
              file,
            },
            getDetail()
          ),
          {
            callback: (ok: any) => {
              ok ? resolve(1) : reject()
            },
          }
        )
      )
    })
  }
  if (!res) {
    return
  }
  if (zTest.promise(res)) {
    res.then((data: any) => onAfterRead(data || file))
  } else {
    onAfterRead(file)
  }
}
function getDetail(index?: number) {
  return {
    name: props.name,
    index: index == null ? props.fileList.length : index,
  }
}
function onAfterRead(file: any) {
  const oversize = Array.isArray(file)
    ? file.some((item) => item.size > props.maxSize)
    : file.size > props.maxSize
  if (oversize) {
    emits(
      'oversize',
      Object.assign(
        {
          file,
        },
        getDetail()
      )
    )
    console.log(lists.value)
    return
  }
  if (typeof props.afterRead === 'function') {
    props.afterRead(file, getDetail())
  }
  emits(
    'afterRead',
    Object.assign(
      {
        file,
      },
      getDetail()
    )
  )
}
function deleteItem(index: number) {
  emits(
    'delete',
    Object.assign(Object.assign({}, getDetail(index)), {
      file: props.fileList[index],
    })
  )
}
// 预览图片
function onPreviewImage(item: any) {
  if (!item.isImage || !props.previewFullImage) return
  uni.previewImage({
    // 先filter找出为图片的item，再返回filter结果中的图片url
    urls: lists.value
      .filter(
        (item) =>
          props.accept === 'image' || zTest.image(item.url || item.thumb)
      )
      .map((item) => item.url || item.thumb),
    current: item.url || item.thumb,
    fail() {
      console.log('预览图片失败')
    },
  })
}
</script>

<template>
  <div
    class="dfc f1 z-upload"
    id="z-upload"
    ref="z-upload"
    :style="z.addStyle(props.otherStyle)"
  >
    <div class="df fww f1">
      <template v-if="props.previewImage">
        <div
          class="pr ofh df"
          style="margin: 0 8px 8px 0"
          v-for="(item, index) in lists"
          :key="index"
        >
          <image
            v-if="item.isImage || (item.type && item.type === 'image')"
            :src="item.thumb || item.url"
            :mode="props.imageMode"
            @tap="onPreviewImage(item)"
            :style="
              'width:' + z.addUnit(width) + ';height:' + z.addUnit(height)
            "
          ></image>
          <div
            v-else
            class="dfc aic jcc f1"
            :style="[
              {
                width: z.addUnit(width),
                height: z.addUnit(height),
              },
            ]"
          >
            <zIcon
              color="#80CBF9"
              size="26"
              :name="
                item.isVideo || (item.type && item.type === 'video')
                  ? 'movie'
                  : 'folder'
              "
            ></zIcon>
            <text class="z-upload-preview-text">
              {{
                item.isVideo || (item.type && item.type === 'video')
                  ? '视频'
                  : '文件'
              }}
            </text>
          </div>
          <div
            class="pa dfc aic jcc z-upload-status"
            v-if="item.status === 'uploading' || item.status === 'failed'"
          >
            <div class="pr" style="z-index: 1">
              <zIcon
                v-if="item.status === 'failed'"
                name="cuowu-circle"
                color="#ffffff"
                size="25"
              ></zIcon>
              <zLoadingIcon
                size="22"
                mode="circle"
                color="#ffffff"
                v-else
              ></zLoadingIcon>
            </div>
            <text v-if="item.message" class="message">
              {{ item.message }}
            </text>
          </div>
          <div
            class="pa df jcc aic z-upload-deletable"
            v-if="
              item.status !== 'uploading' && (props.deletable || item.deletable)
            "
            @tap.stop="deleteItem(index)"
          >
            <div class="pa icon">
              <zIcon name="cuowu" color="#fff" size="10"></zIcon>
            </div>
          </div>
          <div class="pa df z-upload-success" v-if="item.status === 'success'">
            <!-- #ifdef APP-NVUE -->
            <image :src="successIcon" class="icon"></image>
            <!-- #endif -->
            <!-- #ifndef APP-NVUE -->
            <div class="icon">
              <zIcon name="zhengque" color="#fff" size="12"></zIcon>
            </div>
            <!-- #endif -->
          </div>
        </div>
      </template>
      <template v-if="isInCount">
        <div v-if="$slots.default || $slots.$default" @tap="chooseFileUpload">
          <slot></slot>
        </div>
        <div
          v-else
          class="dfc aic jcc z-upload-button"
          :hover-class="!props.disabled ? 'hover' : ''"
          hover-stay-time="150"
          @tap="chooseFileUpload"
          :class="[props.disabled && 'disabled']"
          :style="[
            {
              width: z.addUnit(props.width),
              height: z.addUnit(props.height),
            },
          ]"
        >
          <zIcon
            :name="props.uploadIcon"
            size="26"
            :color="props.uploadIconColor"
          ></zIcon>
          <text v-if="props.uploadText" class="text">
            {{ props.uploadText }}
          </text>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="less" scoped>
.z-upload-preview-text {
  font-size: 12px;
  color: #1a1a1a;
  margin-top: 2px;
}
.z-upload-status {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  .message {
    font-size: 13px;
    color: #fff;
    margin-top: 5px;
  }
}
.z-upload-deletable {
  top: 0;
  right: 0;
  background-color: rgb(55, 55, 55);
  height: 14px;
  width: same-as-height;
  z-index: 3;
  .icon {
    transform: scale(0.7);
    top: 0px;
    right: 0px;
    /* #ifdef H5 */
    top: 1px;
    right: 0px;
    /* #endif */
  }
}
.z-upload-success {
  bottom: 0;
  right: 0;
  /* #ifndef APP-NVUE */
  border-style: solid;
  border-top-color: transparent;
  border-left-color: transparent;
  border-bottom-color: @success;
  border-right-color: @success;
  border-width: 9px;
  align-items: center;
  justify-content: center;
  /* #endif */
  .icon {
    /* #ifndef APP-NVUE */
    position: absolute;
    transform: scale(0.7);
    bottom: -10px;
    right: -10px;
    /* #endif */
    /* #ifdef APP-NVUE */
    width: 16px;
    height: 16px;
    /* #endif */
  }
}
.z-upload-button {
  background-color: rgb(244, 245, 247);
  border-radius: 2px;
  margin: 0 8px 8px 0;
  /* #ifndef APP-NVUE */
  box-sizing: border-box;
  /* #endif */
  .text {
    font-size: 12px;
    color: @info;
    margin-top: 2px;
  }

  .hover {
    background-color: rgb(230, 231, 233);
  }

  .disabled {
    opacity: 0.5;
  }
}
</style>
