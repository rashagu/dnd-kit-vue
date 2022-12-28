import type {SensorActivatorFunction, SensorDescriptor} from '../../sensors';
import type {
  SyntheticListener,
  SyntheticListeners,
} from './useSyntheticListeners';
import {computed, ComputedRef} from "vue";

export function useCombineActivators(
  sensors: SensorDescriptor<any>[],
  getSyntheticHandler: ComputedRef<(
    handler: SensorActivatorFunction<any>,
    sensor: SensorDescriptor<any>
  ) => SyntheticListener['handler']>
): ComputedRef<SyntheticListener[]> {
  return computed(
    () => sensors.reduce<SyntheticListeners>((accumulator, sensor) => {
      const {sensor: Sensor} = sensor;

      const sensorActivators = Sensor.activators.map((activator) => ({
        eventName: activator.eventName,
        handler: getSyntheticHandler.value(activator.handler, sensor),
      }));


      return [...accumulator, ...sensorActivators];
    }, []));
}
