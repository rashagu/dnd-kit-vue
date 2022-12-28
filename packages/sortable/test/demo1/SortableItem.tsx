import {useSortable} from '@dnd-kit-vue/sortable';
import {CSS} from '@dnd-kit-vue/utilities';
import styles from './styles.module.css'


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
      transform: CSS.Transform.toString(transform.value),
      transition:transition.value,
    };

    return (
      <div ref={setNodeRef as any} style={{...style, padding: '4px 0'}}>
        <div {...attributes.value} {...listeners?.value} class={styles._1xrmbrmSFNKCAqjWPMGd2t}>
          {/* ... */}
          {props.id}
        </div>
      </div>
    );
  }
})

SortableItem.props = vuePropsType
SortableItem.name = 'SortableItem'

export default SortableItem

