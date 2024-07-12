import {
  add,
  getEventCoordinates,
  getWindow,
  useLatestValue,
  useUniqueId,
} from '@dnd-kit-vue/utilities';


import {
  Action,
  PublicContext,
  InternalContext,
  type PublicContextDescriptor,
  type InternalContextDescriptor,
  getInitialState,
  reducer,
} from '../../store';
import {DndMonitorContext, useDndMonitorProvider} from '../DndMonitor';
import {
  useAutoScroller,
  useCachedNode,
  useCombineActivators,
  useDragOverlayMeasuring,
  useDroppableMeasuring,
  useInitialRect,
  useRect,
  useRectDelta,
  useRects,
  useScrollableAncestors,
  useScrollOffsets,
  useScrollOffsetsDelta,
  useSensorSetup,
  useWindowRect,
} from '../../hooks/utilities';
import type {AutoScrollOptions, SyntheticListener} from '../../hooks/utilities';
import type {
  Sensor,
  SensorContext,
  SensorDescriptor,
  SensorActivatorFunction,
  SensorInstance,
} from '../../sensors';
import {
  adjustScale,
  type CollisionDetection,
  defaultCoordinates,
  getAdjustedRect,
  getFirstCollision,
  rectIntersection, useReducer,
} from '../../utilities';
import {applyModifiers, type Modifiers} from '../../modifiers';
import type {Active, Over} from '../../store/types';
import type {
  DragStartEvent,
  DragCancelEvent,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  UniqueIdentifier,
} from '../../types';
import {
  Accessibility,
  type Announcements,
  RestoreFocus,
  type ScreenReaderInstructions,
} from '../Accessibility';

import {defaultData, defaultSensors} from './defaults';
import {
  useLayoutShiftScrollCompensation,
  useMeasuringConfiguration,
} from './hooks';
import type {MeasuringConfiguration} from './types';
import DndContextProvider from "../../CreateContextVueVNode/DndContextProvider";
import {
  computed,
  defineComponent,
  ref,
  useSlots,
  watch,
  h,
  type ComponentObjectPropsOptions,
  type PropType
} from 'vue'
import {watchRef} from "../../index";

export interface Props {
  id?: string;
  accessibility?: {
    announcements?: Announcements;
    container?: Element;
    restoreFocus?: boolean;
    screenReaderInstructions?: ScreenReaderInstructions;
  };
  autoScroll?: boolean | AutoScrollOptions;
  cancelDrop?: CancelDrop;
  collisionDetection?: CollisionDetection;
  measuring?: MeasuringConfiguration;
  modifiers?: Modifiers;
  sensors?: SensorDescriptor<any>[];

  onDragStart?(event: DragStartEvent): void;

  onDragMove?(event: DragMoveEvent): void;

  onDragOver?(event: DragOverEvent): void;

  onDragEnd?(event: DragEndEvent): void;

  onDragCancel?(event: DragCancelEvent): void;
}

export interface CancelDropArguments extends DragEndEvent {
}

export type CancelDrop = (
  args: CancelDropArguments
) => boolean | Promise<boolean>;

interface DndEvent extends Event {
  dndKit?: {
    capturedBy: Sensor<any>;
  };
}

export const ActiveDraggableContext = {
  Provider: DndContextProvider
};

enum Status {
  Uninitialized,
  Initializing,
  Initialized,
}

export const vuePropsType: ComponentObjectPropsOptions<Props> = {
  id: String,
  accessibility: Object,
  autoScroll: [Object, Array, Boolean] as PropType<Props['autoScroll']>,
  cancelDrop: [Object, Array,] as PropType<Props['cancelDrop']>,
  collisionDetection: [Object, Array, Function] as PropType<Props['collisionDetection']>,
  measuring: [Object, Array,] as PropType<Props['measuring']>,
  modifiers: [Object, Array,],
  sensors: Object,

  onDragStart: Function as PropType<Props['onDragStart']>,

  onDragMove: Function as PropType<Props['onDragMove']>,

  onDragOver: Function as PropType<Props['onDragOver']>,

  onDragEnd: Function as PropType<Props['onDragEnd']>,

  onDragCancel: Function as PropType<Props['onDragCancel']>,
}
const DndContext = defineComponent<Props>((props_) => {
  const {
    id,
    accessibility,
    autoScroll = true,
    sensors = defaultSensors,
    collisionDetection = rectIntersection,
    measuring,
    modifiers,
    ...props
  } = props_


  const store = useReducer(reducer, undefined, getInitialState);
  const [state, dispatch] = store;
  const [dispatchMonitorEvent, registerMonitorListener] =
    useDndMonitorProvider();
  const status = ref<Status>(Status.Uninitialized);
  const isInitialized = computed(()=>{
    return status.value === Status.Initialized
  });

  const activeId = watchRef(()=>state.value.draggable.active, [()=>state.value.draggable.active])
  const draggableNodes = watchRef(()=>state.value.draggable.nodes, [()=>state.value.draggable.nodes])
  const droppableContainers = watchRef(()=>state.value.droppable.containers, [()=>state.value.droppable.containers])




  const node = watchRef(()=>{
    return activeId.value ? draggableNodes.value.get(activeId.value) : null
  }, [
    activeId,
    draggableNodes,
  ]);
  const activeRects = ref<Active['rect']['current']>({
    initial: null,
    translated: null,
  });

  const active = ref<Active | null>(null);
  function setActive(){
    return state.value.draggable.active != null
      ? {
        id: state.value.draggable.active,
        // It's possible for the active node to unmount while dragging
        data: node.value?.data ?? defaultData,
        rect: activeRects.value,
      } : null
  }
  watch([activeId, node], ()=>{
    active.value = setActive()
  }, {immediate: true})



  const activeRef = ref<UniqueIdentifier | null>(null);
  const activeSensor = ref<SensorInstance | null>(null);
  const activatorEvent = ref<Event | null>(null);
  function setActivatorEvent(val: Event | null) {
    activatorEvent.value = val
  }

  const latestProps = useLatestValue(computed(()=>props));
  const draggableDescribedById = useUniqueId(`DndDescribedBy`, id);
  const enabledDroppableContainers = computed(
    () => state.value.droppable.containers.getEnabled(),
  );
  const measuringConfiguration = useMeasuringConfiguration(measuring);
  const useDroppableMeasuringArg = watchRef(()=>{
    return {
      dragging: isInitialized.value,
      dependencies: [state.value.draggable.translate.x, state.value.draggable.translate.y],
      config: measuringConfiguration.value.droppable,
    }
  }, [
    isInitialized,
    ()=>state.value.draggable.translate.x,
    ()=>state.value.draggable.translate.y,
    ()=>measuringConfiguration.value.droppable,
  ])
  const {
    droppableRects,
    measureDroppableContainers,
    measuringScheduled
  } = useDroppableMeasuring(
    enabledDroppableContainers,
    useDroppableMeasuringArg
  );
  const activeNode = useCachedNode(draggableNodes, activeId);
  const activationCoordinates = watchRef(
    () => {
      return (activatorEvent.value ? getEventCoordinates(activatorEvent.value) : null)
    },
    [
      activatorEvent
    ]
  );
  const autoScrollOptions = getAutoScrollerOptions();
  const initialActiveNodeRect = useInitialRect(
    activeNode,
    measuringConfiguration.value.draggable.measure
  );

  useLayoutShiftScrollCompensation({
    activeNode: activeId.value ? draggableNodes.value.get(activeId.value) : null,
    config: autoScrollOptions.layoutShiftCompensation,
    initialRect: initialActiveNodeRect.value,
    measure: measuringConfiguration.value.draggable.measure,
  });

  const measure = computed(()=>{
    return measuringConfiguration.value.draggable.measure
  })


  const activeNodeRect = useRect(
    activeNode,
    measure,
    initialActiveNodeRect
  )

  const containerNode  = watchRef(()=>{
    return activeNode.value ? activeNode.value.parentElement : null
  }, [
    activeNode,
    ()=>activeNode.value?.parentElement
  ])
  const containerNodeRect = useRect(
    containerNode
  )
  const sensorContext = ref<SensorContext>({
    activatorEvent: null,
    active: null,
    activeNode: activeNode.value,
    collisionRect: null,
    collisions: null,
    droppableRects: droppableRects.value,
    draggableNodes:draggableNodes.value,
    draggingNode: null,
    draggingNodeRect: null,
    droppableContainers: droppableContainers.value,
    over: null,
    scrollableAncestors: [],
    scrollAdjustedTranslate: null,
  });

  const overNode = watchRef(()=>{
    return droppableContainers.value.getNodeFor(
      sensorContext.value.over?.id
    )
  }, [
    droppableContainers,
    ()=>sensorContext.value.over?.id
  ]);

  const dragOverlay = useDragOverlayMeasuring({
    measure: measuringConfiguration.value.dragOverlay.measure,
  });

  // Use the rect of the drag overlay if it is mounted
  const draggingNode = watchRef(()=>{
    return dragOverlay.value.nodeRef.value ?? activeNode.value
  }, [
    dragOverlay.value.nodeRef,
    activeNode,
  ]);

  const draggingNodeRect = watchRef(()=>{
    return isInitialized.value
      ? dragOverlay.value.rect.value ?? activeNodeRect.value
      : null
  }, [
    isInitialized,
    dragOverlay.value.rect,
    activeNodeRect,
  ]);
  const usesDragOverlay = watchRef(()=>Boolean(
    dragOverlay.value.nodeRef.value && dragOverlay.value.rect.value
  ), [
    dragOverlay.value.nodeRef,
    dragOverlay.value.rect,
  ]);


  // The delta between the previous and new position of the draggable node
  // is only relevant when there is no drag overlay
  const useRectDeltaValue = watchRef(()=>{
    return usesDragOverlay.value ? null : activeNodeRect.value
  }, [
    usesDragOverlay
  ])
  const nodeRectDelta = useRectDelta(useRectDeltaValue);
  const useWindowRectOption = watchRef(()=>{
    return draggingNode.value ? getWindow(draggingNode.value) : null
  }, [
    draggingNode
  ])
  // Get the window rect of the dragging node
  const windowRect = useWindowRect(useWindowRectOption);

  // Get scrollable ancestors of the dragging node
  const scrollableAncestors = useScrollableAncestors(
    isInitialized.value ? overNode.value ?? activeNode.value : null
  );
  const scrollableAncestorRects = useRects(scrollableAncestors);


  const applyModifiersArgsRef = ref()

  watch([
    ()=>state.value.draggable.translate,
    ()=>activatorEvent.value,

    ()=>active.value?.id,
    ()=>active.value?.data.value,
    ()=>active.value?.rect,

    ()=>activeNodeRect.value,
    ()=>containerNodeRect.value,
    ()=>draggingNodeRect.value,
    ()=>sensorContext.value.over,
    ()=>dragOverlay.value.rect.value,
    ()=>scrollableAncestors.value,
    ()=>windowRect.value
  ],(value, oldValue, onCleanup)=>{
    applyModifiersArgsRef.value = {
      transform: {
        x: state.value.draggable.translate.x - nodeRectDelta.x,
        y: state.value.draggable.translate.y - nodeRectDelta.y,
        scaleX: 1,
        scaleY: 1,
      },
      activatorEvent: activatorEvent.value,
      active: active.value,
      activeNodeRect: activeNodeRect.value,
      containerNodeRect: containerNodeRect.value,
      draggingNodeRect: draggingNodeRect?.value,
      over: sensorContext.value.over,
      overlayNodeRect: dragOverlay.value.rect.value,
      scrollableAncestors: scrollableAncestors.value,
      scrollableAncestorRects,
      windowRect: windowRect.value,
    }
  }, {immediate:true})
  // Apply modifiers
  const modifiedTranslate = watchRef(()=>{
    return applyModifiers(modifiers, applyModifiersArgsRef.value)
  }, [
    applyModifiersArgsRef
  ]);

  const pointerCoordinates = watchRef(()=>{
    return activationCoordinates.value
      ? add(activationCoordinates.value, state.value.draggable.translate)
      : null
  }, [
    activationCoordinates,
    ()=>state.value.draggable.translate
  ]);

  const scrollOffsets = useScrollOffsets(scrollableAncestors);
  // Represents the scroll delta since dragging was initiated
  const scrollAdjustment = useScrollOffsetsDelta(scrollOffsets);
  // Represents the scroll delta since the last time the active node rect was measured
  const activeNodeScrollDelta = useScrollOffsetsDelta(scrollOffsets, [
    ()=> activeNodeRect.value,
  ]);

  const scrollAdjustedTranslate = watchRef(()=>{
    return add(modifiedTranslate.value, scrollAdjustment.value)
  }, [
    modifiedTranslate,
    scrollAdjustment
  ]);
  const collisionRect = watchRef(()=>{
    return draggingNodeRect?.value
      ? getAdjustedRect(draggingNodeRect.value, modifiedTranslate.value)
      : null
  }, [
    draggingNodeRect,
    modifiedTranslate,
  ]);

  const collisions = watchRef(()=>{
    return active.value && collisionRect.value
      ? collisionDetection({
        active: active.value,
        collisionRect: collisionRect.value,
        droppableRects: droppableRects.value,
        droppableContainers: enabledDroppableContainers.value,
        pointerCoordinates: pointerCoordinates.value,
      })
      : null
  }, [
    active,
    collisionRect,
    droppableRects,
    enabledDroppableContainers,
    pointerCoordinates
  ]);

  const over = ref<Over | null>(null);

  function setOver(val: any) {
    over.value = val
  }

  // When there is no drag overlay used, we need to account for the
  // window scroll delta
  const appliedTranslate = watchRef(()=>{
    return usesDragOverlay.value
      ? modifiedTranslate.value
      : add(modifiedTranslate.value, activeNodeScrollDelta.value)
  }, [
    usesDragOverlay,
    modifiedTranslate,
    activeNodeScrollDelta
  ]);


  const transform = watchRef(()=>{
    return adjustScale(
      appliedTranslate.value,
      over.value?.rect ?? null,
      activeNodeRect.value
    )
  }, [
    appliedTranslate,
    ()=>over.value?.rect,
  ]);

  const instantiateSensor = watchRef(() => (event: any, {sensor: Sensor, options}: SensorDescriptor<any>) => {
    if (activeRef.value == null) {
      return;
    }

    const activeNode = draggableNodes.value.get(activeRef.value);

    if (!activeNode) {
      return;
    }

    const activatorEvent = event;

    const sensorInstance = new Sensor({
      active: activeRef.value,
      activeNode,
      event: activatorEvent,
      options,
      // Sensors need to be instantiated with refs for arguments that change over time
      // otherwise they are frozen in time with the stale arguments
      context: sensorContext.value,
      onStart(initialCoordinates) {
        const id = activeRef.value;

        if (id == null) {
          return;
        }

        const draggableNode = draggableNodes.value.get(id);

        if (!draggableNode) {
          return;
        }

        const {onDragStart} = latestProps.value;
        const event: DragStartEvent = {
          active: {id, data: draggableNode.data, rect: activeRects.value},
        };

        onDragStart?.(event);
        status.value = Status.Initializing
        dispatch({
          type: Action.DragStart,
          initialCoordinates,
          active: id,
        });
        dispatchMonitorEvent({type: 'onDragStart', event});
      },
      onMove(coordinates) {
        dispatch({
          type: Action.DragMove,
          coordinates,
        });
      },
      onEnd: createHandler(Action.DragEnd),
      onCancel: createHandler(Action.DragCancel),
    });

    activeSensor.value = sensorInstance
    setActivatorEvent(event);

    function createHandler(type: Action.DragEnd | Action.DragCancel) {
      return async function handler() {
        const {collisions, over} = sensorContext.value;

        let event: DragEndEvent | null = null;

        if (active.value && scrollAdjustedTranslate.value) {
          const {cancelDrop} = latestProps.value;

          event = {
            activatorEvent,
            active: active.value,
            collisions,
            delta: scrollAdjustedTranslate.value,
            over,
          };

          if (type === Action.DragEnd && typeof cancelDrop === 'function') {
            const shouldCancel = await Promise.resolve(cancelDrop(event));

            if (shouldCancel) {
              type = Action.DragCancel;
            }
          }
        }

        activeRef.value = null;

        dispatch({type});
        status.value = Status.Uninitialized
        setOver(null);
        activeSensor.value = null
        setActivatorEvent(null);

        const eventName =
          type === Action.DragEnd ? 'onDragEnd' : 'onDragCancel';
        if (event) {
          const handler = latestProps.value[eventName];

          handler?.(event);
          dispatchMonitorEvent({type: eventName, event});
        }
      };
    }
  }, [
    activeRef,
    draggableNodes,
    sensorContext,
    latestProps,
    activeRects,
  ])


  const bindActivatorToSensorInstantiator = watchRef(() => (handler: SensorActivatorFunction<any>, sensor: SensorDescriptor<any>): SyntheticListener['handler'] => {
    return (event, active) => {
      const nativeEvent = event as DndEvent;
      const activeDraggableNode = draggableNodes.value.get(active);

      if (
        // Another sensor is already instantiating
        activeRef.value !== null ||
        // No active draggable
        !activeDraggableNode ||
        // Event has already been captured
        nativeEvent.dndKit ||
        nativeEvent.defaultPrevented
      ) {
        return;
      }

      const activationContext = {
        active: activeDraggableNode,
      };
      const shouldActivate = handler(
        event,
        sensor.options,
        activationContext
      );

      if (shouldActivate === true) {
        nativeEvent.dndKit = {
          capturedBy: sensor.sensor,
        };

        activeRef.value = active;
        instantiateSensor.value(event, sensor);
      }
    };
  }, [
    draggableNodes,
    activeRef,
    instantiateSensor,
  ])

  const activators = useCombineActivators(
    sensors,
    bindActivatorToSensorInstantiator
  );

  useSensorSetup(sensors);

  watch([activeNodeRect, status], (value, oldValue, onCleanup) => {
    if (activeNodeRect.value && status.value === Status.Initializing) {
      status.value = Status.Initialized
    }
  }, {deep: true, immediate: true});



  watch([
    ()=>scrollAdjustedTranslate.value.x,
    ()=>scrollAdjustedTranslate.value.y,
  ], () => {
    const {onDragMove} = latestProps.value;
    const {collisions, over} = sensorContext.value;


    if (!state.value.draggable.active || !activatorEvent.value) {
      return;
    }

    const event: DragMoveEvent = {
      active:state.value.draggable.active,
      activatorEvent: activatorEvent.value,
      collisions,
      delta: {
        x: scrollAdjustedTranslate.value.x,
        y: scrollAdjustedTranslate.value.y,
      },
      over,
    };
    onDragMove?.(event);
    dispatchMonitorEvent({type: 'onDragMove', event});
  });




  watch([
    active,
    activeNode,
    collisions,
    collisionRect,
    draggableNodes,
    draggingNode,
    draggingNodeRect,
    droppableRects,
    droppableContainers,
    over,
    scrollableAncestors,
    scrollAdjustedTranslate,
  ], (value, oldValue)=>{
    sensorContext.value = {
      activatorEvent: activatorEvent.value,
      active: active.value,
      activeNode: activeNode.value,
      collisionRect: collisionRect.value,
      collisions: collisions.value,
      droppableRects: droppableRects.value,
      draggableNodes: draggableNodes.value,
      draggingNode: draggingNode.value,
      draggingNodeRect: draggingNodeRect?.value,
      droppableContainers: droppableContainers.value,
      over: over.value,
      scrollableAncestors: scrollableAncestors.value,
      scrollAdjustedTranslate:scrollAdjustedTranslate.value,
    };

    activeRects.value = {
      initial: draggingNodeRect?.value,
      translated: collisionRect.value,
    };
  }, {immediate: true})


  // TODO
  useAutoScroller({
    ...autoScrollOptions,
    delta: state.value.draggable.translate,
    draggingRect: collisionRect.value,
    pointerCoordinates: pointerCoordinates.value,
    scrollableAncestors: scrollableAncestors.value,
    scrollableAncestorRects,
  });



  const slots = useSlots()

  function getAutoScrollerOptions() {
    const activeSensorDisablesAutoscroll =
      activeSensor.value?.autoScrollEnabled === false;
    const autoScrollGloballyDisabled =
      typeof autoScroll === 'object'
        ? autoScroll.enabled === false
        : autoScroll === false;
    const enabled =
      isInitialized.value &&
      !activeSensorDisablesAutoscroll &&
      !autoScrollGloballyDisabled;

    if (typeof autoScroll === 'object') {
      return {
        ...autoScroll,
        enabled,
      };
    }

    return {enabled};
  }


  let overIdCache: any = undefined
  return () => {
    const overId = getFirstCollision(collisions.value, 'id');

    if (overIdCache !== overId){
      const {
        collisions: collisions_,
        droppableContainers,
        scrollAdjustedTranslate,
      } = sensorContext.value;


      if (
        !state.value.draggable.active ||
        activeRef.value == null ||
        !activatorEvent.value ||
        !scrollAdjustedTranslate
      ) {
        // return;
      }else{

        const {onDragOver} = latestProps.value;
        const overContainer = droppableContainers.get(overId);
        const over = overContainer && overContainer.rect
          ? {
            id: overContainer.id,
            rect: overContainer.rect,
            data: overContainer.data,
            disabled: overContainer.disabled,
          }
          : null;

        const event: DragOverEvent = {
          active:state.value.draggable.active,
          activatorEvent:activatorEvent.value,
          collisions: collisions_,
          delta: {
            x: scrollAdjustedTranslate.x,
            y: scrollAdjustedTranslate.y,
          },
          over,
        };

        setOver(over);
        onDragOver?.(event);
        dispatchMonitorEvent({type: 'onDragOver', event});
        overIdCache = overId
      }

    }



    const internalContext: InternalContextDescriptor = {
      activatorEvent: activatorEvent.value,
      activators: activators.value,
      active: active.value,
      activeNodeRect:activeNodeRect.value,
      ariaDescribedById: {
        draggable: draggableDescribedById.value,
      },
      dispatch,
      draggableNodes: draggableNodes.value,
      over: over.value,
      measureDroppableContainers:measureDroppableContainers.value,
    };

    const publicContext: PublicContextDescriptor = {
      active: active.value,
      activeNode: activeNode.value,
      activeNodeRect:activeNodeRect.value,
      activatorEvent: activatorEvent.value,
      collisions: collisions.value,
      containerNodeRect:containerNodeRect.value,
      dragOverlay: dragOverlay.value,
      draggableNodes: draggableNodes.value,
      droppableContainers: droppableContainers.value,
      droppableRects: droppableRects.value,
      over: over.value,
      measureDroppableContainers:measureDroppableContainers.value,
      scrollableAncestors: scrollableAncestors.value,
      scrollableAncestorRects,
      measuringConfiguration: measuringConfiguration.value,
      measuringScheduled: measuringScheduled.value,
      windowRect: windowRect.value,
    }

    return (
      <DndMonitorContext.Provider value={registerMonitorListener}>
        <InternalContext.Provider value={internalContext}>
          <PublicContext.Provider value={publicContext}>
            <ActiveDraggableContext.Provider value={transform.value}>
              {{
                default: slots.default
              }}
            </ActiveDraggableContext.Provider>
          </PublicContext.Provider>
          <RestoreFocus disabled={accessibility?.restoreFocus === false}/>
        </InternalContext.Provider>
        <Accessibility
          {...accessibility}
          hiddenTextDescribedById={draggableDescribedById.value}
        />
      </DndMonitorContext.Provider>
    )
  };
}, {
  props: vuePropsType,
  name: 'DndContext'
})


export {
  DndContext
}
