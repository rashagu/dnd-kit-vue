import {type Coordinates, subtract} from '@dnd-kit-vue/utilities';

import {defaultCoordinates} from '../../utilities';
import {computed, type ComputedRef, ref, shallowRef, watch, watchEffect} from "vue";

export function useScrollOffsetsDelta(
  scrollOffsets: ComputedRef<Coordinates>,
  dependencies: any[] = []
) {
  const initialScrollOffsets = shallowRef<Coordinates | null>(null);

  watch(dependencies, () => {
    initialScrollOffsets.value = null;
  }, {immediate: true});

  watch(dependencies, () => {
    const hasScrollOffsets = scrollOffsets.value !== defaultCoordinates;

    if (hasScrollOffsets && !initialScrollOffsets.value) {
      initialScrollOffsets.value = scrollOffsets.value;
    }

    if (!hasScrollOffsets && initialScrollOffsets.value) {
      initialScrollOffsets.value = null;
    }
  }, {immediate: true});

  return computed(()=>{
    return initialScrollOffsets.value
      ? subtract(scrollOffsets.value, initialScrollOffsets.value)
      : defaultCoordinates
  });
}
