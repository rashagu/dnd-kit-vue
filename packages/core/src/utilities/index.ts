import {type Ref, ref} from "vue";

export {
  closestCenter,
  closestCorners,
  rectIntersection,
  getFirstCollision,
  pointerWithin,
} from './algorithms';
export type {
  Collision,
  CollisionDescriptor,
  CollisionDetection,
} from './algorithms';

export {
  defaultCoordinates,
  distanceBetween,
  getRelativeTransformOrigin,
} from './coordinates';

export {
  Rect,
  adjustScale,
  getAdjustedRect,
  getClientRect,
  getTransformAgnosticClientRect,
  getWindowClientRect,
  getRectDelta,
} from './rect';

export {noop} from './other';

export {
  getFirstScrollableAncestor,
  getScrollableAncestors,
  getScrollableElement,
  getScrollCoordinates,
  getScrollDirectionAndSpeed,
  getScrollElementRect,
  getScrollOffsets,
  getScrollPosition,
  isDocumentScrollingElement,
} from './scroll';



export function useReducer(reducer:any,initialState:any, init?:(value?:any)=>any):[Ref<any>, (action?:any)=>void] {
  const state = ref(initialState);
  if (init){
    state.value = init()
  }

  let dispatch = (action?:any) => {
    state.value = reducer(state.value,action)
  }

  return [state,dispatch]
}
