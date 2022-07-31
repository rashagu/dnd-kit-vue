import {defineComponent, ref, h, Fragment} from 'vue'

interface ExampleProps {
  name?: string
}

export const vuePropsType = {
  name: String
}
const DndContextVue = defineComponent<ExampleProps>((props, {slots}) => {


  return () => (
    <div>
      DndContextVue
    </div>
  )
})

DndContextVue.props = vuePropsType

export default DndContextVue

