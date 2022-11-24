
import {useDndContext, ClientRect, UniqueIdentifier} from '@kousum/core';
import {useIsomorphicLayoutEffect, useUniqueId} from '@kousum/utilities';

import type {Disabled, SortingStrategy} from '../types';
import {getSortedRects, itemsEqual, normalizeDisabled} from '../utilities';
import {rectSortingStrategy} from '../strategies';
import {createContext} from "../createContext";
import {computed, ComputedRef, ref, useSlots, watchEffect} from "vue";

export interface Props {
  items: (UniqueIdentifier | {id: UniqueIdentifier})[];
  strategy?: SortingStrategy;
  id?: string;
  disabled?: boolean | Disabled;
}

const ID_PREFIX = 'Sortable';

interface ContextDescriptor {
  activeIndex: number;
  containerId: string;
  disabled: Disabled;
  disableTransforms: boolean;
  items: UniqueIdentifier[];
  overIndex: number;
  useDragOverlay: boolean;
  sortedRects: ClientRect[];
  strategy: SortingStrategy;
}

export const Context = createContext<ContextDescriptor>({
  activeIndex: -1,
  containerId: ID_PREFIX,
  disableTransforms: false,
  items: [],
  overIndex: -1,
  useDragOverlay: false,
  sortedRects: [],
  strategy: rectSortingStrategy,
  disabled: {
    draggable: false,
    droppable: false,
  },
});

export function SortableContext({
  id,
  items: userDefinedItems,
  strategy = rectSortingStrategy,
  disabled: disabledProp = false,
}: Props) {
  const {
    active,
    dragOverlay,
    droppableRects,
    over,
    measureDroppableContainers,
    measuringScheduled,
  } = useDndContext();
  const containerId = useUniqueId(ID_PREFIX, id);
  const useDragOverlay = Boolean(dragOverlay.rect !== null);
  const items = computed<UniqueIdentifier[]>(
    () =>
      userDefinedItems.map((item) =>
        typeof item === 'object' && 'id' in item ? item.id : item
      )
  );
  const isDragging = active != null;
  const activeIndex = computed(()=>active ? items.value.indexOf(active.id) : -1);
  const overIndex = computed(()=>over ? items.value.indexOf(over.id) : -1);
  const previousItemsRef = ref(items.value);
  const itemsHaveChanged = computed(()=>!itemsEqual(items.value, previousItemsRef.value));
  const disableTransforms = computed(()=>{
    return (overIndex.value !== -1 && activeIndex.value === -1) || itemsHaveChanged.value
  });
  const disabled = normalizeDisabled(disabledProp);

  useIsomorphicLayoutEffect(() => {
    if (itemsHaveChanged && isDragging && !measuringScheduled) {
      measureDroppableContainers(items.value);
    }
  });

  watchEffect(() => {
    previousItemsRef.value = items.value;
  });

  const contextValue = computed(
    (): ContextDescriptor => ({
      activeIndex:activeIndex.value,
      containerId:containerId.value,
      disabled,
      disableTransforms:disableTransforms.value,
      items:items.value,
      overIndex:overIndex.value,
      useDragOverlay,
      sortedRects: getSortedRects(items.value, droppableRects),
      strategy,
    }));

  const slots = useSlots()
  return <Context.Provider value={contextValue}>{slots.default?.()}</Context.Provider>;
}
