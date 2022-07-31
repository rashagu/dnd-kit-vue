import {Ref, ref} from 'vue';

import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect';

export function useLatestValue<T extends any>(
  value: T,
  dependencies = [value]
):Ref<T> {
  const valueRef = ref<T>(value);

  useIsomorphicLayoutEffect(() => {
    if (valueRef.value !== value) {
      // @ts-ignore
      valueRef.value = value;
    }
  });

  return valueRef as Ref<T>;
}
