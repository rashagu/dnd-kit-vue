import {useLazyMemo} from '@dnd-kit-vue/utilities';

import type {DraggableNode, DraggableNodes} from '../../store';
import type {UniqueIdentifier} from '../../types';
import {computed, ComputedRef, Ref, ref} from "vue";

export function useCachedNode(
  draggableNodes: ComputedRef<DraggableNodes> | Ref<DraggableNodes>,
  id: ComputedRef<UniqueIdentifier | null> | Ref<UniqueIdentifier | null>
): ComputedRef<DraggableNode['node']['current']> {

  const valueRef = ref();

  return computed(
    () => {
      const draggableNode = id.value !== null ? draggableNodes.value.get(id.value) : undefined;
      const node = draggableNode ? draggableNode.node : null;

      const newValue = () => {
        if (id === null) {
          return null;
        }
        // In some cases, the draggable node can unmount while dragging
        // This is the case for virtualized lists. In those situations,
        // we fall back to the last known value for that node.
        return node ?? valueRef.value ?? null;
      };

      valueRef.value = newValue();

      return newValue();
    });


}
