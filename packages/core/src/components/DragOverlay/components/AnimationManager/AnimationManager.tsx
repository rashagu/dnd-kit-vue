
import {useIsomorphicLayoutEffect, usePrevious} from '@dnd-kit-vue/utilities';

import type {UniqueIdentifier} from '../../../../types';
import {cloneVNode, h, ref, useSlots, Fragment} from "vue";

export type Animation = (
  key: UniqueIdentifier,
  node: HTMLElement
) => Promise<void> | void;

export interface Props {
  animation: Animation;
}

export function AnimationManager({animation}: Props) {
  const clonedChildren = ref<any>(null);
  const slots = useSlots()
  const children = slots.default?.()
  const element = ref<HTMLElement | null>(null);
  const previousChildren = usePrevious(children);

  if (!children && !clonedChildren.value && previousChildren) {
    clonedChildren.value = previousChildren
  }

  useIsomorphicLayoutEffect(() => {
    if (!element.value) {
      return;
    }

    const key = clonedChildren.value?.key;
    const id = clonedChildren.value?.props.id;

    if (key == null || id == null) {
      clonedChildren.value = null
      return;
    }

    Promise.resolve(animation(id, element.value)).then(() => {
      clonedChildren.value = null
    });
  });

  return (
    <Fragment>
      {children}
      {clonedChildren.value ? cloneVNode(clonedChildren.value, {ref: element}) : null}
    </Fragment>
  );
}
