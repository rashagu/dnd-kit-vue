import {defineComponent, ref, h, Fragment} from 'vue'
import CoreTest from "../packages/core/test/demo/CoreTest";
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
      {/*<CoreTest />*/}
      {/*<SortableDemo />*/}
    </div>
  )
})

App.props = vuePropsType
App.name = 'App'
export default App

