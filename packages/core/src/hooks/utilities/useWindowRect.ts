
import {getWindowClientRect} from '../../utilities/rect';
import {computed, ComputedRef} from "vue";

export function useWindowRect(element: ComputedRef<typeof window | null>) {
  return computed(() => (element?.value ? getWindowClientRect(element.value) : null));
}
