import {canUseDOM} from '@dnd-kit-vue/utilities';

import type {SensorDescriptor} from '../../sensors';
import {watchEffect} from "vue";

export function useSensorSetup(sensors: SensorDescriptor<any>[]) {
  watchEffect(
    () => {
      if (!canUseDOM) {
        return;
      }

      const teardownFns = sensors.map(({sensor}) => sensor.setup?.());

      return () => {
        for (const teardown of teardownFns) {
          teardown?.();
        }
      };
    });
}
