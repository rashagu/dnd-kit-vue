
import {defineComponent, provide, ref, watch} from "vue";
import {PublicContextDescriptor} from "../store";



const PublicContextProvider = defineComponent<{value:PublicContextDescriptor}>((props, {slots}) => {
    //console.log(props)
    // const DndContext = ref<PublicContextDescriptor>(props.value || {});

    const context = ref<PublicContextDescriptor>(props.value);

    watch(()=>props.value, ()=>{
        // @ts-ignore
        context.value = props.value
    }, { deep: true})
    provide('PublicContext', context)
    return ()=>slots.default?slots.default(context.value):null
})
PublicContextProvider.props = {
    value:Object
}
export default PublicContextProvider;
