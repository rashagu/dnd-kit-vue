
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
import {inject, ref, useSlots, h, defineComponent, computed, ExtractPropTypes, watch} from "vue";
import {defaultCoordinates} from "../../utilities";
import {Transform} from "@dnd-kit-vue/utilities/src";
import {useDndContext} from "../../CreateContextVueVNode/DndContextConsumer";


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
  const id = computed(()=>context.value.active?.id)
  const key = useKey(id);
  const activeNodeRect = computed(()=>{
    return context.value.activeNodeRect
  })
  // TODO
  const initialRect = useInitialValue(activeNodeRect);

  // const positionedOverlayRef = ref()
  // TODO
  const dropAnimation = ref()
  watch([
    ()=>props.dropAnimation,
    ()=>context.value.draggableNodes,
    ()=>context.value.droppableContainers,
    ()=>context.value.measuringConfiguration
  ], (value, oldValue, onCleanup)=>{
    dropAnimation.value = useDropAnimation({
      config: props.dropAnimation,
      draggableNodes: context.value.draggableNodes,
      droppableContainers: context.value.droppableContainers,
      measuringConfiguration: context.value.measuringConfiguration,
    })
  }, {immediate: true})


  const modifiedTransform = ref()
  watch([
    ()=>context.value.activatorEvent,

    ()=>context.value.active?.id,
    ()=>context.value.active?.data.value,
    ()=>context.value.active?.rect,

    ()=>context.value.activeNodeRect,
    ()=>context.value.containerNodeRect,
    ()=>context.value.dragOverlay.rect,

    ()=>context.value.over?.id,
    ()=>context.value.over?.rect,
    ()=>context.value.over?.data.value,
    ()=>context.value.over?.data.disabled,

    ()=>context.value.dragOverlay.rect,
    ()=>context.value.scrollableAncestors,
    ()=>context.value.scrollableAncestorRects,
    ()=>transform.value,
    ()=>context.value.windowRect,
  ], (value, oldValue, onCleanup)=>{
    modifiedTransform.value = applyModifiers(props.modifiers, {
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

  }, {immediate: true})

  const showChildren = computed(()=>{
    return !!(context.value.active && key && key.value)
  })
  return () => {



    // We need to wait for the active node to be measured before connecting the drag overlay ref
    // otherwise collisions can be computed against a mispositioned drag overlay
    const ref_ = initialRect.value ? context.value.dragOverlay.setRef : undefined;

    // ref_?.(positionedOverlayRef.value?.$el)

    return (
      <NullifiedContextProvider>
        <AnimationManager
          animation={dropAnimation.value}
          children={ showChildren.value ? (
            <PositionedOverlay
              key={key.value}
              id={context.value.active!.id}
              setRef={ref_ as any}
              as={props.wrapperElement}
              activatorEvent={context.value.activatorEvent}
              adjustScale={props.adjustScale}
              className={props.className}
              transition={props.transition}
              rect={initialRect.value as any}
              style={{
                zIndex:props.zIndex,
                ...props.style,
              }}
              transform={modifiedTransform.value}
            >
              {{
                default: slots.default
              }}
            </PositionedOverlay>
          ) : null}
        >

        </AnimationManager>
      </NullifiedContextProvider>
    );
  }
})

DragOverlay.props = vuePropsType
DragOverlay.name = 'DragOverlay'

export {DragOverlay}

