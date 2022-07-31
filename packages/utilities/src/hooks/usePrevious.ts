
import {ref, watchEffect} from "vue";

export function usePrevious<T>(value: T) {
  const ref1 = ref<T>();

  watchEffect(() => {
    ref1.value = value;
  });

  return ref1.value;
}
