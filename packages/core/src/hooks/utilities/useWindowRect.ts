
import {getWindowClientRect} from '../../utilities/rect';
import { computed, type ComputedRef, Ref } from 'vue'

export function useWindowRect(element: Ref<typeof window | null>) {
  return computed(() => (element?.value ? getWindowClientRect(element.value) : null));
}
