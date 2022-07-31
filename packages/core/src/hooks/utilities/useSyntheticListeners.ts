
import type {SyntheticEventName, UniqueIdentifier} from '../../types';
import {computed, ComputedRef} from "vue";

export type SyntheticListener = {
  eventName: SyntheticEventName;
  handler: (event: any, id: UniqueIdentifier) => void;
};

export type SyntheticListeners = SyntheticListener[];

export type SyntheticListenerMap = Record<string, Function>;

export function useSyntheticListeners(
  listeners: SyntheticListeners,
  id: UniqueIdentifier
): ComputedRef<SyntheticListenerMap> {
  return computed(() => {
    return listeners.reduce<SyntheticListenerMap>(
      (acc, {eventName, handler}) => {
        // @ts-ignore
        acc[eventName] = (event: any) => {
          handler(event, id);
        };

        return acc;
      },
      {} as SyntheticListenerMap
    );
  });
}
