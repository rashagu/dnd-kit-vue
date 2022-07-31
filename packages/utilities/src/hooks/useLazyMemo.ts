
import {computed, ComputedRef, ref} from "vue";

export function useLazyMemo<T>(
  callback: (prevValue: T | undefined) => T,
  dependencies: any[]
):ComputedRef {
  const valueRef = ref<T>();

  return computed(
    () => {
      const newValue = callback(valueRef.value);
      valueRef.value = newValue;

      return newValue;
    });
}
