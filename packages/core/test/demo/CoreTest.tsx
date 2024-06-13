import {defineComponent, ref, h, Fragment} from 'vue'
import {defaultCoordinates, DndContext, useSensors} from "@dnd-kit-vue/core";
import Draggable from "./Draggable";
import type {Coordinates} from "@dnd-kit-vue/utilities";




interface ExampleProps {
  name?: string
}

export const vuePropsType = {
  name: String
}
const CoreTest = defineComponent<ExampleProps>((props, {slots}) => {

  const coordinates = ref<Coordinates>(defaultCoordinates);
  function setCoordinates(val:any) {
    coordinates.value = val
  }
  const handleDragEnd = ({delta}:any) => {
    const {x, y} = coordinates.value
    coordinates.value = {
      x:x + delta.x,
      y:y + delta.y
    }
  }
  const handleDragMove = ({delta}:any) => {
    const {x, y} = coordinates.value
    // coordinates.value = {
    //   x:delta.x,
    //   y:delta.y
    // }
  }

  return ()=>(
    <DndContext
      onDragEnd={handleDragEnd}
    >
      <div style={{position:'absolute', left: coordinates.value.x + 'px', top: coordinates.value.y + 'px'}}>
        <Draggable/>
      </div>
    </DndContext>
  );
})

CoreTest.props = vuePropsType
CoreTest.name = 'CoreTest'

export default CoreTest

