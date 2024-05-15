import { type ShallowRef, shallowRef, watch } from "vue";

export function useLazyMemo<T>(
  callback: (prevValue: T | undefined) => T,
  dependencies: any[]
): ShallowRef {
  const valueRef = shallowRef<T>();

  watch(
    dependencies,
    () => {
      const newValue = callback(valueRef.value);
      valueRef.value = newValue;
      return newValue;
    },
    { immediate: true }
  );
  return valueRef;
}
