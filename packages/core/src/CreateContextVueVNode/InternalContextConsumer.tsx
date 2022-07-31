import {defineComponent, ref, h, Fragment, useSlots, inject} from 'vue'
import {defaultInternalContext, InternalContextDescriptor} from "../store";

interface ExampleProps {
}

export const vuePropsType = {
}
const InternalContextConsumer = defineComponent<ExampleProps>((props, {}) => {
  const slots = useSlots()
  const config = inject('InternalContext', ref<InternalContextDescriptor>(defaultInternalContext))
  return ()=>slots.default?slots.default(config):null
})

InternalContextConsumer.props = vuePropsType

export default InternalContextConsumer

