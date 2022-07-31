import {defineComponent, ref, h, Fragment, useSlots, inject} from 'vue'
import {PublicContextDescriptor} from "../store";
import {defaultPublicContext} from "../store/context";

interface ExampleProps {
}

export const vuePropsType = {
}
const PublicContextConsumer = defineComponent<ExampleProps>((props, {}) => {
  const slots = useSlots()
  const config = inject('PublicContext', ref<PublicContextDescriptor>(defaultPublicContext))
  return ()=>slots.default?slots.default(config):null
})

PublicContextConsumer.props = vuePropsType

export default PublicContextConsumer

