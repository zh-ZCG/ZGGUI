type FileType = 'image' | 'video' | 'media' | 'file' | 'all'

interface ChooseFileOptions {
  accept: FileType
  multiple: boolean
  capture?: string[]
  compressed?: boolean
  maxDuration?: number
  sizeType?: string[]
  camera?: 'front' | 'back'
  maxCount: number
}

interface TempFile {
  path?: string
  size: number
  name?: string
  type?: string
  tempFilePath?: string
  thumbTempFilePath?: string
  [key: string]: any
}

interface ImageRes {
  tempFiles: TempFile[]
}

interface VideoRes {
  tempFilePath: string
  thumbTempFilePath: string
  size: number
  name?: string
  [key: string]: any
}

interface MediaRes {
  tempFiles: TempFile[]
  type: 'image' | 'video'
}

interface FileRes {
  tempFiles: TempFile[]
}

function pickExclude<T extends Record<string, any>>(
  obj: T,
  keys: string[]
): Partial<T> {
  if (
    !['[object Object]', '[object File]'].includes(
      Object.prototype.toString.call(obj)
    )
  ) {
    return {}
  }

  return Object.keys(obj).reduce((prev, key) => {
    if (!keys.includes(key)) {
      ;(prev as T)[key as keyof T] = obj[key as keyof T]
    }
    return prev
  }, {} as Partial<T>)
}

function formatImage(res: ImageRes) {
  return res.tempFiles.map(item => ({
    ...pickExclude(item, ['path']),
    type: 'image',
    url: item.path!,
    thumb: item.path!,
    size: item.size,
    // #ifdef H5
    name: item.name,
    // #endif
  }))
}

function formatVideo(res: VideoRes) {
  return [
    {
      ...pickExclude(res, ['tempFilePath', 'thumbTempFilePath', 'errMsg']),
      type: 'video',
      url: res.tempFilePath,
      thumb: res.thumbTempFilePath,
      size: res.size,
      // #ifdef H5
      name: res.name,
      // #endif
    },
  ]
}

function formatMedia(res: MediaRes) {
  return res.tempFiles.map(item => ({
    ...pickExclude(item, ['fileType', 'thumbTempFilePath', 'tempFilePath']),
    type: res.type,
    url: item.tempFilePath!,
    thumb: res.type === 'video' ? item.thumbTempFilePath! : item.tempFilePath!,
    size: item.size,
  }))
}

function formatFile(res: FileRes) {
  return res.tempFiles.map(item => ({
    ...pickExclude(item, ['path']),
    url: item.path!,
    size: item.size,
    // #ifdef H5
    name: item.name,
    type: item.type,
    // #endif
  }))
}

export function chooseFile({
  accept,
  multiple,
  capture,
  compressed,
  maxDuration,
  sizeType,
  camera,
  maxCount,
}: ChooseFileOptions): Promise<any> {
  return new Promise((resolve, reject) => {
    switch (accept) {
      case 'image':
        uni.chooseImage({
          count: multiple ? Math.min(maxCount, 9) : 1,
          sourceType: capture,
          sizeType,
          success: res => resolve(formatImage(res as ImageRes)),
          fail: reject,
        })
        break
      // #ifdef MP-WEIXIN
      // 只有微信小程序才支持chooseMedia接口
      case 'media':
        wx.chooseMedia({
          count: multiple ? Math.min(maxCount, 9) : 1,
          sourceType: capture,
          maxDuration,
          sizeType,
          camera,
          success: res => resolve(formatMedia(res as MediaRes)),
          fail: reject,
        })
        break
      // #endif
      case 'video':
        uni.chooseVideo({
          sourceType: capture,
          compressed,
          maxDuration,
          camera,
          success: res => resolve(formatVideo(res as any)),
          fail: reject,
        })
        break
      // #ifdef MP-WEIXIN || H5
      // 只有微信小程序才支持chooseMessageFile接口
      case 'file':
        // #ifdef MP-WEIXIN
        wx.chooseMessageFile({
          count: multiple ? maxCount : 1,
          type: accept,
          success: res => resolve(formatFile(res as FileRes)),
          fail: reject,
        })
        // #endif
        break
      // #endif
      default:
        // 此为保底选项，在accept不为上面任意一项的时候选取全部文件
        // #ifdef MP-WEIXIN
        wx.chooseMessageFile({
          count: multiple ? maxCount : 1,
          type: 'all',
          success: res => resolve(formatFile(res as FileRes)),
          fail: reject,
        })
        // #endif
        // #ifdef H5
        // 需要hx2.9.9以上才支持uni.chooseFile
        uni.chooseFile({
          count: multiple ? maxCount : 1,
          type: 'all',
          success: res => resolve(formatFile(res as FileRes)),
          fail: reject,
        })
      // #endif
    }
  })
}
