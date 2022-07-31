import {Coordinates, subtract} from '@kousum/utilities';

import {defaultCoordinates} from '../../utilities';
import {ref, watchEffect} from "vue";

export function useScrollOffsetsDelta(
  scrollOffsets: Coordinates,
  dependencies: any[] = []
) {
  const initialScrollOffsets = ref<Coordinates | null>(null);

  watchEffect(
    () => {
      initialScrollOffsets.value = null;
    });

  watchEffect(() => {
    const hasScrollOffsets = scrollOffsets !== defaultCoordinates;

    if (hasScrollOffsets && !initialScrollOffsets.value) {
      initialScrollOffsets.value = scrollOffsets;
    }

    if (!hasScrollOffsets && initialScrollOffsets.value) {
      initialScrollOffsets.value = null;
    }
  });

  return initialScrollOffsets.value
    ? subtract(scrollOffsets, initialScrollOffsets.value)
    : defaultCoordinates;
}
