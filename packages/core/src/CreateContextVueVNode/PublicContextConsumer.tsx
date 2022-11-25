import {defineComponent, ref, h, Fragment, useSlots, inject} from 'vue'
import {PublicContextDescriptor} from "../store";
import {defaultPublicContext} from "../store/context";

interface ExampleProps {
}

export const vuePropsType = {
}

export function usePublicContext() {
  return inject('PublicContext', ref<PublicContextDescriptor>(defaultPublicContext))
}
const PublicContextConsumer = defineComponent<ExampleProps>((props, {}) => {
  const slots = useSlots()
  const config = usePublicContext()
  return ()=>slots.default?slots.default(config):null
})

PublicContextConsumer.props = vuePropsType

export default PublicContextConsumer

