import type {ClientRect} from '../../types';
import {getRectDelta} from '../../utilities';

import {useInitialValue} from './useInitialValue';
import {ComputedRef} from "vue";

export function useRectDelta(rect: ComputedRef<ClientRect | null>) {
  const initialRect = useInitialValue(rect);
  return getRectDelta(rect.value, initialRect.value as ClientRect);
}
