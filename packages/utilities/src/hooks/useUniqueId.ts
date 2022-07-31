import {computed} from "vue";

let ids: Record<string, number> = {};

export function useUniqueId(prefix: string, value?: string) {
  return computed(() => {
    if (value) {
      return value;
    }

    const id = ids[prefix] == null ? 0 : ids[prefix] + 1;
    ids[prefix] = id;

    return `${prefix}-${id}`;
  });
}
