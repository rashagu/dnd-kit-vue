
import {
  useDraggable,
  useDroppable,
  UseDraggableArguments,
  UseDroppableArguments,
} from '@dnd-kit-vue/core';
import type {Data} from '@dnd-kit-vue/core';
import {CSS, isKeyboardEvent, useCombinedRefs} from '@dnd-kit-vue/utilities';

import {Context} from '../components';
import type {Disabled, SortableData, SortingStrategy} from '../types';
import {isValidIndex} from '../utilities';
import {
  defaultAnimateLayoutChanges,
  defaultAttributes,
  defaultNewIndexGetter,
  defaultTransition,
  disabledTransition,
  transitionProperty,
} from './defaults';
import type {
  AnimateLayoutChanges,
  NewIndexGetter,
  SortableTransition,
} from './types';
import {useDerivedTransform} from './utilities';
import {useSortableContext} from "../components/context/Consumer";
import {computed, ref, watch} from "vue";

export interface Arguments
  extends Omit<UseDraggableArguments, 'disabled'>,
    Pick<UseDroppableArguments, 'resizeObserverConfig'> {
  animateLayoutChanges?: AnimateLayoutChanges;
  disabled?: boolean | Disabled;
  getNewIndex?: NewIndexGetter;
  strategy?: SortingStrategy;
  transition?: SortableTransition | null;
}

export function useSortable({
  animateLayoutChanges = defaultAnimateLayoutChanges,
  attributes: userDefinedAttributes,
  disabled: localDisabled,
  data: customData,
  getNewIndex = defaultNewIndexGetter,
  id,
  strategy: localStrategy,
  resizeObserverConfig,
  transition = defaultTransition,
}: Arguments) {
  const {context} = useSortableContext();


  const disabled: Disabled = normalizeLocalDisabled(
    localDisabled,
    context.value.disabled
  );
  const index = computed(()=>{
    return context.value.items.indexOf(id.value)
  });
  const data = computed<SortableData & Data>(
    () => ({sortable: {containerId: context.value.containerId, index: index.value, items: context.value.items}, ...customData})
  );
  const itemsAfterCurrentSortable = computed(
    () => context.value.items.slice(context.value.items.indexOf(id.value))
  );
  const {rect, node, isOver, setNodeRef: setDroppableNodeRef} = useDroppable({
    id,
    data,
    disabled: disabled.droppable,
    resizeObserverConfig: {
      updateMeasurementsFor: itemsAfterCurrentSortable,
      ...resizeObserverConfig,
    },
  });
  const {
    internalContext,
    attributes,
    setNodeRef: setDraggableNodeRef,
    listeners,
    isDragging,
    setActivatorNodeRef,
    transform,
  } = useDraggable({
    id,
    data,
    attributes: {
      ...defaultAttributes,
      ...userDefinedAttributes,
    },
    disabled: disabled.draggable,
  });

  const setNodeRef = useCombinedRefs(setDroppableNodeRef, setDraggableNodeRef);
  const isSorting = computed(()=>Boolean(internalContext.value.active));
  const displaceItem = computed(()=>{
    return isSorting.value &&
    !context.value.disableTransforms &&
    isValidIndex(context.value.activeIndex) &&
    isValidIndex(context.value.overIndex)
  });


  const shouldDisplaceDragSource = computed(()=>{
    return !context.value.useDragOverlay && isDragging.value
  });
  const dragSourceDisplacement = computed(()=>{
    return shouldDisplaceDragSource.value && displaceItem.value ? transform.value : null
  });

  const strategy = localStrategy ?? context.value.strategy;
  const finalTransform = computed(()=>{
    const v = displaceItem.value? dragSourceDisplacement.value ?? strategy({
        rects: context.value.sortedRects,
        activeNodeRect: internalContext.value.activeNodeRect,
        activeIndex: context.value.activeIndex,
        overIndex: context.value.overIndex,
        index: index.value,
      })
      : null
    return v
  });


  const newIndex =computed(()=>{
    return isValidIndex(context.value.activeIndex) && isValidIndex(context.value.overIndex)
      ? getNewIndex({id: id.value, items:context.value.items, activeIndex:context.value.activeIndex, overIndex:context.value.overIndex})
      : index.value
  });

  const activeId = computed(()=>{
    return internalContext.value.active?.id
  });
  const previous = ref({
    activeId: activeId.value,
    items: context.value.items,
    newIndex: newIndex.value,
    containerId: context.value.containerId,
  })
  const itemsHaveChanged = computed(()=>{
    return context.value.items !== previous.value.items
  });
  const shouldAnimateLayoutChanges = computed(()=>{
    return animateLayoutChanges({
      active: internalContext.value.active,
      containerId: context.value.containerId,
      isDragging: isDragging.value,
      isSorting: isSorting.value,
      id: id.value,
      index: index.value,
      items:context.value.items,
      newIndex: previous.value.newIndex,
      previousItems: previous.value.items,
      previousContainerId: previous.value.containerId,
      transition,
      wasDragging: previous.value?.activeId != null,
    })
  });

  const derivedTransform = useDerivedTransform({
    disabled: shouldAnimateLayoutChanges,
    index,
    node,
    rect,
  });

  watch([isSorting, newIndex, ()=>context.value.containerId, ()=>context.value.items], ()=>{
    if (isSorting.value && previous.value.newIndex !== newIndex.value) {
      previous.value.newIndex = newIndex.value;
    }

    if (context.value.containerId !== previous.value.containerId) {
      previous.value.containerId = context.value.containerId;
    }

    if (context.value.items !== previous.value.items) {
      previous.value.items = context.value.items;
    }
  })


  watch([activeId], (value, oldValue, onCleanup) => {
    if (activeId.value === previous.value.activeId) {
      return;
    }

    if (activeId.value && !previous.value.activeId) {
      previous.value.activeId = activeId.value;
      return;
    }

    const timeoutId = setTimeout(() => {
      previous.value.activeId = activeId.value;
    }, 50);

    onCleanup(() => clearTimeout(timeoutId))
  });


  const getTransitionValue = computed(()=>{
    return getTransition()
  })
  function getTransition() {

    if (
      // Temporarily disable transitions for a single frame to set up derived transforms
      derivedTransform.value ||
      // Or to prevent items jumping to back to their "new" position when items change
      (itemsHaveChanged.value && previous.value.newIndex === index.value)
    ) {
      return disabledTransition;
    }

    if (
      (shouldDisplaceDragSource.value && !isKeyboardEvent(internalContext.value.activatorEvent)) ||
      !transition
    ) {
      return undefined;
    }

    if (isSorting.value || shouldAnimateLayoutChanges.value) {

      return CSS.Transition.toString({
        ...transition,
        property: transitionProperty,
      });
    }

    return undefined;
  }

  return {
    internalContext,
    context,
    // active: internalContext.value.active,
    // activeIndex: context.value.activeIndex,
    // items: context.value.items,
    // overIndex: context.value.overIndex,
    // over: internalContext.value.over,
    attributes,
    data,
    rect,
    index,
    newIndex,
    isOver,
    isSorting,
    isDragging,
    listeners,
    node,
    setNodeRef,
    setActivatorNodeRef,
    setDroppableNodeRef,
    setDraggableNodeRef,
    transform: derivedTransform.value? derivedTransform : finalTransform,
    transition: getTransitionValue,
  };
}

function normalizeLocalDisabled(
  localDisabled: Arguments['disabled'],
  globalDisabled: Disabled
) {
  if (typeof localDisabled === 'boolean') {
    return {
      draggable: localDisabled,
      // Backwards compatibility
      droppable: false,
    };
  }

  return {
    draggable: localDisabled?.draggable ?? globalDisabled.draggable,
    droppable: localDisabled?.droppable ?? globalDisabled.droppable,
  };
}
