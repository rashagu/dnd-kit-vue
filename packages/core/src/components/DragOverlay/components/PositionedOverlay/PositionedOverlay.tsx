import type {Transform} from '@dnd-kit-vue/utilities';
import {CSS, isKeyboardEvent} from '@dnd-kit-vue/utilities';

import {getRelativeTransformOrigin} from '../../../../utilities';
import type {ClientRect, UniqueIdentifier} from '../../../../types';
import {CSSProperties, defineComponent, h, useSlots} from "vue";

type TransitionGetter = (
  activatorEvent: Event | null
) => CSSProperties['transition'] | undefined;

export interface Props {
  as: any;
  activatorEvent: Event | null;
  adjustScale?: boolean;
  className?: string;
  id: UniqueIdentifier;
  rect: ClientRect | null;
  style?: CSSProperties;
  transition?: string | TransitionGetter;
  transform: Transform;
  setRef: (v:any)=>void
}

const baseStyles: CSSProperties = {
  position: 'fixed',
  touchAction: 'none',
};

const defaultTransition: TransitionGetter = (activatorEvent) => {
  const isKeyboardActivator = isKeyboardEvent(activatorEvent);

  return isKeyboardActivator ? 'transform 250ms ease' : undefined;
};



export const vuePropsType = {
  as: [Object,Function,String],
  activatorEvent: [Object,Function,],
  adjustScale: Boolean,
  className: String,
  id: [String, Number],
  rect: Object,
  style: [String, Object],
  transition: [String, Function],
  transform: Object,
  setRef: [Function, Object]
}
const PositionedOverlay = defineComponent<Props>((props, {}) => {
  const slots = useSlots()

  return () => {
    const {
      as,
      activatorEvent,
      adjustScale,
      className,
      rect,
      style,
      transform,
      transition = defaultTransition,
    } = props

    if (!rect) {
      return null;
    }

    const scaleAdjustedTransform = adjustScale
      ? transform
      : {
        ...transform,
        scaleX: 1,
        scaleY: 1,
      };
    const styles: CSSProperties | undefined = {
      ...baseStyles,
      width: rect.width + 'px',
      height: rect.height + 'px',
      top: rect.top + 'px',
      left: rect.left + 'px',
      transform: CSS.Transform.toString(scaleAdjustedTransform),
      transformOrigin:
        adjustScale && activatorEvent
          ? getRelativeTransformOrigin(
            activatorEvent as MouseEvent | KeyboardEvent | TouchEvent,
            rect
          )
          : undefined,
      transition: typeof transition === 'function'
          ? transition(activatorEvent)
          : transition,
      ...style,
    };


    return h(
      as,
      {
        className,
        style: styles,
        ref: (v)=>{
          props.setRef(v)
        }
      },
      {default: slots.default}
    );
  }
})

PositionedOverlay.props = vuePropsType
PositionedOverlay.name = 'PositionedOverlay'

export {
  PositionedOverlay
}
