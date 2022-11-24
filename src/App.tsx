import {defineComponent, ref, h, Fragment} from 'vue'
import SortableDemo from "../packages/sortable/test/SortableDemo";

interface CoreTestProps {
  name?: string
}

export const vuePropsType = {
  name: String
}
const CoreTest = defineComponent<CoreTestProps>((props, {slots}) => {


  return () => (
    <div>
      <SortableDemo />
    </div>
  )
})

CoreTest.props = vuePropsType

export default CoreTest

