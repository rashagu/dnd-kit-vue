import { type ShallowRef, shallowRef } from 'vue'

export function useEvent<T extends Function>(handler: T | undefined):ShallowRef<T | undefined> {
  return shallowRef<T | undefined>(handler)
}
