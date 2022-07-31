import {defineComponent, ref, h, Fragment, useSlots, inject} from 'vue'
import type {Transform} from '@kousum/utilities';
import {defaultCoordinates} from "../utilities";
import {RegisterListener} from "../components/DndMonitor/types";

interface ExampleProps {
}

export const vuePropsType = {
}
const DndMonitorContextConsumer = defineComponent<ExampleProps>((props, {}) => {
  const slots = useSlots()
  const config = inject('DndMonitorContext', ref<RegisterListener | null>(null))
  return ()=>slots.default?slots.default(config):null
})

DndMonitorContextConsumer.props = vuePropsType

export default DndMonitorContextConsumer

