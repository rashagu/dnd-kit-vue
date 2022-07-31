
import {defineComponent, provide, ref} from "vue";
import {PublicContextDescriptor} from "../store";



const PublicContextProvider = defineComponent<{value:any}>((props, {slots}) => {
    //console.log(props)
    // const DndContext = ref<PublicContextDescriptor>(props.value || {});

    provide('PublicContext', props.value)
    return ()=>slots.default?slots.default(props.value):null
})
PublicContextProvider.props = {
    value:Object
}
export default PublicContextProvider;
