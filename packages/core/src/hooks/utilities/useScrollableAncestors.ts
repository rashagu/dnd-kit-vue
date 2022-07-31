
import {useLazyMemo} from '@kousum/utilities';

import {getScrollableAncestors} from '../../utilities';
import {ref, watchEffect} from "vue";

const defaultValue: Element[] = [];

export function useScrollableAncestors(node: HTMLElement | null) {
  const previousNode = ref(node);

  const ancestors = useLazyMemo<Element[]>(
    (previousValue) => {
      if (!node) {
        return defaultValue;
      }

      if (
        previousValue &&
        previousValue !== defaultValue &&
        node &&
        previousNode.value &&
        node.parentNode === previousNode.value.parentNode
      ) {
        return previousValue;
      }

      return getScrollableAncestors(node);
    },
    [node]
  );

  watchEffect(() => {
    previousNode.value = node;
  });

  return ancestors;
}
