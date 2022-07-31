
import type {DeepRequired} from '@kousum/utilities';

import {defaultMeasuringConfiguration} from '../defaults';
import type {MeasuringConfiguration} from '../types';
import {computed, ComputedRef} from "vue";

export function useMeasuringConfiguration(
  config: MeasuringConfiguration | undefined
): ComputedRef<DeepRequired<MeasuringConfiguration>> {
  return computed(
    () => ({
      draggable: {
        ...defaultMeasuringConfiguration.draggable,
        ...config?.draggable,
      },
      droppable: {
        ...defaultMeasuringConfiguration.droppable,
        ...config?.droppable,
      },
      dragOverlay: {
        ...defaultMeasuringConfiguration.dragOverlay,
        ...config?.dragOverlay,
      },
    }));
}
