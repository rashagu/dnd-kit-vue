import {ComputedRef, Ref, ref} from 'vue';

import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect';

export function useLatestValue<T extends ComputedRef>(
  value: T
) {
  return value
}
