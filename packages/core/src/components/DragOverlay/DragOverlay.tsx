
import {applyModifiers, Modifiers} from '../../modifiers';
import {ActiveDraggableContext} from '../DndContext';
import {useDndContext} from '../../hooks';
import {useInitialValue} from '../../hooks/utilities';

import {
  AnimationManager,
  NullifiedContextProvider,
  PositionedOverlay,
} from './components';
import type {PositionedOverlayProps} from './components';

import {useDropAnimation, useKey} from './hooks';
import type {DropAnimation} from './hooks';
import {inject, ref, useSlots} from "vue";
import {defaultCoordinates} from "../../utilities";
import {Transform} from "@kousum/utilities/src";

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

export const DragOverlay =
  ({
     adjustScale = false,
     dropAnimation: dropAnimationConfig,
     style,
     transition,
     modifiers,
     wrapperElement = 'div',
     className,
     zIndex = 999,
   }: Props) => {
    const {
      activatorEvent,
      active,
      activeNodeRect,
      containerNodeRect,
      draggableNodes,
      droppableContainers,
      dragOverlay,
      over,
      measuringConfiguration,
      scrollableAncestors,
      scrollableAncestorRects,
      windowRect,
    } = useDndContext();

    const transform = inject('DndContext', ref<Transform>({
      ...defaultCoordinates,
      scaleX: 1,
      scaleY: 1,
    }))
    const key = useKey(active?.id);
    const modifiedTransform = applyModifiers(modifiers, {
      activatorEvent,
      active,
      activeNodeRect,
      containerNodeRect,
      draggingNodeRect: dragOverlay.rect,
      over,
      overlayNodeRect: dragOverlay.rect,
      scrollableAncestors,
      scrollableAncestorRects,
      transform:transform.value,
      windowRect,
    });
    const initialRect = useInitialValue(activeNodeRect);
    const dropAnimation = useDropAnimation({
      config: dropAnimationConfig,
      draggableNodes,
      droppableContainers,
      measuringConfiguration,
    });
    // We need to wait for the active node to be measured before connecting the drag overlay ref
    // otherwise collisions can be computed against a mispositioned drag overlay
    const ref_ = initialRect ? dragOverlay.setRef : undefined;

    const slots = useSlots()
    return (
      <NullifiedContextProvider>
        <AnimationManager animation={dropAnimation}>
          {active && key && key.value ? (
            <PositionedOverlay
              key={key.value}
              id={active.id}
              ref={ref_}
              as={wrapperElement}
              activatorEvent={activatorEvent}
              adjustScale={adjustScale}
              className={className}
              transition={transition}
              rect={initialRect.value}
              style={{
                zIndex,
                ...style,
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
;
