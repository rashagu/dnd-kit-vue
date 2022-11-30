import {defineComponent, ref, h, Fragment, useSlots, inject} from 'vue'
import type {Transform} from '@dnd-kit-vue/utilities';
import {defaultCoordinates} from "../utilities";
import {RegisterListener} from "../components/DndMonitor/types";

interface ExampleProps {
}

export const vuePropsType = {
}

export function useDndMonitorContext() {
  return inject('DndMonitorContext', ref<RegisterListener | null>(null))
}
const DndMonitorContextConsumer = defineComponent<ExampleProps>((props, {}) => {
  const slots = useSlots()
  const config = useDndMonitorContext()
  return ()=>slots.default?slots.default(config):null
})

DndMonitorContextConsumer.props = vuePropsType

export default DndMonitorContextConsumer

