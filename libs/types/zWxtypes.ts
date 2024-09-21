declare var wx: {
  /** 开启小程序页面返回询问对话框 */
  enableAlertBeforeUnload: (options: {
    /** 询问对话框内容 */
    message: string
    /** 接口调用成功的回调函数 */
    success?: (e: any) => void
    /** 接口调用失败的回调函数 */
    fail?: (e: any) => void
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: (e: any) => void
  }) => void
  /** 关闭小程序页面返回询问对话框 */
  disableAlertBeforeUnload: (options: {
    /** 接口调用成功的回调函数 */
    success?: (e: any) => void
    /** 接口调用失败的回调函数 */
    fail?: (e: any) => void
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: (e: any) => void
  }) => void
  /** 隐私接口*/
  openPrivacyContract: (options: {
    /** 接口调用成功的回调函数 */
    success?: (e: any) => void
    /** 接口调用失败的回调函数 */
    fail?: (e: any) => void
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: (e: any) => void
  }) => void
  /** 分享接口 */
  showShareMenu: (options: {
    withShareTicket: Boolean
    menus: Array<string>
    /** 接口调用成功的回调函数 */
    success?: (e: any) => void
    /** 接口调用失败的回调函数 */
    fail?: (e: any) => void
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: (e: any) => void
  }) => void
  /**判断是否同意隐私政策 */
  getPrivacySetting: (options: {
    /** 接口调用成功的回调函数 */
    success?: (e: any) => void
    /** 接口调用失败的回调函数 */
    fail?: (e: any) => void
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: (e: any) => void
  }) => void
  getFileSystemManager: () => {
    saveFile: (options: {
      tempFilePath?: string
      filePath?: string
      /** 接口调用成功的回调函数 */
      success?: (e: any) => void
      /** 接口调用失败的回调函数 */
      fail?: (e: any) => void
      /** 接口调用结束的回调函数（调用成功、失败都会执行） */
      complete?: (e: any) => void
    }) => void
  }
  downloadFile: (options: {
    url?: string
    /** 接口调用成功的回调函数 */
    success?: (e: any) => void
    /** 接口调用失败的回调函数 */
    fail?: (e: any) => void
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: (e: any) => void
  }) => void
  saveFile: (options: {
    tempFilePath?: string
    /** 接口调用成功的回调函数 */
    success?: (e: any) => void
    /** 接口调用失败的回调函数 */
    fail?: (e: any) => void
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: (e: any) => void
  }) => void
  renameFile: (options: {
    oldPath?: string
    newPath?: string
    /** 接口调用成功的回调函数 */
    success?: (e: any) => void
    /** 接口调用失败的回调函数 */
    fail?: (e: any) => void
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: (e: any) => void
  }) => void
  env: {
    USER_DATA_PATH: string
  }
  saveImageToPhotosAlbum: (options: {
    filePath?: string
    /** 接口调用成功的回调函数 */
    success?: (e: any) => void
    /** 接口调用失败的回调函数 */
    fail?: (e: any) => void
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: (e: any) => void
  }) => void

  chooseMedia: (options: {
    count?: number
    sourceType?: string[]
    maxDuration?: any
    sizeType?: any
    camera?: any
    success?: (e: any) => void
    fail?: (e: any) => void
  }) => void

  chooseVideo: (options: {
    sourceType?: string[]
    compressed?: any
    maxDuration?: any
    camera?: any
    success?: (e: any) => void
    fail?: (e: any) => void
  }) => void

  chooseMessageFile: (options: {
    count?: any
    type?: any
    success?: (e: any) => void
    fail?: (e: any) => void
  }) => void

  chooseFile: (options: {
    count?: any
    type?: any
    success?: (e: any) => void
    fail?: (e: any) => void
  }) => void
}
