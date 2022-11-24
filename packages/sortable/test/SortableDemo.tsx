import {defineComponent, ref, h, Fragment} from 'vue'
import {DndContext} from "@kousum/core";
import {SortableContext} from "../src";

interface SortableDemoProps {
  name?: string
}

export const vuePropsType = {
  name: String
}
const SortableDemo = defineComponent<SortableDemoProps>((props, {slots}) => {


  const items = ref([1, 2, 3]);

  return ()=> (
    <DndContext>
      <SortableContext items={items.value}>
        {/* ... */}
      </SortableContext>
    </DndContext>
  );
})

SortableDemo.props = vuePropsType

export default SortableDemo

