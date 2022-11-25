
import {
  useIsomorphicLayoutEffect,
  useLatestValue,
  useNodeRef,
  useUniqueId,
} from '@kousum/utilities';

import {InternalContext, Action, Data, InternalContextDescriptor, defaultInternalContext} from '../store';
import type {ClientRect, UniqueIdentifier} from '../types';

import {useResizeObserver} from './utilities';
import {computed, ComputedRef, getCurrentInstance, inject, ref, watch, watchEffect} from "vue";
import {useInternalContext} from "../CreateContextVueVNode/InternalContextConsumer";

interface ResizeObserverConfig {
  /** Whether the ResizeObserver should be disabled entirely */
  disabled?: boolean;
  /** Resize events may affect the layout and position of other droppable containers.
   * Specify an array of `UniqueIdentifier` of droppable containers that should also be re-measured
   * when this droppable container resizes. Specifying an empty array re-measures all droppable containers.
   */
  updateMeasurementsFor?: ComputedRef<UniqueIdentifier[]>;
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
  // const {active, dispatch, over, measureDroppableContainers} = inject('InternalContext', ref<InternalContextDescriptor>(defaultInternalContext)).value;

  const internalContext = useInternalContext()

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
  const id_C = computed(()=>id)
  const ids = useLatestValue(updateMeasurementsFor ?? id_C);
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
      internalContext.value.measureDroppableContainers(
        Array.isArray(ids.value) ? ids.value : [ids.value]
      );
      callbackId.current = null;
    }, resizeObserverTimeout);
  };
  const resizeObserver = useResizeObserver({
    callback: handleResize,
    disabled: resizeObserverDisabled || !internalContext.value.active,
  });
  const handleNodeChange = (newElement: HTMLElement | null, previousElement: HTMLElement | null) => {
      if (!resizeObserver.value) {
        return;
      }

      if (previousElement) {
        resizeObserver.value.unobserve(previousElement);
        resizeObserverConnected.value = false;
      }

      if (newElement) {
        resizeObserver.value.observe(newElement);
      }
    };
  const [nodeRef, setNodeRef] = useNodeRef(handleNodeChange);
  const dataRef = useLatestValue(computed(()=>data));

  watchEffect(() => {
    if (!resizeObserver.value || !nodeRef.value) {
      return;
    }

    resizeObserver.value.disconnect();
    resizeObserverConnected.value = false;
    resizeObserver.value.observe(nodeRef.value);
  });

  watch([id],
    (value, oldValue, onCleanup) => {
      internalContext.value.dispatch({
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
      onCleanup(() =>
        internalContext.value.dispatch({
          type: Action.UnregisterDroppable,
          key,
          id,
        }))
    }, {immediate: true}
  );

  watchEffect(() => {
    if (disabled !== previous.value.disabled) {
      internalContext.value.dispatch({
        type: Action.SetDroppableDisabled,
        id,
        key,
        disabled,
      });

      previous.value.disabled = disabled;
    }
  });

  return {
    // active: internalContext.value.active,
    rect,
    isOver: internalContext.value.over?.id === id,
    node: nodeRef,
    // over: internalContext.value.over,
    setNodeRef,
  };
}
