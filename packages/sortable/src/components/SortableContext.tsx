
import {useDndContext, ClientRect, UniqueIdentifier} from '@dnd-kit-vue/core';
import {useIsomorphicLayoutEffect, useUniqueId} from '@dnd-kit-vue/utilities';


import type {Disabled, SortingStrategy} from '../types';
import {getSortedRects, itemsEqual, normalizeDisabled} from '../utilities';
import {rectSortingStrategy} from '../strategies';
import {createContext} from "../createContext";
import {
  ComponentObjectPropsOptions,
  computed,
  type ComputedRef,
  defineComponent,
  getCurrentInstance,
  h,
  onRenderTracked, PropType,
  ref,
  useSlots,
  watch,
  watchEffect
} from 'vue'
import Provider from "./context/Provider";
import Consumer from "./context/Consumer";

export interface Props {
  items: (UniqueIdentifier | {id: UniqueIdentifier})[];
  strategy?: SortingStrategy;
  id?: string;
  disabled?: boolean | Disabled;
}

export const ID_PREFIX = 'Sortable';

export interface ContextDescriptor {
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

export const Context = {
  Provider,
  Consumer
};



export const vuePropsType: ComponentObjectPropsOptions<Props> = {
  id: String,
  items: {
    type: [Array],
  },
  strategy: {
    type: Function as PropType<Props['strategy']>,
    default: rectSortingStrategy
  },
  disabled: {
    type: Boolean as PropType<Props['disabled']>,
    default: false
  },
}
const SortableContext = defineComponent<Props>((props, {}) => {

  const slots = useSlots()

  // const {
  //   active,
  //   dragOverlay,
  //   droppableRects,
  //   over,
  //   measureDroppableContainers,
  //   measuringScheduled,
  // } = useDndContext();
  const dndContext = useDndContext();
  const containerId = useUniqueId(ID_PREFIX, props.id);
  const useDragOverlay = computed(()=>Boolean(dndContext.value.dragOverlay.rect !== null))

  const items = computed<UniqueIdentifier[]>(
    () =>{
      return props.items.map((item) =>
        typeof item === 'object' && 'id' in item ? item.id : item
      )
    }
  );
  const isDragging = computed(()=>{
    return dndContext.value.active != null
  });
  const activeIndex = computed(()=>dndContext.value.active ? items.value.indexOf(dndContext.value.active.id) : -1);
  const overIndex = ref<number>(-1);
  watch(()=>dndContext.value.over?.id, ()=>{
    overIndex.value = dndContext.value.over ? items.value.indexOf(dndContext.value.over.id) : -1
  }, {immediate:true})

  const previousItemsRef = ref(items.value);
  const itemsHaveChanged = computed(()=>!itemsEqual(items.value, previousItemsRef.value));
  const disableTransforms = computed(()=>{
    return (overIndex.value !== -1 && activeIndex.value === -1) || itemsHaveChanged.value
  });


  watch([
    itemsHaveChanged,
    items,
    ()=>isDragging.value,
    ()=>dndContext.value.measureDroppableContainers,
    ()=>dndContext.value.measuringScheduled,
  ], (value, oldValue, onCleanup) => {
    if (itemsHaveChanged.value && isDragging.value && !dndContext.value.measuringScheduled) {
      dndContext.value.measureDroppableContainers(items.value);
    }
  }, {immediate: true});

  watchEffect(() => {
    previousItemsRef.value = items.value;
  });




  return () => {
    const disabled = normalizeDisabled(props.disabled!);

    const contextValue: ContextDescriptor = {
      activeIndex:activeIndex.value,
      containerId:containerId.value,
      disabled,
      disableTransforms:disableTransforms.value,
      items:items.value,
      overIndex:overIndex.value,
      useDragOverlay: useDragOverlay.value,
      sortedRects: getSortedRects(items.value, dndContext.value.droppableRects),
      strategy: props.strategy!,
    }
    return <Context.Provider value={contextValue}>{slots.default?.()}</Context.Provider>;
  }
}, {
  props: vuePropsType,
  name: 'SortableContext'
})


export {
  SortableContext
}
