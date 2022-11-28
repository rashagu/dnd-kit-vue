
import {useEvent} from '@kousum/utilities';
import {computed, watch, watchEffect} from "vue";

interface Arguments {
  callback: MutationCallback;
  disabled?: boolean;
}

/**
 * Returns a new MutationObserver instance.
 * If `MutationObserver` is undefined in the execution environment, returns `undefined`.
 */
export function useMutationObserver({callback, disabled}: Arguments) {
  const handleMutations = useEvent(callback);
  const mutationObserver = computed(() => {
    if (
      disabled ||
      typeof window === 'undefined' ||
      typeof window.MutationObserver === 'undefined'
    ) {
      return undefined;
    }

    const {MutationObserver} = window;

    return new MutationObserver(handleMutations);
  });

  watch(()=>mutationObserver.value, () => {
    return () => mutationObserver.value?.disconnect();
  }, {immediate: true});

  return mutationObserver;
}
