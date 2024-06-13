
import {type Ref, ref, shallowRef, watchEffect} from "vue";

export function usePrevious<T>(value: T):Ref<T> {
  const ref1 = shallowRef<T>(value);

  // watchEffect(() => {
  //   ref1.value = value;
  // });

  return ref1;
}
