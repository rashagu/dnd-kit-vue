import {defineComponent, h, inject, type Ref, ref, type UnwrapRef, useSlots} from 'vue'
import { type ContextDescriptor, ID_PREFIX} from "../SortableContext";
import {rectSortingStrategy} from "../../strategies";



export function useSortableContext (): { context: Ref<UnwrapRef<ContextDescriptor>> } {
  const context = inject('SortableContext', ref<ContextDescriptor>({
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
  }))
  return {
    context
  }
}
export const vuePropsType = {
  name: String
}
const Consumer = defineComponent(() => {
  const slots = useSlots()
  const {context} = useSortableContext()
  return () => slots.default ? slots.default(context) : null
}, {
  props: vuePropsType,
  name: 'SortableConsumer'
})


export default Consumer

