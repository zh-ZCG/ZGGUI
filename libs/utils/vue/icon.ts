/**
 * 表单验证的图标状态显示
 */
import { definePropType } from './prop'
export const iconPropType = definePropType<string>([String])

export const FormValidateIconsMap = {
  validating: 'loading',
  success: 'success-circle',
  error: 'close-circle',
}
