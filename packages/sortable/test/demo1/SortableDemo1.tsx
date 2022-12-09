import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors, DragEndEvent, DragOverlay,
} from '@dnd-kit-vue/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit-vue/sortable';

import SortableItem from './SortableItem';



import {defineComponent, ref, h, Fragment, useSlots, provide, Teleport} from 'vue'

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
          <Teleport to={document.body}>
            <DragOverlay>
              123123
            </DragOverlay>
          </Teleport>
        </DndContext>
      </div>
    );

  }
})

SortableDemo1.props = vuePropsType
SortableDemo1.name = 'SortableDemo1'

export default SortableDemo1

