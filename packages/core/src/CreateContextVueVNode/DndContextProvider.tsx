
import {defineComponent, provide, ref} from "vue";
import type {Transform} from '@kousum/utilities';



const DndContextProvider = defineComponent<{value:any}>((props, {slots}) => {
    //console.log(props)
    // const DndContext = ref<Transform>(props.value || {});

    provide('DndContext', props.value)
    return ()=>slots.default?slots.default(props.value):null
})
DndContextProvider.props = {
    value:Object
}
export default DndContextProvider;
