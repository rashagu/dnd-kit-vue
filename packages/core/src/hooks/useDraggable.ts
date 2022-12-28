import {
  Transform,
  useNodeRef,
  useIsomorphicLayoutEffect,
  useLatestValue,
  useUniqueId,
} from '@dnd-kit-vue/utilities';

import {InternalContext, Data, InternalContextDescriptor, defaultInternalContext} from '../store';
import type {UniqueIdentifier} from '../types';
import {ActiveDraggableContext} from '../components/DndContext';
import {useSyntheticListeners, SyntheticListenerMap} from './utilities';
import {computed, ComputedRef, inject, ref, watch} from "vue";
import {defaultCoordinates} from "../utilities";
import {useDndContext} from "../CreateContextVueVNode/DndContextConsumer";
import {useInternalContext} from "../CreateContextVueVNode/InternalContextConsumer";

export interface UseDraggableArguments {
  id: ComputedRef<UniqueIdentifier>;
  data?: ComputedRef<Data>;
  disabled: ComputedRef<boolean>;
  attributes?: {
    role?: string;
    roleDescription?: string;
    tabIndex?: number;
  };
}

export interface DraggableAttributes {
  role: string;
  tabIndex: number;
  'aria-disabled': boolean;
  'aria-pressed': boolean | undefined;
  'aria-roledescription': string;
  'aria-describedby': string;
}

export type DraggableSyntheticListeners = SyntheticListenerMap | undefined;

const defaultRole = 'button';

const ID_PREFIX = 'Droppable';

export function useDraggable({
  id,
  data,
  disabled,
  attributes,
}: UseDraggableArguments) {
  const key = useUniqueId(ID_PREFIX);
  const internalContext = useInternalContext();

  const dndContext = useDndContext()
  const {role = defaultRole, roleDescription = 'draggable', tabIndex = 0} =
    attributes ?? {};
  const activeId = computed(()=>internalContext.value.active?.id)


  const isDragging = ref(false)
  watch(activeId, ()=>{
    isDragging.value = internalContext.value.active?.id === id.value
  }, {immediate: true})

  const transform= computed<Transform | null >(()=>{
    return  isDragging.value ? dndContext.value : null;
  })
  const [node, setNodeRef] = useNodeRef();
  const [activatorNode, setActivatorNodeRef] = useNodeRef();
  const listeners = useSyntheticListeners(internalContext.value.activators, id);

  const dataRef = useLatestValue(computed(()=>data?.value));

  watch([()=>internalContext.value.draggableNodes, ()=>id.value], () => {
      internalContext.value.draggableNodes.set(id.value, {id: id.value, key: key.value, node, activatorNode, data: dataRef});

      return () => {
        const node = internalContext.value.draggableNodes.get(id.value);

        if (node && node.key === key.value) {
          internalContext.value.draggableNodes.delete(id.value);
        }
      };
    }, {immediate: true});


  const memoizedAttributes = ref<DraggableAttributes>(getMemoizedAttributes())
  function getMemoizedAttributes() {
    return {
      role,
      tabIndex,
      'aria-disabled': disabled.value,
      'aria-pressed': isDragging.value && role === defaultRole ? true : undefined,
      'aria-roledescription': roleDescription,
      'aria-describedby': internalContext.value.ariaDescribedById.draggable,
    }
  }

  watch([
    ()=>isDragging.value,
    ()=>disabled.value,
    ()=>internalContext.value.ariaDescribedById.draggable
  ],()=>{
    memoizedAttributes.value = getMemoizedAttributes()
  })

  return {
    internalContext:internalContext,
    isDragging,
    attributes: memoizedAttributes,
    listeners: computed(()=>disabled.value ? undefined : listeners.value),
    node,
    setNodeRef,
    setActivatorNodeRef,
    transform,
  };
}
