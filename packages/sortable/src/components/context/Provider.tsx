import {defineComponent, ref, h, Fragment, provide, watch} from 'vue'
import {ContextDescriptor} from "../SortableContext";


export const vuePropsType = {
  value: Object
}
const Provider = defineComponent<{value:ContextDescriptor}>((props, {slots}) => {
  const ConfigContext = ref<ContextDescriptor>(props.value);

  watch(()=>props.value, ()=>{
    ConfigContext.value = props.value
  }, { deep: true})
  provide('SortableContext', ConfigContext)
  return ()=>slots.default?slots.default(ConfigContext.value):null
})

Provider.props = vuePropsType
Provider.name = 'SortableProvider'

export default Provider

