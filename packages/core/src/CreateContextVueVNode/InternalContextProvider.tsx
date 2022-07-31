
import {defineComponent, provide, ref} from "vue";
import {InternalContextDescriptor} from "../store";



const InternalContextProvider = defineComponent<{value:any}>((props, {slots}) => {
    //console.log(props)
    // const DndContext = ref<InternalContextDescriptor>(props.value || {});

    provide('InternalContext', props.value)
    return ()=>slots.default?slots.default(props.value):null
})
InternalContextProvider.props = {
    value:Object
}
export default InternalContextProvider;
