
import {DndMonitorContext} from './context';
import type {DndMonitorListener} from './types';
import {inject, ref, watchEffect} from "vue";
import type {RegisterListener} from "./types";

export function useDndMonitor(listener: DndMonitorListener) {
  const registerListener = inject('DndMonitorContext', ref<RegisterListener | null>(null))

  watchEffect(() => {
    if (!registerListener.value) {
      throw new Error(
        'useDndMonitor must be used within a children of <DndContext>'
      );
    }

    const unsubscribe = registerListener.value(listener);

    return unsubscribe;
  });
}
