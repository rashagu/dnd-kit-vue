import { defineComponent, inject, ref, useSlots } from 'vue'
import type { RegisterListener } from '../components/DndMonitor/types'

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
}, {
  props: vuePropsType
})


export default DndMonitorContextConsumer

