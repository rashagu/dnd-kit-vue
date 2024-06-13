
import {defineComponent, provide, ref, watch} from "vue";
import type {InternalContextDescriptor} from "../store";



const InternalContextProvider = defineComponent<{value:InternalContextDescriptor}>((props, {slots}) => {
    //console.log(props)
    // const DndContext = ref<InternalContextDescriptor>(props.value || {});

    const context = ref<InternalContextDescriptor>(props.value);

    watch(()=>props.value, ()=>{
        context.value = props.value
    }, { deep: true})
    provide('InternalContext', context)
    return ()=>slots.default?slots.default(context.value):null

}, {
    props: {
        value:Object
    },
    name: 'InternalContextProvider'
})

export default InternalContextProvider;
