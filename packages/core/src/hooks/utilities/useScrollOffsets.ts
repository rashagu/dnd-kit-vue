
import {add} from '@kousum/utilities';

import {
  defaultCoordinates,
  getScrollableElement,
  getScrollCoordinates,
  getScrollOffsets,
} from '../../utilities';
import type {Coordinates} from '../../types';
import {computed, ComputedRef, ref, watchEffect} from "vue";

type ScrollCoordinates = Map<HTMLElement | Window, Coordinates>;

export function useScrollOffsets(elements: Element[]): ComputedRef<Coordinates> {
  const scrollCoordinates = ref<ScrollCoordinates | null>(null);
  const prevElements = ref(elements);

  // To-do: Throttle the handleScroll callback
  const handleScroll = (event: Event) => {
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
  };

  watchEffect(() => {
    const previousElements = prevElements.value;

    if (elements !== previousElements) {
      cleanup(previousElements);

      const entries = elements
        .map((element) => {
          const scrollableElement = getScrollableElement(element);

          if (scrollableElement) {
            scrollableElement.addEventListener('scroll', handleScroll, {
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

      prevElements.value = elements;
    }

    return () => {
      cleanup(elements);
      cleanup(previousElements);
    };

    function cleanup(elements: Element[]) {
      elements.forEach((element) => {
        const scrollableElement = getScrollableElement(element);

        scrollableElement?.removeEventListener('scroll', handleScroll);
      });
    }
  });

  return computed(() => {
    if (elements.length) {
      return scrollCoordinates
        ? Array.from(scrollCoordinates.values()).reduce(
            (acc, coordinates) => add(acc, coordinates),
            defaultCoordinates
          )
        : getScrollOffsets(elements);
    }

    return defaultCoordinates;
  });
}
