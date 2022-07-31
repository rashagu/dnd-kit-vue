

import type {DndMonitorListener, DndMonitorEvent} from './types';
import {ref} from "vue";

export function useDndMonitorProvider() {
  const listeners = ref(new Set<DndMonitorListener>());

  const registerListener = (listener:any) => {
    listeners.value.add(listener);
    return () => listeners.value.delete(listener);
  };

  const dispatch = ({type, event}: DndMonitorEvent) => {
    listeners.value.forEach((listener) => listener[type]?.(event as any));
  };

  return [dispatch, registerListener] as const;
}
