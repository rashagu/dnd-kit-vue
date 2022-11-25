import {
  Transform,
  useNodeRef,
  useIsomorphicLayoutEffect,
  useLatestValue,
  useUniqueId,
} from '@kousum/utilities';

import {InternalContext, Data, InternalContextDescriptor, defaultInternalContext} from '../store';
import type {UniqueIdentifier} from '../types';
import {ActiveDraggableContext} from '../components/DndContext';
import {useSyntheticListeners, SyntheticListenerMap} from './utilities';
import {computed, ComputedRef, inject, ref, watch} from "vue";
import {defaultCoordinates} from "../utilities";

export interface UseDraggableArguments {
  id: UniqueIdentifier;
  data?: Data;
  disabled?: boolean;
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
  disabled = false,
  attributes,
}: UseDraggableArguments) {
  const key = useUniqueId(ID_PREFIX);
  const internalContext = inject('InternalContext', ref<InternalContextDescriptor>(defaultInternalContext));


  const {role = defaultRole, roleDescription = 'draggable', tabIndex = 0} =
    attributes ?? {};
  const isDragging = computed(()=>{
    return internalContext.value.active?.id === id
  });
  const transform= computed<Transform | null >(()=>{
    console.log(inject('DndContext'))
    return  isDragging.value ? inject('DndContext', ref<Transform>({
      ...defaultCoordinates,
      scaleX: 1,
      scaleY: 1,
    })).value : null;
  })
  const [node, setNodeRef] = useNodeRef();
  const [activatorNode, setActivatorNodeRef] = useNodeRef();
  const listeners = useSyntheticListeners(internalContext.value.activators, id);

  const dataRef = useLatestValue(computed(()=>data));

  useIsomorphicLayoutEffect(
    () => {
      internalContext.value.draggableNodes.set(id, {id, key: key.value, node, activatorNode, data: dataRef});

      return () => {
        const node = internalContext.value.draggableNodes.get(id);

        if (node && node.key === key.value) {
          internalContext.value.draggableNodes.delete(id);
        }
      };
    }
  );

  const memoizedAttributes: ComputedRef<DraggableAttributes> = computed(
    () => {
      return {
        role,
        tabIndex,
        'aria-disabled': disabled,
        'aria-pressed': isDragging.value && role === defaultRole ? true : undefined,
        'aria-roledescription': roleDescription,
        'aria-describedby': internalContext.value.ariaDescribedById.draggable,
      }
    });

  return {
    internalContext:internalContext,
    isDragging,
    attributes: memoizedAttributes,
    listeners: disabled ? undefined : listeners,
    node,
    setNodeRef,
    setActivatorNodeRef,
    transform,
  };
}
