
import {CSS, isKeyboardEvent} from '@kousum/utilities';

import type {Transform} from '@kousum/utilities';

import {getRelativeTransformOrigin} from '../../../../utilities';
import type {ClientRect, UniqueIdentifier} from '../../../../types';
import {CSSProperties, h, useSlots} from "vue";

type TransitionGetter = (
  activatorEvent: Event | null
) => CSSProperties | undefined;

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
}

const baseStyles: CSSProperties = {
  position: 'fixed',
  touchAction: 'none',
};

const defaultTransition: TransitionGetter = (activatorEvent) => {
  const isKeyboardActivator = isKeyboardEvent(activatorEvent);

  return isKeyboardActivator ? 'transform 250ms ease' : undefined;
};

export const PositionedOverlay = (
  {
    as,
    activatorEvent,
    adjustScale,
    className,
    rect,
    style,
    transform,
    transition = defaultTransition,
  }:Props
) => {
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
    width: rect.width,
    height: rect.height,
    top: rect.top,
    left: rect.left,
    transform: CSS.Transform.toString(scaleAdjustedTransform),
    transformOrigin:
      adjustScale && activatorEvent
        ? getRelativeTransformOrigin(
          activatorEvent as MouseEvent | KeyboardEvent | TouchEvent,
          rect
        )
        : undefined,
    transition:
      typeof transition === 'function'
        ? transition(activatorEvent)
        : transition,
    ...style,
  };

  return h(
    as,
    {
      className,
      style: styles,
    },
    useSlots().default?.()
  );
}