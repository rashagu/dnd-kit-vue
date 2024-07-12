
import {useInterval, useLazyMemo, usePrevious} from '@dnd-kit-vue/utilities';

import {getScrollDirectionAndSpeed} from '../../utilities';
import {Direction} from '../../types';
import type {Coordinates, ClientRect} from '../../types';
import { computed, type ComputedRef, ref, type ShallowRef, watchEffect } from 'vue'

export type ScrollAncestorSortingFn = (ancestors: Element[]) => Element[];

export enum AutoScrollActivator {
  Pointer,
  DraggableRect,
}

export interface Options {
  acceleration?: number;
  activator?: AutoScrollActivator;
  canScroll?: CanScroll;
  enabled?: boolean;
  interval?: number;
  layoutShiftCompensation?:
    | boolean
    | {
        x: boolean;
        y: boolean;
      };
  order?: TraversalOrder;
  threshold?: {
    x: number;
    y: number;
  };
}

interface Arguments extends Options {
  draggingRect: ClientRect | null;
  enabled: boolean;
  pointerCoordinates: Coordinates | null;
  scrollableAncestors: Element[];
  scrollableAncestorRects: ClientRect[];
  delta: Coordinates;
}

export type CanScroll = (element: Element) => boolean;

export enum TraversalOrder {
  TreeOrder,
  ReversedTreeOrder,
}

interface ScrollDirection {
  x: 0 | Direction;
  y: 0 | Direction;
}

export function useAutoScroller({
  acceleration,
  activator = AutoScrollActivator.Pointer,
  canScroll,
  draggingRect,
  enabled,
  interval = 5,
  order = TraversalOrder.TreeOrder,
  pointerCoordinates,
  scrollableAncestors,
  scrollableAncestorRects,
  delta,
  threshold,
}: Arguments) {
  const scrollIntent = useScrollIntent({delta, disabled: !enabled});
  const [setAutoScrollInterval, clearAutoScrollInterval] = useInterval();
  const scrollSpeed = ref<Coordinates>({x: 0, y: 0});
  const scrollDirection = ref<ScrollDirection>({x: 0, y: 0});
  const rect = computed(() => {
    switch (activator) {
      case AutoScrollActivator.Pointer:
        return pointerCoordinates
          ? {
              top: pointerCoordinates.y,
              bottom: pointerCoordinates.y,
              left: pointerCoordinates.x,
              right: pointerCoordinates.x,
            }
          : null;
      case AutoScrollActivator.DraggableRect:
        return draggingRect;
    }
  });
  const scrollContainerRef = ref<Element | null>(null);
  const autoScroll = () => {
    const scrollContainer = scrollContainerRef.value;

    if (!scrollContainer) {
      return;
    }

    const scrollLeft = scrollSpeed.value.x * scrollDirection.value.x;
    const scrollTop = scrollSpeed.value.y * scrollDirection.value.y;

    scrollContainer.scrollBy(scrollLeft, scrollTop);
  }
  const sortedScrollableAncestors = computed(
    () =>
      order === TraversalOrder.TreeOrder
        ? [...scrollableAncestors].reverse()
        : scrollableAncestors);

  watchEffect(
    () => {
      if (!enabled || !scrollableAncestors.length || !rect) {
        clearAutoScrollInterval();
        return;
      }

      for (const scrollContainer of sortedScrollableAncestors.value) {
        if (canScroll?.(scrollContainer) === false) {
          continue;
        }

        const index = scrollableAncestors.indexOf(scrollContainer);
        const scrollContainerRect = scrollableAncestorRects[index];

        if (!scrollContainerRect) {
          continue;
        }

        const {direction, speed} = getScrollDirectionAndSpeed(
          scrollContainer,
          scrollContainerRect,
          rect.value!,
          acceleration,
          threshold
        );

        for (const axis of ['x', 'y'] as const) {
          if (!scrollIntent.value[axis][direction[axis] as Direction]) {
            speed[axis] = 0;
            direction[axis] = 0;
          }
        }

        if (speed.x > 0 || speed.y > 0) {
          clearAutoScrollInterval();

          scrollContainerRef.value = scrollContainer;
          setAutoScrollInterval(autoScroll, interval);

          scrollSpeed.value = speed;
          scrollDirection.value = direction;

          return;
        }
      }

      scrollSpeed.value = {x: 0, y: 0};
      scrollDirection.value = {x: 0, y: 0};
      clearAutoScrollInterval();
    });
}

interface ScrollIntent {
  x: Record<Direction, boolean>;
  y: Record<Direction, boolean>;
}

const defaultScrollIntent: ScrollIntent = {
  x: {[Direction.Backward]: false, [Direction.Forward]: false},
  y: {[Direction.Backward]: false, [Direction.Forward]: false},
};

function useScrollIntent({
  delta,
  disabled,
}: {
  delta: Coordinates;
  disabled: boolean;
}): ShallowRef {
  const previousDelta = usePrevious(delta);

  return useLazyMemo<ScrollIntent>(
    (previousIntent) => {
      if (disabled || !previousDelta.value || !previousIntent) {
        // Reset scroll intent tracking when auto-scrolling is disabled
        return defaultScrollIntent;
      }

      const direction = {
        x: Math.sign(delta.x - previousDelta.value!.x),
        y: Math.sign(delta.y - previousDelta.value!.y),
      };

      // Keep track of the user intent to scroll in each direction for both axis
      return {
        x: {
          [Direction.Backward]:
            previousIntent.x[Direction.Backward] || direction.x === -1,
          [Direction.Forward]:
            previousIntent.x[Direction.Forward] || direction.x === 1,
        },
        y: {
          [Direction.Backward]:
            previousIntent.y[Direction.Backward] || direction.y === -1,
          [Direction.Forward]:
            previousIntent.y[Direction.Forward] || direction.y === 1,
        },
      };
    },
    [()=>disabled, ()=>delta, previousDelta]
  );
}
