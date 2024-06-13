
import {add} from '@dnd-kit-vue/utilities';

import {
  defaultCoordinates,
  getScrollableElement,
  getScrollCoordinates,
  getScrollOffsets,
} from '../../utilities';
import type {Coordinates} from '../../types';
import { computed, type ComputedRef, ref, type ShallowRef, shallowRef, watch, watchEffect } from 'vue'

type ScrollCoordinates = Map<HTMLElement | Window, Coordinates>;

export function useScrollOffsets(elements: ShallowRef<Element[]>): ComputedRef<Coordinates> {
  const scrollCoordinates = ref<ScrollCoordinates | null>(null);
  const prevElements = shallowRef(elements.value);

  // To-do: Throttle the handleScroll callback
  const handleScroll = shallowRef((event: Event) => {
    const scrollingElement = getScrollableElement(event.target);

    if (!scrollingElement) {
      return;
    }

    if (!scrollCoordinates.value) {
      return null;
    }

    scrollCoordinates.value.set(
      scrollingElement,
      getScrollCoordinates(scrollingElement)
    );

    scrollCoordinates.value = new Map(scrollCoordinates.value);
  });

  watch([()=>handleScroll.value, ()=>elements.value],(value, oldValue, onCleanup) => {
    const previousElements = prevElements.value;

    if (elements.value !== previousElements) {
      cleanup(previousElements);

      const entries = elements.value
        .map((element) => {
          const scrollableElement = getScrollableElement(element);

          if (scrollableElement) {
            scrollableElement.addEventListener('scroll', handleScroll.value, {
              passive: true,
            });

            return [
              scrollableElement,
              getScrollCoordinates(scrollableElement),
            ] as const;
          }

          return null;
        })
        .filter(
          (
            entry
          ): entry is [
            HTMLElement | (Window & typeof globalThis),
            Coordinates
          ] => entry != null
        );

      scrollCoordinates.value = entries.length ? new Map(entries) : null

      prevElements.value = elements.value;
    }

    onCleanup(() => {
      cleanup(elements.value);
      cleanup(previousElements);
    });

    function cleanup(elements: Element[]) {
      elements.forEach((element) => {
        const scrollableElement = getScrollableElement(element);

        scrollableElement?.removeEventListener('scroll', handleScroll.value);
      });
    }
  }, {immediate: true});

  return computed(() => {
    if (elements.value.length) {
      return scrollCoordinates.value
        ? Array.from(scrollCoordinates.value.values()).reduce(
            (acc, coordinates) => add(acc, coordinates),
            defaultCoordinates
          )
        : getScrollOffsets(elements.value);
    }

    return defaultCoordinates;
  });
}
