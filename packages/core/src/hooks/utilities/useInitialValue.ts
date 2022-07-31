import {useLazyMemo} from '@kousum/utilities';
import {ComputedRef} from "vue";

type AnyFunction = (...args: any) => any;

export function useInitialValue<
  T,
  U extends AnyFunction | undefined = undefined
>(
  value: T | null,
  computeFn?: U
): ComputedRef<U extends AnyFunction ? ReturnType<U> | null : T | null> {
  return useLazyMemo(
    (previousValue) => {
      if (!value) {
        return null;
      }

      if (previousValue) {
        return previousValue;
      }

      return typeof computeFn === 'function' ? computeFn(value) : value;
    },
    [computeFn, value]
  );
}
