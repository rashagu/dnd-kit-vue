
import type {Transform} from '@kousum/utilities';

import {InternalContext, defaultInternalContext} from '../../../../store';
import {ActiveDraggableContext} from '../../../DndContext';
import {useSlots, h} from "vue";


const defaultTransform: Transform = {
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
};

export function NullifiedContextProvider() {
  const slots = useSlots()
  return (
    <InternalContext.Provider value={defaultInternalContext}>
      <ActiveDraggableContext.Provider value={defaultTransform}>
        {slots.default?.()}
      </ActiveDraggableContext.Provider>
    </InternalContext.Provider>
  );
}
