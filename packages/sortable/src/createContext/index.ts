

import {defineComponent, provide, Ref, ref} from "vue";
import type {Transform} from '@kousum/utilities';





export function createContext<T>(defaultValue:T){

  const DndContextProvider = defineComponent<{value:Ref<T>}>((props, {slots}) => {
    //console.log(props)
    // const DndContext = ref<Transform>(props.value || {});

    provide('DndContext', props.value || ref<T>(defaultValue))
    return ()=>slots.default?slots.default(props.value):null
  })
  DndContextProvider.props = {
    value:Object
  }

  return {
    Provider: DndContextProvider
  }
}

