
import {applyModifiers, Modifiers} from '../../modifiers';
import {ActiveDraggableContext} from '../DndContext';
import {useDndContext as usePublicContext} from '../../hooks';
import {useInitialValue} from '../../hooks/utilities';

import {
  AnimationManager,
  NullifiedContextProvider,
  PositionedOverlay,
} from './components';
import type {PositionedOverlayProps} from './components';

import {useDropAnimation, useKey} from './hooks';
import type {DropAnimation} from './hooks';
import {inject, ref, useSlots, h, defineComponent} from "vue";
import {defaultCoordinates} from "../../utilities";
import {Transform} from "@dnd-kit-vue/utilities/src";
import {useDndContext} from "../../CreateContextVueVNode/DndContextConsumer";
import {ClientRect} from "../../types";

export interface Props
  extends Pick<
    PositionedOverlayProps,
    'adjustScale' | 'className' | 'style' | 'transition'
  > {
  dropAnimation?: DropAnimation | null | undefined;
  modifiers?: Modifiers;
  wrapperElement?: keyof JSX.IntrinsicElements;
  zIndex?: number;
}

export const vuePropsType = {
  adjustScale: {
    type: Boolean,
    default: false
  },
  dropAnimation: {
    type: Object,
  },
  style:{
    type: [Object]
  },
  transition:{
    type: [String, Object]
  },
  modifiers:{
    type: Array
  },
  wrapperElement:{
    type: String,
    default: 'div'
  },
  className:{
    type: String,
  },
  zIndex:{
    type: Number,
    default: 999
  },
}

const DragOverlay = defineComponent<Props>((props, {}) => {

  const slots = useSlots()

  const context = usePublicContext();

  const transform = useDndContext()
  const key = useKey(context.value.active?.id);
  // TODO
  const initialRect = useInitialValue(context.value.activeNodeRect);

  return () => {
    const modifiedTransform = applyModifiers(props.modifiers, {
      activatorEvent: context.value.activatorEvent,
      active: context.value.active,
      activeNodeRect: context.value.activeNodeRect,
      containerNodeRect: context.value.containerNodeRect,
      draggingNodeRect: context.value.dragOverlay.rect,
      over: context.value.over,
      overlayNodeRect: context.value.dragOverlay.rect,
      scrollableAncestors: context.value.scrollableAncestors,
      scrollableAncestorRects: context.value.scrollableAncestorRects,
      transform:transform.value,
      windowRect: context.value.windowRect,
    });

    // TODO
    const dropAnimation = useDropAnimation({
      config: props.dropAnimation,
      draggableNodes: context.value.draggableNodes,
      droppableContainers: context.value.droppableContainers,
      measuringConfiguration: context.value.measuringConfiguration,
    });

    // We need to wait for the active node to be measured before connecting the drag overlay ref
    // otherwise collisions can be computed against a mispositioned drag overlay
    const ref_ = initialRect.value ? context.value.dragOverlay.setRef : undefined;


    return (
      <NullifiedContextProvider>
        <AnimationManager animation={dropAnimation}>
          {context.value.active && key && key.value ? (
            <PositionedOverlay
              key={key.value}
              id={context.value.active.id}
              ref={ref_ as any}
              as={props.wrapperElement}
              activatorEvent={context.value.activatorEvent}
              adjustScale={props.adjustScale}
              className={props.className}
              transition={props.transition}
              rect={initialRect.value as ClientRect}
              style={{
                zIndex:props.zIndex,
                ...props.style,
              }}
              transform={modifiedTransform}
            >
              {slots.default?.()}
            </PositionedOverlay>
          ) : null}
        </AnimationManager>
      </NullifiedContextProvider>
    );
  }
})

DragOverlay.props = vuePropsType
DragOverlay.name = 'DragOverlay'

export {DragOverlay}

