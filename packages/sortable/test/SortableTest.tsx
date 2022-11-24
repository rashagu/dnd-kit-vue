import {DndContext} from "@kousum/core";
import {SortableContext} from "../src";
import {ref} from "vue";

function SortableTest() {
  const items = ref([1, 2, 3]);

  return (
    <DndContext>
      <SortableContext items={items.value}>
        {/* ... */}
      </SortableContext>
    </DndContext>
  );
}
