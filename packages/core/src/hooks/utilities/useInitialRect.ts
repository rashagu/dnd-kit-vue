import type {ClientRect} from '../../types';
import {useInitialValue} from './useInitialValue';
import {ComputedRef} from "vue";

export function useInitialRect(
  node: ComputedRef<HTMLElement> | null,
  measure: (node: HTMLElement) => ClientRect
) {
  return useInitialValue(node, measure);
}
