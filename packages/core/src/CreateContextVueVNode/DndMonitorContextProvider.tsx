
import { defineComponent, type PropType, provide, ref, watch } from 'vue'
import type {RegisterListener} from "../components/DndMonitor/types";



const DndMonitorContextProvider = defineComponent<{value:RegisterListener}>((props, {slots}) => {
    //console.log(props)
    const context = ref<RegisterListener | null>(props.value);


    watch(()=>props.value, ()=>{
        context.value = props.value
    }, { deep: true})
    provide('DndMonitorContext', context)
    return ()=>slots.default?slots.default(context.value):null

}, {
    props: {
        value: Function as PropType<RegisterListener>
    },
    name: 'DndMonitorContextProvider'
})

export default DndMonitorContextProvider;
