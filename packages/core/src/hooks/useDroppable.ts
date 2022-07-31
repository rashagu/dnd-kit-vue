
import {
  useIsomorphicLayoutEffect,
  useLatestValue,
  useNodeRef,
  useUniqueId,
} from '@kousum/utilities';

import {InternalContext, Action, Data, InternalContextDescriptor, defaultInternalContext} from '../store';
import type {ClientRect, UniqueIdentifier} from '../types';

import {useResizeObserver} from './utilities';
import {inject, ref, watchEffect} from "vue";

interface ResizeObserverConfig {
  /** Whether the ResizeObserver should be disabled entirely */
  disabled?: boolean;
  /** Resize events may affect the layout and position of other droppable containers.
   * Specify an array of `UniqueIdentifier` of droppable containers that should also be re-measured
   * when this droppable container resizes. Specifying an empty array re-measures all droppable containers.
   */
  updateMeasurementsFor?: UniqueIdentifier[];
  /** Represents the debounce timeout between when resize events are observed and when elements are re-measured */
  timeout?: number;
}

export interface UseDroppableArguments {
  id: UniqueIdentifier;
  disabled?: boolean;
  data?: Data;
  resizeObserverConfig?: ResizeObserverConfig;
}

const ID_PREFIX = 'Droppable';

const defaultResizeObserverConfig = {
  timeout: 25,
};

export function useDroppable({
  data,
  disabled = false,
  id,
  resizeObserverConfig,
}: UseDroppableArguments) {
  const key = useUniqueId(ID_PREFIX);
  const {active, dispatch, over, measureDroppableContainers} = inject('InternalContext', ref<InternalContextDescriptor>(defaultInternalContext)).value;
  const previous = ref({disabled});
  const resizeObserverConnected = ref(false);
  const rect = ref<ClientRect | null>(null);

  const callbackId = ref<any>(null);
  const {
    disabled: resizeObserverDisabled,
    updateMeasurementsFor,
    timeout: resizeObserverTimeout,
  } = {
    ...defaultResizeObserverConfig,
    ...resizeObserverConfig,
  };
  const ids = useLatestValue(updateMeasurementsFor ?? id);
  const handleResize = () => {
    if (!resizeObserverConnected.value) {
      // ResizeObserver invokes the `handleResize` callback as soon as `observe` is called,
      // assuming the element is rendered and displayed.
      resizeObserverConnected.value = true;
      return;
    }

    if (callbackId.current != null) {
      clearTimeout(callbackId.current);
    }

    callbackId.current = setTimeout(() => {
      measureDroppableContainers(
        Array.isArray(ids.value) ? ids.value : [ids.value]
      );
      callbackId.current = null;
    }, resizeObserverTimeout);
  };
  const resizeObserver = useResizeObserver({
    callback: handleResize,
    disabled: resizeObserverDisabled || !active,
  });
  const handleNodeChange = (newElement: HTMLElement | null, previousElement: HTMLElement | null) => {
      if (!resizeObserver) {
        return;
      }

      if (previousElement) {
        resizeObserver.unobserve(previousElement);
        resizeObserverConnected.value = false;
      }

      if (newElement) {
        resizeObserver.observe(newElement);
      }
    };
  const [nodeRef, setNodeRef] = useNodeRef(handleNodeChange);
  const dataRef = useLatestValue(data);

  watchEffect(() => {
    if (!resizeObserver || !nodeRef.value) {
      return;
    }

    resizeObserver.disconnect();
    resizeObserverConnected.value = false;
    resizeObserver.observe(nodeRef.value);
  });

  useIsomorphicLayoutEffect(
    () => {
      dispatch({
        type: Action.RegisterDroppable,
        element: {
          id,
          key,
          disabled,
          node: nodeRef,
          rect,
          data: dataRef,
        },
      });

      return () =>
        dispatch({
          type: Action.UnregisterDroppable,
          key,
          id,
        });
    }
  );

  watchEffect(() => {
    if (disabled !== previous.value.disabled) {
      dispatch({
        type: Action.SetDroppableDisabled,
        id,
        key,
        disabled,
      });

      previous.value.disabled = disabled;
    }
  });

  return {
    active,
    rect,
    isOver: over?.id === id,
    node: nodeRef,
    over,
    setNodeRef,
  };
}
