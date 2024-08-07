import {defineComponent, ref, h, Fragment, useSlots, inject} from 'vue'
import {defaultInternalContext, type InternalContextDescriptor} from "../store";

interface ExampleProps {
}

export const vuePropsType = {
}
export function useInternalContext() {
  return inject('InternalContext', ref<InternalContextDescriptor>(defaultInternalContext))
}
const InternalContextConsumer = defineComponent<ExampleProps>((props, {}) => {
  const slots = useSlots()
  const config = useInternalContext()
  return ()=>slots.default?slots.default(config):null
}, {
  props: vuePropsType,
})


export default InternalContextConsumer

