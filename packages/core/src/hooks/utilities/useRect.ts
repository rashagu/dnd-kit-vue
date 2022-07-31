
import {useIsomorphicLayoutEffect} from '@kousum/utilities';

import type {ClientRect} from '../../types';
import {getClientRect, Rect, useReducer} from '../../utilities';

import {useMutationObserver} from './useMutationObserver';
import {useResizeObserver} from './useResizeObserver';

function defaultMeasure(element: HTMLElement) {
  return new Rect(getClientRect(element), element);
}

export function useRect(
  element: HTMLElement | null,
  measure: (element: HTMLElement) => ClientRect = defaultMeasure,
  fallbackRect?: ClientRect | null
) {
  let [rect, measureRect] = useReducer(reducer, null);

  const mutationObserver = useMutationObserver({
    callback(records) {
      if (!element) {
        return;
      }

      for (const record of records) {
        const {type, target} = record;

        if (
          type === 'childList' &&
          target instanceof HTMLElement &&
          target.contains(element)
        ) {
          measureRect();
          break;
        }
      }
    },
  });
  const resizeObserver = useResizeObserver({callback: measureRect});

  useIsomorphicLayoutEffect(() => {
    measureRect();

    if (element) {
      resizeObserver.value?.observe(element);
      mutationObserver.value?.observe(document.body, {
        childList: true,
        subtree: true,
      });
    } else {
      resizeObserver.value?.disconnect();
      mutationObserver.value?.disconnect();
    }
  });

  return rect;

  function reducer(currentRect: ClientRect | null) {
    if (!element) {
      return null;
    }

    if (element.isConnected === false) {
      // Fall back to last rect we measured if the element is
      // no longer connected to the DOM.
      return currentRect ?? fallbackRect ?? null;
    }

    const newRect = measure(element);

    if (JSON.stringify(currentRect) === JSON.stringify(newRect)) {
      return currentRect;
    }

    return newRect;
  }
}
