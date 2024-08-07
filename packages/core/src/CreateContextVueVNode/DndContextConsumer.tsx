import {defineComponent, ref, h, Fragment, useSlots, inject} from 'vue'
import type {Transform} from '@dnd-kit-vue/utilities';
import {defaultCoordinates} from "../utilities";

interface ExampleProps {
}

export const vuePropsType = {
}

export function useDndContext() {
  return inject('DndContext', ref<Transform>({
    ...defaultCoordinates,
    scaleX: 1,
    scaleY: 1,
  }))
}
const DndContextConsumer = defineComponent<ExampleProps>((props, {}) => {
  const slots = useSlots()
  const config = useDndContext()
  return ()=>slots.default?slots.default(config):null
}, {
  props: vuePropsType,
})


export default DndContextConsumer

