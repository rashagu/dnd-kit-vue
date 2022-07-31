import {ref} from 'vue';

import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect';

export function useEvent<T extends Function>(handler: T | undefined) {
  const handlerRef = ref<T | undefined>(handler);

  useIsomorphicLayoutEffect(() => {
    handlerRef.value = handler;
  });

  return function (...args: any) {
    return handlerRef.value?.(...args);
  }
}
