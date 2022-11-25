
import {defineComponent, provide, ref, watch} from "vue";
import {InternalContextDescriptor} from "../store";



const InternalContextProvider = defineComponent<{value:InternalContextDescriptor}>((props, {slots}) => {
    //console.log(props)
    // const DndContext = ref<InternalContextDescriptor>(props.value || {});

    const context = ref<InternalContextDescriptor>(props.value);

    watch(()=>props.value, ()=>{
        context.value = props.value
    }, { deep: true})
    provide('InternalContext', context)
    return ()=>slots.default?slots.default(context.value):null

})
InternalContextProvider.props = {
    value:Object
}
export default InternalContextProvider;
