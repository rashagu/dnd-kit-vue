
import {isHTMLElement, useNodeRef} from '@dnd-kit-vue/utilities';

import {useResizeObserver} from './useResizeObserver';
import {getMeasurableNode} from '../../utilities/nodes';
import type {PublicContextDescriptor} from '../../store';
import type {ClientRect} from '../../types';
import {computed, ComputedRef, Ref, ref} from "vue";
import {isEqual} from "lodash";

interface Arguments {
  measure(element: HTMLElement): ClientRect;
}

export function useDragOverlayMeasuring({
  measure,
}: Arguments): ComputedRef<{ rect: Ref<ClientRect | null>; setRef: any; nodeRef: any }> {
  const rect = ref<ClientRect | null>(null);
  const handleResize = (entries: ResizeObserverEntry[]) => {
    for (const {target} of entries) {
      if (isHTMLElement(target)) {
        const newRect = measure(<HTMLElement>target);

        rect.value =  rect.value
          ? {...rect.value, width: newRect.width, height: newRect.height}
          : newRect;
        break;
      }
    }
  };
  const resizeObserver = useResizeObserver({callback: handleResize});
  const handleNodeChange = (element: any) => {
    const node = getMeasurableNode(element);

    resizeObserver.value?.disconnect();

    if (node) {
      resizeObserver.value?.observe(node);
    }
    rect.value = node ? measure(node) : null
  };

  const [nodeRef, setRef] = useNodeRef(handleNodeChange);


  return computed(
    () => ({
      nodeRef,
      rect,
      setRef,
    }) );
}
