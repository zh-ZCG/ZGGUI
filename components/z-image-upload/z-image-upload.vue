<!--
 * @Description: z-image-upload 仅图片上传组件
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
} from 'vue'
import z from '../../libs/z'
import zType from '../../libs/zType'
import zIcon from '../../components/z-icon/z-icon.vue'
import {
  useUploadHandleFunction,
  ImageUploadList,
} from '../../components/z-image-upload/z-image-upload'
import { propsHook, PropsTypeHook } from '../../libs/zHooks'
import { useFormItem } from '../../components/z-form/types'
import {
  ImageUploadFile,
  ImageUploadListItem,
  ImageUploadCustomFunction,
  ImageUploadCustomCallbackFunction,
  ImageBeforeUploadFunction,
  ImageBeforeRemoveFunction,
  ImageUploadSizeTypes,
  ImageUploadSources,
} from '../../components/z-image-upload/z-image-upload'
/**
 * @description: z-image-upload 仅图片上传组件传参
 * @param: modelValue 已上传的图片列表绑定值，传递的是图片的url地址
 * @param: disabled		 禁止上传
 * @param: action	图片上传地址
 * @param: name  图片上传的字段名称
 * @param: header  图片上传的header, header 中不能设置 Referer
 * @param: formData  图片上传HTTP 请求中其他额外的 form data
 * @param: limit  最大允许上传个数
 * @param: autoUpload  自动上传
 * @param: showRemove  显示删除按钮
 * @param: showErrorTips  显示错误提示信息
 * @param: showUploadProgress  显示上传进度条
 * @param: sizeType  上传图片的SizeType
 * @param: sourceType  上传图片的来源
 * @param: multiple  允许多选图片
 * @param: maxSize  允许上传的最大图片大小，单位为byte
 * @param: extensions  允许上传的图片类型
 * @param: autoRemoveFaildFile  自动移除上传失败的图片
 * @param: customUploadHandler  自定义上传函数
 * @param: customUploadCallback  自定义上传回调处理函数
 * @param: beforeUpload  上传前的钩子函数
 * @param: beforeRemove  删除前的钩子函数
 * @param: validateEvent  值发生修改时是否触发表单验证
 * @param: otherStyle 其他的样式
 *
 * @tutorial: ZGGUI & ui.zcgnav.cn & zcgamazing@163.com
 * @example:
 */

interface PropsType extends PropsTypeHook {
  modelValue?: Array<string>
  disabled?: boolean
  action?: string
  name?: string
  header?: object
  formData?: object
  limit?: number
  autoUpload?: boolean
  showRemove?: boolean
  showErrorTips?: boolean
  showUploadProgress?: boolean
  sizeType?: Array<ImageUploadSizeTypes>
  sourceType?: Array<ImageUploadSources>
  multiple?: boolean
  maxSize: number
  extensions?: Array<string>
  autoRemoveFaildFile?: boolean
  customUploadHandler?: ImageUploadCustomFunction
  customUploadCallback?: ImageUploadCustomCallbackFunction
  beforeUpload?: ImageBeforeUploadFunction
  beforeRemove?: ImageBeforeRemoveFunction
  validateEvent?: boolean
}

interface EmitsType {
  (e: 'update:modelValue', value: Array<string>): void
  (e: 'change', value: Array<string>): void
  //图片超过最大尺寸或者文件不支持时触发
  (e: 'oversizeOrNoSupport', file: Array<ImageUploadFile>): void
  //图片上传成功回调
  (e: 'success', file: ImageUploadListItem): void
  //图片上传失败回调
  (e: 'fail', error: Error, file: ImageUploadListItem): void
  //图片删除成功回调
  (e: 'remove', url: string): void
  //图片预览回调
  (e: 'preview', url: string): void
}

const props = withDefaults(defineProps<PropsType>(), {
  ...propsHook,
  modelValue: () => [],
  name: 'file',
  header: () => ({}),
  formData: () => ({}),
  limit: 9,
  autoUpload: true,
  showRemove: true,
  showErrorTips: true,
  showUploadProgress: true,
  sizeType: () => ['original', 'compressed'],
  sourceType: () => ['album', 'camera'],
  multiple: true,
  maxSize: 5 * 1024 * 1024,
  extensions: () => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'ico'],
  autoRemoveFaildFile: false,
  validateEvent: true,
})

const emits = defineEmits<EmitsType>()

const { chooseImage, uploadProcess, checkFileSizeAndExtension, showErrorTips } =
  useUploadHandleFunction(props)

const { formItem } = useFormItem()

// 文件列表
const fileList = ref<ImageUploadList>([])

// 监听文件列表变化
let isInnerUpdate = false
watch(
  () => props.modelValue,
  (val) => {
    if (isInnerUpdate) {
      isInnerUpdate = false
      return
    }

    fileList.value = val.map((item) => ({
      url: item,
      status: 'done',
      progress: 100,
    }))
  },
  {
    immediate: true,
  }
)

// 判断是否超过最大上传数
const isExceedMaxCount = computed<boolean>(
  () => fileList.value.length >= props.limit
)
// 当前剩余可选文件数量
const currentRemainFileCount = computed<number>(() => {
  if (props.multiple) {
    return props.limit - fileList.value.length
  } else {
    return props.limit - fileList.value.length > 0 ? 1 : 0
  }
})

// 选择文件
const chooseFile = async () => {
  const { disabled, action, customUploadHandler } = props
  if (disabled) return

  // 如果没有设置action或者没有自定义图片上传处理函数，则直接返回
  if (!action && !customUploadHandler) {
    showErrorTips('请设置action或者自定义图片上传处理函数')
    z.error('zImageUpload 请设置action或者自定义图片上传处理函数')
    return
  }
  // 选择前已有文件的数量
  const prevUploadedFileCount = fileList.value.length
  chooseImage(currentRemainFileCount.value)
    .then((res) => {
      let selectFile = res
      // 判断尺寸和格式是否正确
      const checkFailFiles = checkFileSizeAndExtension(selectFile)
      if (checkFailFiles.length) {
        showErrorTips('文件格式或大小不符合要求')
        emits('oversizeOrNoSupport', checkFailFiles)
        // 剔除不符合要求的文件
        selectFile = selectFile.filter((item) => !checkFailFiles.includes(item))
      }
      fileList.value.push(
        ...selectFile.map<ImageUploadListItem>((item) => {
          const url = (item as UniApp.ChooseImageSuccessCallbackResultFile).path
          return {
            url,
            status: 'ready',
            progress: 0,
            file: item,
          }
        })
      )
      if (props.autoUpload && selectFile.length)
        uploadFile(prevUploadedFileCount)
    })
    .catch((err) => {
      z.error(`zImageUpload 选择图片失败: ${err}`)
      showErrorTips(err?.errMsg || '选择图片失败')
    })
}

// 处理上传事件
const handleUploadEvent = (
  item: ImageUploadListItem,
  index: number,
  uploadSingle = false
) => {
  uploadProcess(item)
    .then((res) => {
      if (res) {
        handleUploadSuccess(item)
      } else {
        handleUploadError(item, '上传失败')
      }
    })
    .catch((err) => {
      handleUploadError(item, err)
    })
    .finally(() => {
      if (!uploadSingle) uploadFile(index + 1)
    })
}

// 上传文件
const uploadFile = (startIndex: number, uploadSingle = false) => {
  const { autoUpload, beforeUpload } = props
  const autoNextUpload = autoUpload && !uploadSingle
  // 判断是否全部文件上传完毕
  if (startIndex >= fileList.value.length) {
    if (props.autoRemoveFaildFile) handleUploadCompleteFailFile()
    return
  }

  const fileItem = fileList.value[startIndex]

  // 如果当前上传完毕自动上传下一张
  if (fileItem.progress === 100) {
    fileItem.status = 'done'
    fileItem.uploadTask = undefined
    if (autoNextUpload) uploadFile(startIndex + 1)
    return
  }

  // 上传前回调
  if (!beforeUpload) {
    handleUploadEvent(fileItem, startIndex, uploadSingle)
    return
  }

  const shouldUpload = beforeUpload(fileItem.file!)
  const isBeforeUploadPromiseOrBoolean = [
    zType.isPromise(shouldUpload),
    zType.isBoolean(shouldUpload),
  ].includes(true)
  if (!isBeforeUploadPromiseOrBoolean) {
    z.error('zImageUpload beforeUpload返回值必须是Promise或者Boolean')
  }

  if (zType.isPromise(shouldUpload)) {
    shouldUpload
      .then((res) => {
        if (res) handleUploadEvent(fileItem, startIndex, uploadSingle)
        else {
          removeFile(startIndex)
          if (autoNextUpload) uploadFile(startIndex)
        }
      })
      .catch((err) => {
        z.error(`zImageUpload beforeUpload出错: ${err}`)
        fileItem.status = 'failed'
      })
  } else {
    if (shouldUpload) handleUploadEvent(fileItem, startIndex, uploadSingle)
    else {
      removeFile(startIndex)
      if (autoNextUpload) uploadFile(startIndex)
    }
  }
}

// 获取上传成功的文件url
const getUploadSuceesFileUrlValue = () => {
  return fileList.value
    .filter((item) => item.status === 'done')
    .map((item) => item.url)
}

// 已上传文件列表发生改变
const uploadSuccessFileListChange = () => {
  isInnerUpdate = true
  const value = getUploadSuceesFileUrlValue()
  emits('update:modelValue', value)
  nextTick(() => {
    emits('change', value)
    if (props.validateEvent) {
      formItem?.validate?.('change').catch((err) => {
        z.error(err)
      })
    }
  })
}

// 处理文件上传成功
const handleUploadSuccess = (item: ImageUploadListItem) => {
  item.status = 'done'
  item.progress = 100
  item.uploadTask = undefined
  item.file = undefined
  emits('success', item)
  uploadSuccessFileListChange()
}

// 处理上传文件发生错误
const handleUploadError = (item: ImageUploadListItem, errorMsg: string) => {
  item.status = 'failed'
  item.progress = 0
  item.uploadTask = undefined
  item.file = undefined
  showErrorTips(errorMsg)
  emits('fail', new Error(errorMsg), item)
}

// 处理上传完成后失败的文件
const handleUploadCompleteFailFile = () => {
  const tempFileList = [...fileList.value]
  tempFileList.forEach((item, index) => {
    if (item.status === 'failed') {
      removeFile(index)
    }
  })
}

// 重新上传文件
const retryUploadFile = (index: number) => {
  const fileItem = fileList.value[index]
  fileItem.status = 'ready'
  fileItem.progress = 0
  uploadFile(index, true)
}

// 重新上传全部文件
const retryAllUpload = () => {
  // 查找出第一张上传失败的图片
  const firstFailedFileIndex = fileList.value.findIndex(
    (item) => item.status === 'failed'
  )
  uploadFile(firstFailedFileIndex)
}

// 手动上传文件
const customUploadHandle = () => {
  if (!fileList.value.length) return
  uploadFile(0)
}

// 移除文件
const removeFile = (index: number) => {
  const fileItem = fileList.value[index]

  // 如果文件正在上传中，取消上传
  if (
    fileItem.status === 'uploading' &&
    fileItem.uploadTask &&
    fileItem.progress > 0 &&
    fileItem.progress < 100
  ) {
    fileItem.uploadTask.abort()
  }

  fileList.value.splice(index, 1)

  // 如果文件是已经完成的，重新计算上传成功的文件url
  if (fileItem.status === 'done') {
    emits('remove', fileItem.url)
    uploadSuccessFileListChange()
  }
}

// 删除文件
const removeFileEvent = (index: number) => {
  const { disabled, beforeRemove } = props
  if (disabled) return
  // 获取待删除的文件
  const fileItem = fileList.value[index]
  if (!fileItem) return

  uni.showModal({
    title: '操作提示',
    content: '确认需要移除该图片吗?',
    showCancel: true,
    cancelText: '取 消',
    confirmText: '确 认',
    success: (res) => {
      if (res.confirm) {
        // 删除前回调
        if (!beforeRemove) {
          removeFile(index)
          return
        }

        const shouldRemove = beforeRemove(fileItem)
        const isShouldRemovePromiseOrBoolean = [
          zType.isPromise(shouldRemove),
          zType.isBoolean(shouldRemove),
        ].includes(true)
        if (!isShouldRemovePromiseOrBoolean) {
          z.error('zImageUpload beforeRemove返回值必须是Promise或者Boolean')
        }

        if (zType.isPromise(shouldRemove)) {
          shouldRemove
            .then((res) => {
              if (res) removeFile(index)
            })
            .catch((err) => {
              z.error(`zImageUpload beforeRemove出错: ${err}`)
            })
        } else {
          if (shouldRemove) removeFile(index)
        }
      }
    },
  })
}

// 清空文件列表
const clearAllFile = () => {
  // 如果文件正在上传中，取消上传
  fileList.value.forEach((item) => {
    if (
      item.status === 'uploading' &&
      item.uploadTask &&
      item.progress > 0 &&
      item.progress < 100
    ) {
      item.uploadTask.abort()
    }
  })
  fileList.value = []
  uploadSuccessFileListChange()
}

// 点击图片预览图片
const previewImage = (index: number) => {
  const previewImageList = fileList.value
    .filter((item) => item.status === 'done')
    .map((item) => item.url)

  uni.previewImage({
    current: index,
    urls: previewImageList,
  })

  emits('preview', previewImageList[index])
}

defineExpose({
  /**
   * @description 手动选择文件
   */
  chooseFile,
  /**
   * @description 手动上传图片
   */
  upload: customUploadHandle,
  /**
   * @description 重新上传失败的文件
   */
  retry: retryAllUpload,
  /**
   * @description 清空所有文件
   */
  clear: clearAllFile,
})
</script>

<template>
  <div class="z-image-upload pr df fww">
    <!-- 上传列表 -->
    <div
      v-for="(item, index) in fileList"
      :key="index"
      class="item pr ofh"
      :class="!!$slots.uploadImage ? 'custom' : ''"
    >
      <slot name="uploadImage" :data="item">
        <!-- 已上传图片 -->
        <div class="upload-image pa" @tap.stop="previewImage(index)">
          <image class="image" :src="item.url" mode="aspectFill"></image>
        </div>
        <!-- 删除按钮 -->
        <div
          v-if="showRemove && !disabled"
          class="remove pa"
          @tap.stop="removeFileEvent(index)"
        >
          <div class="icon pa">
            <zIcon name="cuowu-circle"></zIcon>
          </div>
        </div>
        <!-- 重试蒙层 -->
        <div
          v-if="item.status === 'failed' && !disabled"
          class="retry pa df jcc aic"
          @tap.stop="retryUploadFile(index)"
        >
          <zIcon name="loading" :size="50"></zIcon>
        </div>
        <!-- 进度波浪 -->
        <!-- 进度0 ~ 100 => -300 ~ -400 -->
        <div
          v-if="
            showUploadProgress &&
            item.progress > 0 &&
            item.progress < 100 &&
            !disabled
          "
          class="progress pa"
          :class="item.progress === 100 ? 'finish' : ''"
        >
          <div
            class="wave pa"
            :style="{ top: `${-300 - item.progress}%` }"
          ></div>
          <div
            class="wave pa"
            :style="{ top: `${-300 - item.progress}%` }"
          ></div>
        </div>
      </slot>
    </div>
    <!-- 上传按钮 -->
    <template v-if="!isExceedMaxCount && !disabled">
      <slot name="uploadBtn">
        <div class="item" @tap.stop="chooseFile">
          <div class="add-btn pa">
            <slot name="addBtn">
              <div class="icon pa">
                <zIcon name="upload" :size="50"></zIcon>
              </div>
            </slot>
          </div>
        </div>
      </slot>
    </template>
  </div>
</template>

<style lang="less" scoped>
.z-image-upload {
  width: 100%;
  .item {
    flex-grow: 0;
    width: calc(100% / 3 - 20rpx);
    height: 0;
    padding-bottom: calc(100% / 3 - 20rpx);
    border-radius: 15rpx;
    margin-right: 20rpx;
    margin-bottom: 20rpx;
    position: relative;
    border: 2rpx solid #666666;
    .upload-image {
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      will-change: transform;
      z-index: 1;
      .image {
        width: 100%;
        height: 100%;
        border-radius: inherit;
      }
    }
    .finish {
      opacity: 0;
    }
    .remove {
      right: 0;
      top: 0;
      background-color: transparent;
      color: #fff;
      width: 0;
      height: 0;
      z-index: 6;
      border-top: 70rpx solid @error;
      border-left: 70rpx solid transparent;
      .icon {
        top: -82rpx;
        right: 5rpx;
        transform: translateY(50%);
        line-height: 1;
      }
    }
    .retry {
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.2);
      color: #fff;
      z-index: 5;
      font-size: 110rpx;
      line-height: 1;
    }
    .progress {
      left: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      z-index: 2;
      opacity: 1;
      background-color: rgba(247, 248, 247, 0);
      transition-property: opacity;
      transition-duration: 0.8s;
      transition-timing-function: linear;
      transition-delay: 0.3s;
      .wave {
        width: calc(100% * 4);
        height: calc(100% * 4);
        top: -300%;
        left: 50%;
        z-index: 2;
        background-color: rgba(170, 170, 170, 0.5);
        border-radius: 45%;
        transform: translateX(-50%) rotate(0);
        animation: rotate 4s linear infinite;
        & + & {
          z-index: 3;
          background-color: rgba(170, 170, 170, 0.8);
          border-radius: 47%;
          animation: rotate 9s linear -4s infinite;
        }

        @keyframes rotate {
          50% {
            transform: translateX(-50%) rotate(180deg);
          }
          100% {
            transform: translateX(-50%) rotate(360deg);
          }
        }
      }
    }
    .add-btn {
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      border-radius: inherit;
      .icon {
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-size: 100rpx;
      }
    }
  }
  .custom {
    flex: auto;
    width: 100%;
    height: auto;
    padding: 0rpx;
    border-radius: 0rpx;
    margin: 0;
  }
}
</style>
