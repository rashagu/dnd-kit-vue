import {useSortable} from '@kousum/sortable';
import {CSS} from '@kousum/utilities';


import {defineComponent, ref, h, Fragment, useSlots, VNodeRef, CSSProperties, getCurrentInstance, inject} from 'vue'

interface SortableItemProps {
  id: number | string,
}

export const vuePropsType = {
  id: [String, Number]
}
const SortableItem = defineComponent<SortableItemProps>((props, {}) => {

  const slots = useSlots()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: props.id});

  return () => {
    const style:CSSProperties = {
      height: '20px',
      margin: '10px',
      backgroundColor: 'rgba(38,140,255,0.25)',
      transform: CSS.Transform.toString(transform.value),
      transition,
    };
    console.log('transform', transform.value)

    return (
      <div ref={setNodeRef as VNodeRef} style={style} {...attributes.value} {...listeners?.value}>
        {/* ... */}
        {props.id}
      </div>
    );
  }
})

SortableItem.props = vuePropsType
SortableItem.name = 'SortableItem'

export default SortableItem

