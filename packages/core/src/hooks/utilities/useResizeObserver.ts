
import {useEvent} from '@dnd-kit-vue/utilities';
import {computed} from "vue";

interface Arguments {
  callback: ResizeObserverCallback;
  disabled?: boolean;
}

/**
 * Returns a new ResizeObserver instance bound to the `onResize` callback.
 * If `ResizeObserver` is undefined in the execution environment, returns `undefined`.
 */
export function useResizeObserver({callback, disabled}: Arguments) {
  const handleResize = useEvent(callback);
  const resizeObserver = computed(
    () => {
      if (
        disabled ||
        typeof window === 'undefined' ||
        typeof window.ResizeObserver === 'undefined'
      ) {
        return undefined;
      }

      const {ResizeObserver} = window;

      return new ResizeObserver(handleResize);
    });

  computed(() => {
    return () => resizeObserver.value?.disconnect();
  });

  return resizeObserver;
}
