
import {useEvent} from './useEvent';
import {ref} from "vue";

export function useNodeRef(
  onChange?: (
    newElement: HTMLElement | null,
    previousElement: HTMLElement | null
  ) => void
) {
  const onChangeHandler = useEvent(onChange);
  const node = ref<HTMLElement | null>(null);
  const setNodeRef = (element: HTMLElement | null) => {
    if (element !== node.value) {
      onChangeHandler?.(element, node.value);
    }

    node.value = element;
  }

  return [node, setNodeRef] as const;
}
