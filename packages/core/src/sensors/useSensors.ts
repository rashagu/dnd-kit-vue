import type {SensorDescriptor, SensorOptions} from './types';
import {computed, ComputedRef} from "vue";

export function useSensors(
  ...sensors: (SensorDescriptor<any> | undefined | null)[]
): ComputedRef<SensorDescriptor<SensorOptions>[]> {
  return computed(() =>
      [...sensors].filter(
        (sensor): sensor is SensorDescriptor<any> => sensor != null
      )
  );
}
