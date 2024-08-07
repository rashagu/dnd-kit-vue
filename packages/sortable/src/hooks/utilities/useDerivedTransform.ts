
import {getClientRect, type ClientRect} from '@dnd-kit-vue/core';
import {type Transform, useIsomorphicLayoutEffect} from '@dnd-kit-vue/utilities';
import {type ComputedRef, type Ref, ref, watch, watchEffect} from "vue";

interface Arguments {
  rect: Ref<any>;
  disabled: Ref<boolean>;
  index: Ref<number>;
  node: Ref<any>;
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

  const previousIndex = ref(index.value);

  watch([disabled, index, node, rect], (value, oldValue, onCleanup) => {

    // console.error(index.value, previousIndex.value)
    if (disabled.value && index.value !== previousIndex.value && node.value) {
      const initial = rect.value;

      if (initial && node.value) {
        const current = getClientRect(node.value, {
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

    if (index.value !== previousIndex.value) {
      previousIndex.value = index.value;
    }

  }, {immediate: true});

  watch(derivedTransform, (value, oldValue, onCleanup) => {
    if (derivedTransform.value) {
      requestAnimationFrame(() => {
        setDerivedtransform(null);
      });
    }
  }, {immediate: true});

  return derivedTransform;
}
