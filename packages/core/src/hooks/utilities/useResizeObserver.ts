
import {useEvent} from '@dnd-kit-vue/utilities';
import {computed, onUnmounted, shallowRef, watch} from "vue";

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
  const resizeObserver = shallowRef<ResizeObserver>()
  watch(()=>disabled, ()=>{
    if (
      disabled ||
      typeof window === 'undefined' ||
      typeof window.ResizeObserver === 'undefined'
    ) {
      return undefined;
    }

    const {ResizeObserver} = window;

    return new ResizeObserver(handleResize.value as any);
  }, {immediate: true})

  onUnmounted(() => {
    return () => resizeObserver.value?.disconnect();
  });

  return resizeObserver;
}
