
import type {UniqueIdentifier} from '../../../types';
import {computed, ComputedRef, ref, watch} from "vue";

let key = 0;

export function useKey(id: ComputedRef<UniqueIdentifier | undefined>) {
  const keyShallowRef = ref(key)
  // 这里的问题
  watch(()=>id?.value, ()=>{
    console.log(id?.value)
    key++
    keyShallowRef.value = key
  })
  return keyShallowRef
}
