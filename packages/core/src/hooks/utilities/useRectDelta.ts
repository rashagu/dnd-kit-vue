import type {ClientRect} from '../../types';
import {getRectDelta} from '../../utilities';

import {useInitialValue} from './useInitialValue';
import type { ComputedRef, Ref } from 'vue'

export function useRectDelta(rect: Ref<ClientRect | null>) {
  const initialRect = useInitialValue(rect);
  return getRectDelta(rect.value, initialRect.value as ClientRect);
}
