
import {
  useLatestValue,
  useNodeRef,
  useUniqueId,
} from '@dnd-kit-vue/utilities';

import {InternalContext, Action, Data, InternalContextDescriptor, defaultInternalContext} from '../store';
import type {ClientRect, UniqueIdentifier} from '../types';

import {useResizeObserver} from './utilities';
import {computed, ComputedRef, getCurrentInstance, inject, ref, shallowRef, watch, watchEffect} from "vue";
import {useInternalContext} from "../CreateContextVueVNode/InternalContextConsumer";
import {isEqual} from "lodash";

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
  id: ComputedRef<UniqueIdentifier>;
  disabled: ComputedRef<boolean>;
  data?: ComputedRef<Data>;
  resizeObserverConfig?: ResizeObserverConfig;
}

const ID_PREFIX = 'Droppable';

const defaultResizeObserverConfig = {
  timeout: 25,
};

export function useDroppable({
  data,
  disabled,
  id,
  resizeObserverConfig,
}: UseDroppableArguments) {
  const key = useUniqueId(ID_PREFIX);
  // const {active, dispatch, over, measureDroppableContainers} = inject('InternalContext', ref<InternalContextDescriptor>(defaultInternalContext)).value;

  const internalContext = useInternalContext()

  const previous = shallowRef({disabled:disabled.value});
  const resizeObserverConnected = shallowRef(false);
  const rect = shallowRef<ClientRect | null>(null);

  const callbackId = shallowRef<any>(null);
  const {
    disabled: resizeObserverDisabled,
    updateMeasurementsFor,
    timeout: resizeObserverTimeout,
  } = {
    ...defaultResizeObserverConfig,
    ...resizeObserverConfig,
  };
  const id_C = computed(()=>id.value)
  const latestValue = computed(()=>{
    return updateMeasurementsFor?.value ?? id_C.value
  })
  const ids = useLatestValue(latestValue);
  const handleResize = () => {
    if (!resizeObserverConnected.value) {
      // ResizeObserver invokes the `handleResize` callback as soon as `observe` is called,
      // assuming the element is rendered and displayed.
      resizeObserverConnected.value = true;
      return;
    }

    if (callbackId.value != null) {
      clearTimeout(callbackId.value);
    }

    callbackId.value = setTimeout(() => {
      internalContext.value.measureDroppableContainers(
        Array.isArray(ids.value) ? ids.value : [ids.value]
      );
      callbackId.value = null;
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
  const dataRef = useLatestValue(computed(()=>data?.value));

  watch([nodeRef, resizeObserver], () => {
    if (!resizeObserver.value || !nodeRef.value) {
      return;
    }

    resizeObserver.value.disconnect();
    resizeObserverConnected.value = false;
    resizeObserver.value.observe(nodeRef.value);
  }, {immediate: true});


  watch(()=>id.value, (value, oldValue, onCleanup) => {
      internalContext.value.dispatch({
        type: Action.RegisterDroppable,
        element: {
          id: value,
          key,
          disabled:disabled.value,
          node: nodeRef,
          rect,
          data: dataRef,
        },
      });
      onCleanup(() =>
        internalContext.value.dispatch({
          type: Action.UnregisterDroppable,
          key,
          id: value,
        }))
    }, {immediate: true}
  );

  watch([id, key, ()=>disabled.value, ()=>internalContext.value.dispatch], () => {
    if (disabled.value !== previous.value.disabled) {
      internalContext.value.dispatch({
        type: Action.SetDroppableDisabled,
        id: id.value,
        key,
        disabled: disabled.value,
      });

      previous.value.disabled = disabled.value;
    }
  });
  const isOver = computed(()=>{
    return internalContext.value.over?.id === id.value
  })
  // TODO
  const rect_ = ref(rect.value)
  watch(rect, (value, oldValue, onCleanup)=>{
    if (!isEqual(value, oldValue)){
      rect_.value = value
    }
  })

  return {
    // active: internalContext.value.active,
    rect:rect_,
    isOver: isOver,
    node: nodeRef,
    // over: internalContext.value.over,
    setNodeRef,
  };
}
