import {useLatestValue, useLazyMemo} from '@kousum/utilities';

import {Rect} from '../../utilities/rect';
import type {DroppableContainer, RectMap} from '../../store/types';
import type {ClientRect, UniqueIdentifier} from '../../types';
import {computed, ComputedRef, ref, watch, watchEffect} from "vue";

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
  containers: ComputedRef<DroppableContainer[]>,
  arg: ComputedRef<Arguments>
) {
  const containerIdsScheduledForMeasurement = ref<UniqueIdentifier[] | null>(null);
  const measuringScheduled = computed(() => {
    return containerIdsScheduledForMeasurement.value != null
  });


  const containersRef = ref(containers.value);
  const disabled = computed(isDisabled);
  const disabledRef = useLatestValue(disabled);
  const measureDroppableContainers = computed(()=>(ids: UniqueIdentifier[] = []) => {
    if (disabledRef.value) {
      return;
    }
    containerIdsScheduledForMeasurement.value = containerIdsScheduledForMeasurement.value ? containerIdsScheduledForMeasurement.value.concat(ids) : ids
  })
  const timeoutId = ref<any>(null);

  const previousValue = ref()
  const droppableRects = computed(() => {
    if (disabled.value && !arg.value.dragging) {
      return defaultValue;
    }

    const ids = containerIdsScheduledForMeasurement.value;

    if (
      !previousValue ||
      previousValue.value === defaultValue ||
      containersRef.value !== containers.value ||
      ids != null
    ) {
      const map: RectMap = new Map();

      for (let container of containers.value) {
        if (!container) {
          continue;
        }

        if (
          ids &&
          ids.length > 0 &&
          !ids.includes(container.id) &&
          container.rect
        ) {
          // This container does not need to be re-measured
          map.set(container.id, container.rect);
          continue;
        }

        const node = container.node;
        const rect = node ? new Rect(arg.value.config.measure(node), node) : null;

        container.rect = rect;

        if (rect) {
          map.set(container.id, rect);
        }
      }
      previousValue.value = map
      return map;
    }

    return previousValue.value;
  })


  watchEffect(() => {
    containersRef.value = containers.value;
  });

  watch([() => arg.value.dragging, () => disabled.value], () => {
    if (disabled.value) {
      return;
    }
    requestAnimationFrame(() => measureDroppableContainers.value());
  }, {immediate: true});

  watchEffect(() => {
    if (measuringScheduled.value) {
      containerIdsScheduledForMeasurement.value = null
    }
  });

  watch([()=>arg.value.config.frequency, disabled, measureDroppableContainers, ()=>arg.value.dependencies], () => {
    console.log(arg.value.config.frequency)
      if (
        disabled.value ||
        typeof arg.value.config.frequency !== 'number' ||
        timeoutId.value !== null
      ) {
        return;
      }

      timeoutId.value = setTimeout(() => {
        measureDroppableContainers.value();
        timeoutId.value = null;
      }, arg.value.config.frequency);
    }, {deep: true, immediate: true});


  return {
    droppableRects,
    measureDroppableContainers,
    measuringScheduled,
  };

  function isDisabled() {
    switch (arg.value.config.strategy) {
      case MeasuringStrategy.Always:
        return false;
      case MeasuringStrategy.BeforeDragging:
        return arg.value.dragging;
      default:
        return !arg.value.dragging;
    }
  }
}
