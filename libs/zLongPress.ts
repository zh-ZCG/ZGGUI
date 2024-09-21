import type { Ref } from 'vue'
/**
 * 用于处理长按事件的钩子函数。支持在长按时重复触发指定事件。
 *
 * @param event - 要在长按时触发的事件函数。
 * @param enabled - 一个 Ref 对象，表示长按功能是否启用。
 * @param longPressIntervel - 长按事件的触发间隔，默认值为 250 毫秒。
 * @returns 一个对象，包含处理长按事件的函数和清除长按定时器的函数。
 */
export const zLongPress = <T extends any[]>(
  event: (...args: T) => void,
  enabled: Ref<boolean>,
  longPressIntervel = 250
) => {
  // 长按判断定时器
  let longPressTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * 清除长按判断定时器
   */
  const clearLongPressTimer = () => {
    if (longPressTimer) {
      clearInterval(longPressTimer)
      longPressTimer = null
    }
  }

  /**
   * 处理长按事件
   *
   * @param args - 传递给事件函数的参数。
   */
  const handleLongPressEvent = (...args: T) => {
    if (enabled.value) {
      event(...args)
      clearLongPressTimer()
      longPressTimer = setInterval(() => {
        event(...args)
      }, longPressIntervel)
    } else {
      event(...args)
    }
  }

  return {
    handleLongPressEvent,
    clearLongPressTimer,
  }
}
