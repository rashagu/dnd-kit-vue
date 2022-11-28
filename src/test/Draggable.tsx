import {defineComponent, ref, h, Fragment, computed} from 'vue'
import {useDraggable} from "../../packages/core";
import {CSS} from '../../packages/utilities';

interface ExampleProps {
  name?: string
}

export const vuePropsType = {
  name: String
}
const Draggable = defineComponent<ExampleProps>((props, {slots}) => {
  const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({
    id: computed(()=>'unique-id'),
  });

  return ()=>{
    console.log(transform.value, isDragging.value)
    return (
      <button
        ref={setNodeRef as any}
        style={{
          width: '300px',
          transform: CSS.Translate.toString(transform.value),
          boxShadow: isDragging.value
            ? '-1px 0 15px 0 rgba(34, 33, 81, 0.01), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)'
            : undefined,
        }}
        {...listeners?.value} {...attributes.value} >Drag handle {isDragging.value?'isDragging':''}</button>
    )
  };
})

Draggable.props = vuePropsType

export default Draggable

