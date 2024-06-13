import type {Sensor, SensorDescriptor, SensorOptions} from './types';
import {computed, type ComputedRef} from "vue";

export function useSensor<T extends SensorOptions>(
  sensor: Sensor<T>,
  options?: T
): ComputedRef<SensorDescriptor<T>> {
  return computed(() => ({
      sensor,
      options: options ?? ({} as T),
    })
  );
}
