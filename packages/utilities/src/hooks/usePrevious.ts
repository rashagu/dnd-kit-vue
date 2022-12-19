
import {Ref, ref, shallowRef, watchEffect} from "vue";

export function usePrevious<T>(value: T):Ref<T|undefined> {
  const ref1 = shallowRef<T>();

  watchEffect(() => {
    ref1.value = value;
  });

  return ref1;
}
