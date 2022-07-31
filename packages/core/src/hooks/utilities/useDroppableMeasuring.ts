
import {useLatestValue, useLazyMemo} from '@kousum/utilities';

import {Rect} from '../../utilities/rect';
import type {DroppableContainer, RectMap} from '../../store/types';
import type {ClientRect, UniqueIdentifier} from '../../types';
import {ref, watchEffect} from "vue";

interface Arguments {
  dragging: boolean;
  dependencies: any[];
  config: DroppableMeasuring;
}

export enum MeasuringStrategy {
  Always,
  BeforeDragging,
  WhileDragging,
}

export enum MeasuringFrequency {
  Optimized = 'optimized',
}

type MeasuringFunction = (element: HTMLElement) => ClientRect;

export interface DroppableMeasuring {
  measure: MeasuringFunction;
  strategy: MeasuringStrategy;
  frequency: MeasuringFrequency | number;
}

const defaultValue: RectMap = new Map();

export function useDroppableMeasuring(
  containers: DroppableContainer[],
  {dragging, dependencies, config}: Arguments
) {
  const containerIdsScheduledForMeasurement = ref<UniqueIdentifier[] | null>(null);
  const measuringScheduled = containerIdsScheduledForMeasurement != null;
  const {frequency, measure, strategy} = config;
  const containersRef = ref(containers);
  const disabled = isDisabled();
  const disabledRef = useLatestValue(disabled);
  const measureDroppableContainers = (ids: UniqueIdentifier[] = []) => {
    if (disabledRef.value) {
      return;
    }

    containerIdsScheduledForMeasurement.value = containerIdsScheduledForMeasurement.value ? containerIdsScheduledForMeasurement.value.concat(ids) : ids

  }
  const timeoutId = ref<any>(null);
  const droppableRects = useLazyMemo<RectMap>(
    (previousValue) => {
      if (disabled && !dragging) {
        return defaultValue;
      }

      const ids = containerIdsScheduledForMeasurement;

      if (
        !previousValue ||
        previousValue === defaultValue ||
        containersRef.value !== containers ||
        ids != null
      ) {
        const map: RectMap = new Map();

        for (let container of containers) {
          if (!container) {
            continue;
          }

          if (
            ids.value &&
            ids.value.length > 0 &&
            !ids.value.includes(container.id) &&
            container.rect.current
          ) {
            // This container does not need to be re-measured
            map.set(container.id, container.rect.current);
            continue;
          }

          const node = container.node.current;
          const rect = node ? new Rect(measure(node), node) : null;

          container.rect.current = rect;

          if (rect) {
            map.set(container.id, rect);
          }
        }

        return map;
      }

      return previousValue;
    },
    [
      containers,
      containerIdsScheduledForMeasurement,
      dragging,
      disabled,
      measure,
    ]
  );

  watchEffect(() => {
    containersRef.value = containers;
  });

  watchEffect(
    () => {
      if (disabled) {
        return;
      }

      requestAnimationFrame(() => measureDroppableContainers());
    });

  watchEffect(() => {
    if (measuringScheduled) {
      containerIdsScheduledForMeasurement.value = null
    }
  });

  watchEffect(
    () => {
      if (
        disabled ||
        typeof frequency !== 'number' ||
        timeoutId.value !== null
      ) {
        return;
      }

      timeoutId.value = setTimeout(() => {
        measureDroppableContainers();
        timeoutId.value = null;
      }, frequency);
    });

  return {
    droppableRects,
    measureDroppableContainers,
    measuringScheduled,
  };

  function isDisabled() {
    switch (strategy) {
      case MeasuringStrategy.Always:
        return false;
      case MeasuringStrategy.BeforeDragging:
        return dragging;
      default:
        return !dragging;
    }
  }
}
