
import {getWindow, useIsomorphicLayoutEffect} from '@dnd-kit-vue/utilities';

import type {ClientRect} from '../../types';
import {Rect, getClientRect} from '../../utilities/rect';
import {isDocumentScrollingElement, useReducer} from '../../utilities';

import {useResizeObserver} from './useResizeObserver';
import {useWindowRect} from './useWindowRect';
import { computed, type ComputedRef, ref, type ShallowRef, watch } from 'vue'

const defaultValue: Rect[] = [];

export function useRects(
  elements: ShallowRef<Element[]>,
  measure: (element: Element) => ClientRect = getClientRect
): ClientRect[] {
  const useWindowRectOption = computed(()=>{
    const [firstElement] = elements.value;
    return firstElement ? getWindow(firstElement) : null
  })
  const windowRect = useWindowRect(
    useWindowRectOption
  );

  const [rects, measureRects] = useReducer(reducer, defaultValue);
  const resizeObserver = useResizeObserver({callback: measureRects});




  watch([()=>elements.value], () => {

    if (elements.value.length > 0 && rects.value === defaultValue) {
      measureRects();
    }


    if (elements.value.length) {
      elements.value.forEach((element) => resizeObserver.value?.observe(element));
    } else {
      resizeObserver.value?.disconnect();
      measureRects();
    }



  }, {immediate: true});

  return rects.value;

  function reducer() {

    if (!elements.value.length) {
      return defaultValue;
    }

    return elements.value.map((element) =>
      isDocumentScrollingElement(element)
        ? (windowRect.value as ClientRect)
        : new Rect(measure(element), element)
    );
  }
}
