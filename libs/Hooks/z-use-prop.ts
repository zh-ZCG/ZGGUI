import { computed, getCurrentInstance } from 'vue'
import z from '@/ZCGUI/libs/z'
import type { ComputedRef } from 'vue'

export const useProp = <T>(name: string): ComputedRef<T | undefined> => {
  const vm = getCurrentInstance()
  return computed(() => z.isEmptyVariableInDefault(vm?.proxy?.$props as any)[name])
}
