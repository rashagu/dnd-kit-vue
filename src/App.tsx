import {defineComponent, ref, h, Fragment} from 'vue'
import {defaultCoordinates, DndContext, useSensors} from "../packages/core";
import Draggable from "./test/Draggable";
import {Coordinates} from "../packages/utilities";




interface ExampleProps {
  name?: string
}

export const vuePropsType = {
  name: String
}
const App = defineComponent<ExampleProps>((props, {slots}) => {

  const coordinates = ref<Coordinates>(defaultCoordinates);
  function setCoordinates(val:any) {
    coordinates.value = val
  }
  const handleDragEnd = ({delta}:any) => {
    console.log(delta)
    const {x, y} = coordinates.value
    coordinates.value = {
      x:x + delta.x,
      y:y + delta.y
    }
  }
  const handleDragMove = ({delta}:any) => {
    const {x, y} = coordinates.value
    console.log(delta)
    // coordinates.value = {
    //   x:delta.x,
    //   y:delta.y
    // }
  }
  return ()=>(
    <DndContext
      onDragEnd={handleDragEnd}
    >
      {JSON.stringify(coordinates.value)}
      <div style={{position:'absolute', left: coordinates.value.x + 'px', top: coordinates.value.y + 'px'}}>
        <Draggable/>
      </div>
    </DndContext>
  );
})

App.props = vuePropsType

export default App

