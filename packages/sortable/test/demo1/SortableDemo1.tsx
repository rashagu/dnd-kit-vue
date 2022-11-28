import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors, DragEndEvent,
} from '@kousum/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@kousum/sortable';

import SortableItem from './SortableItem';



import {defineComponent, ref, h, Fragment, useSlots, provide} from 'vue'

interface Demo1Props {
  name?: string
}

export const vuePropsType = {
  name: String
}
const SortableDemo1 = defineComponent<Demo1Props>((props, {}) => {

  const slots = useSlots()

  const items = ref([1, 2, 3]);
  function setItems(val: number[]) {
    items.value = val
  }
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );


  function handleDragEnd(event:DragEndEvent) {
    // console.log(event)
    const {active, over} = event;
    console.debug({active, over})

    if (active.id !== over?.id) {
      const oldIndex = items.value.indexOf(+active.id);
      const newIndex = items.value.indexOf(+over!.id);
      setItems(arrayMove(items.value, oldIndex, newIndex));
    }
  }
  provide('aa', 'aa')
  return () => {


    return (
      <div style={{width: '500px'}}>
        <DndContext
          sensors={sensors.value}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.value}
            strategy={verticalListSortingStrategy}
          >
            {items.value.map(id => <SortableItem key={id} id={id} />)}
          </SortableContext>
        </DndContext>
      </div>
    );

  }
})

SortableDemo1.props = vuePropsType
SortableDemo1.name = 'SortableDemo1'

export default SortableDemo1

