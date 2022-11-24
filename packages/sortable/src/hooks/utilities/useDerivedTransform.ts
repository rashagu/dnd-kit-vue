
import {getClientRect, ClientRect} from '@kousum/core';
import {Transform, useIsomorphicLayoutEffect} from '@kousum/utilities';
import {ref, watchEffect} from "vue";

interface Arguments {
  rect: any;
  disabled: boolean;
  index: number;
  node: any;
}

/*
 * When the index of an item changes while sorting,
 * we need to temporarily disable the transforms
 */
export function useDerivedTransform({disabled, index, node, rect}: Arguments) {
  const derivedTransform = ref<Transform | null>(null)
  function setDerivedtransform(val:any) {
    derivedTransform.value = val
  }

  const previousIndex = ref(index);

  useIsomorphicLayoutEffect(() => {
    if (!disabled && index !== previousIndex.value && node.current) {
      const initial = rect.current;

      if (initial) {
        const current = getClientRect(node.current, {
          ignoreTransform: true,
        });

        const delta = {
          x: initial.left - current.left,
          y: initial.top - current.top,
          scaleX: initial.width / current.width,
          scaleY: initial.height / current.height,
        };

        if (delta.x || delta.y) {
          setDerivedtransform(delta);
        }
      }
    }

    if (index !== previousIndex.value) {
      previousIndex.value = index;
    }
  });

  watchEffect(() => {
    if (derivedTransform.value) {
      requestAnimationFrame(() => {
        setDerivedtransform(null);
      });
    }
  });

  return derivedTransform;
}
