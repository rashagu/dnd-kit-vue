
import type {UniqueIdentifier} from '../../../types';
import {computed} from "vue";

let key = 0;

export function useKey(id: UniqueIdentifier | undefined) {
  return computed(() => {
    if (id == null) {
      return;
    }

    key++;
    return key;
  });
}
