import {defineComponent, ref, h, Fragment} from 'vue'
import SortableDemo from "../packages/sortable/test/SortableDemo";
import CoreTest from "./CoreTest";
import SortableDemo1 from "../packages/sortable/test/demo1/SortableDemo1";

interface CoreTestProps {
  name?: string
}

export const vuePropsType = {
  name: String
}
const App = defineComponent<CoreTestProps>((props, {slots}) => {


  return () => (
    <div>
      <SortableDemo1 />
      <CoreTest />
      {/*<SortableDemo />*/}
    </div>
  )
})

App.props = vuePropsType
App.name = 'App'
export default App

