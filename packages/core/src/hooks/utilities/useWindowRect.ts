
import {getWindowClientRect} from '../../utilities/rect';
import {computed} from "vue";

export function useWindowRect(element: typeof window | null) {
  return computed(() => (element ? getWindowClientRect(element) : null));
}
