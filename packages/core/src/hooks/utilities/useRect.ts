
import {useIsomorphicLayoutEffect} from '@dnd-kit-vue/utilities';

import type {ClientRect} from '../../types';
import {getClientRect, Rect, useReducer} from '../../utilities';

import {useMutationObserver} from './useMutationObserver';
import {useResizeObserver} from './useResizeObserver';
import {computed, ComputedRef, watch} from "vue";

function defaultMeasure(element: HTMLElement) {
  return new Rect(getClientRect(element), element);
}

export function useRect(
  element: ComputedRef<HTMLElement | null>,
  measure: ComputedRef<(element: HTMLElement) => ClientRect> = computed(()=>defaultMeasure),
  fallbackRect?: ComputedRef<ClientRect | null>
) {
  let [rect, measureRect] = useReducer(reducer, null);

  const mutationObserver = useMutationObserver({
    callback(records) {
      if (!element.value) {
        return;
      }

      for (const record of records) {
        const {type, target} = record;

        if (
          type === 'childList' &&
          target instanceof HTMLElement &&
          target.contains(element.value)
        ) {
          measureRect();
          break;
        }
      }
    },
  });
  const resizeObserver = useResizeObserver({callback: measureRect});

  watch([element, measure, ()=>fallbackRect?.value], () => {
    measureRect();

    if (element && element.value) {
      resizeObserver.value?.observe(element.value);
      mutationObserver.value?.observe(document.body, {
        childList: true,
        subtree: true,
      });
    } else {
      resizeObserver.value?.disconnect();
      mutationObserver.value?.disconnect();
    }
  }, {immediate: true});

  return rect;

  function reducer(currentRect: ClientRect | null) {
    if (!element?.value) {
      return null;
    }

    if (element.value.isConnected === false) {
      // Fall back to last rect we measured if the element is
      // no longer connected to the DOM.
      return currentRect ?? fallbackRect?.value ?? null;
    }

    const newRect = measure.value(element.value);

    if (JSON.stringify(currentRect) === JSON.stringify(newRect)) {
      return currentRect;
    }

    return newRect;
  }
}
