import {ref, shallowRef, watch } from 'vue';
import type {ComputedRef, Ref } from 'vue';


export function useLatestValue<T extends ComputedRef>(
  value: T,
  dependencies: any[] = [value]
) {
  const valueRef = shallowRef(value.value);

  watch(dependencies, ()=>{
    if (valueRef.value !== value.value) {
      valueRef.value = value.value;
    }
  }, {immediate: true})

  return valueRef;
}
