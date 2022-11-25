import type {SensorDescriptor, SensorOptions} from './types';
import {computed, ComputedRef} from "vue";

export function useSensors(
  ...sensors: ComputedRef<(SensorDescriptor<any> | undefined | null)>[]
): ComputedRef<SensorDescriptor<SensorOptions>[]> {
  return computed(() =>
      [...sensors].map(item=>item.value).filter(
        (sensor): sensor is SensorDescriptor<any> => sensor != null
      )
  );
}
