import {ref, UnwrapRef, watch} from "vue";
import type {WatchSource} from "vue";


export default function watchRef<T>(callback: ()=> T, dependencies: (WatchSource<unknown> | object)[]){
  const valueRef = ref(callback())
  watch(dependencies, ()=>{
    // @ts-ignore
    valueRef.value = callback()
  }, {immediate: true})
  return valueRef
}
