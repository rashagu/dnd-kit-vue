import {useSortable} from '@dnd-kit-vue/sortable';
import {CSS} from '@dnd-kit-vue/utilities';


import {
  defineComponent,
  ref,
  h,
  Fragment,
  useSlots,
  VNodeRef,
  CSSProperties,
  getCurrentInstance,
  inject,
  computed
} from 'vue'
import type {Arguments} from "@dnd-kit-vue/sortable";

interface SortableItemProps {
  id: number | string,
}

export const vuePropsType = {
  id: [String, Number]
}
const SortableItem = defineComponent<SortableItemProps>((props, {}) => {

  const slots = useSlots()

  const params:Arguments = {id: computed(()=>props.id) as any}
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable(params);

  return () => {
    const style:CSSProperties = {
      height: '20px',
      margin: '10px',
      backgroundColor: 'rgba(38,140,255,0.25)',
      transform: CSS.Transform.toString(transform.value),
      transition,
    };

    return (
      <div ref={setNodeRef as any} style={style} {...attributes.value} {...listeners?.value}>
        {/* ... */}
        {props.id}
      </div>
    );
  }
})

SortableItem.props = vuePropsType
SortableItem.name = 'SortableItem'

export default SortableItem

