
import {defineComponent, provide, ref} from "vue";
import {RegisterListener} from "../components/DndMonitor/types";



const DndMonitorContextProvider = defineComponent<{value:any}>((props, {slots}) => {
    //console.log(props)
    const DndContext = ref<RegisterListener | null>(props.value || {});

    provide('DndMonitorContext', DndContext)
    return ()=>slots.default?slots.default(DndContext.value):null
})
DndMonitorContextProvider.props = {
    value:Object
}
export default DndMonitorContextProvider;
