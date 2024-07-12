import {useLazyMemo} from '@dnd-kit-vue/utilities';
import { computed, type ComputedRef, Ref, ref } from 'vue'

type AnyFunction = (...args: any) => any;

export function useInitialValue<
  T extends Ref,
  U extends AnyFunction | undefined = undefined
>(
  value: T | null,
  computeFn?: U
): ComputedRef<any> {
  const previousValue = ref()
  return computed(()=>{
    function getData() {
      if (!value?.value) {
        return null;
      }

      if (previousValue.value) {
        return previousValue.value;
      }


      return typeof computeFn === 'function' ? computeFn(value.value) : value.value;
    }
    return getData()
  })
}
