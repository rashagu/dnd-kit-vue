
import {defineComponent, getCurrentInstance, provide, ref, watch} from "vue";
import type {Transform} from '@dnd-kit-vue/utilities';



const DndContextProvider = defineComponent<{value:Transform}>((props, {slots}) => {
    //console.log(props)
    // const DndContext = ref<Transform>(props.value || {});

    const context = ref<Transform>(props.value);

    watch(()=>props.value, ()=>{
        context.value = props.value
    }, { deep: true})
    provide('DndContext', context)
    return ()=>slots.default?slots.default(context.value):null
})
DndContextProvider.props = {
    value:Object
}
export default DndContextProvider;
