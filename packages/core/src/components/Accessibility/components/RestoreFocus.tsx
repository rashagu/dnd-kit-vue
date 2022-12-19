
import {
  findFirstFocusableNode,
  isKeyboardEvent,
  usePrevious,
} from '@dnd-kit-vue/utilities';

import {defaultInternalContext, InternalContext, InternalContextDescriptor} from '../../../store';
import {inject, ref, watchEffect} from "vue";

interface Props {
  disabled: boolean;
}

export function RestoreFocus({disabled}: Props) {
  const {active, activatorEvent, draggableNodes} = inject('InternalContext', ref<InternalContextDescriptor>(defaultInternalContext)).value
  const previousActivatorEvent = usePrevious(activatorEvent);
  const previousActiveId = usePrevious(active?.id);

  // Restore keyboard focus on the activator node
  watchEffect(() => {
    if (disabled) {
      return;
    }

    if (!activatorEvent && previousActivatorEvent.value && previousActiveId.value != null) {
      if (!isKeyboardEvent(previousActivatorEvent.value)) {
        return;
      }

      if (document.activeElement === previousActivatorEvent.value.target) {
        // No need to restore focus
        return;
      }

      const draggableNode = draggableNodes.get(previousActiveId.value);

      if (!draggableNode) {
        return;
      }

      const {activatorNode, node} = draggableNode;

      if (!activatorNode.current && !node.current) {
        return;
      }

      requestAnimationFrame(() => {
        for (const element of [activatorNode.current, node.current]) {
          if (!element) {
            continue;
          }

          const focusableNode = findFirstFocusableNode(element);

          if (focusableNode) {
            focusableNode.focus();
            break;
          }
        }
      });
    }
  });

  return null;
}
