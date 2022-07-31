import {ref} from 'vue';

export function useInterval() {
  const intervalRef = ref<number | null>(null);

  const set = (listener: Function, duration: number) => {
    intervalRef.value = setInterval(listener, duration);
  }

  const clear = () => {
    if (intervalRef.value !== null) {
      clearInterval(intervalRef.value);
      intervalRef.value = null;
    }
  }

  return [set, clear] as const;
}
