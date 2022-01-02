import {defineComponent, ref, h, onMounted, watch,} from 'vue'
export interface ExampleProps {
  name?: string
}

export const VuePropsType = {
  name: String
}

const App = defineComponent<ExampleProps>((props, {slots}) => {

  const a = ref(null)
  watch(a, ()=>{
    console.log(a)
  })
  return () => (
    <div>
      <div ref={a}>123</div>
    </div>
  )
})


App.props = VuePropsType

export default App
