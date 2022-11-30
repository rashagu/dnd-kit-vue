
import {getWindow, useIsomorphicLayoutEffect} from '@dnd-kit-vue/utilities';

import type {ClientRect} from '../../types';
import {Rect, getClientRect} from '../../utilities/rect';
import {isDocumentScrollingElement, useReducer} from '../../utilities';

import {useResizeObserver} from './useResizeObserver';
import {useWindowRect} from './useWindowRect';
import {ref} from "vue";

const defaultValue: Rect[] = [];

export function useRects(
  elements: Element[],
  measure: (element: Element) => ClientRect = getClientRect
): ClientRect[] {
  const [firstElement] = elements;
  const windowRect = useWindowRect(
    firstElement ? getWindow(firstElement) : null
  );
  const [rects, measureRects] = useReducer(reducer, defaultValue);
  const resizeObserver = useResizeObserver({callback: measureRects});

  if (elements.length > 0 && rects.value === defaultValue) {
    measureRects();
  }

  useIsomorphicLayoutEffect(() => {
    if (elements.length) {
      elements.forEach((element) => resizeObserver.value?.observe(element));
    } else {
      resizeObserver.value?.disconnect();
      measureRects();
    }
  });

  return rects.value;

  function reducer() {
    if (!elements.length) {
      return defaultValue;
    }

    return elements.map((element) =>
      isDocumentScrollingElement(element)
        ? (windowRect.value as ClientRect)
        : new Rect(measure(element), element)
    );
  }
}
