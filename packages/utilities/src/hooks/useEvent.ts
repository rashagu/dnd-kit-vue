import {ref, computed, shallowRef} from 'vue';

import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect';

export function useEvent<T extends Function>(handler: T | undefined) {
  return  shallowRef<T | undefined>(handler);
}
