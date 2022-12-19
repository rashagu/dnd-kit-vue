
import {usePrevious} from '@dnd-kit-vue/utilities';

import type {UniqueIdentifier} from '../../../../types';
import {
  cloneVNode,
  h,
  ref,
  useSlots,
  Fragment,
  onMounted,
  watch,
  defineComponent,
  ExtractPropTypes,
  withMemo, shallowRef
} from "vue";

export type Animation = (
  key: UniqueIdentifier,
  node: HTMLElement
) => Promise<void> | void;

export interface Props {
  animation: Animation;
  children: any
}

export const vuePropsType = {
  animation: Function,
  children: [Object, Function]
}
const AnimationManager = defineComponent<Props>((props, {}) => {

  const slots = useSlots()
  const clonedChildren = ref<any>(null);
  const element = ref<HTMLElement | null>(null);
  const previousChildren = shallowRef(props.children);
  watch(()=>props.children, (value, oldValue, onCleanup)=>{
    previousChildren.value = oldValue
  })
  watch([()=>props.animation, ()=>clonedChildren.value, ()=>element.value], () => {
    console.log(element.value)
    if (!element.value) {
      return;
    }

    const key = clonedChildren.value?.key;
    const id = clonedChildren.value?.props.id;

    if (key == null || id == null) {
      clonedChildren.value = null
      return;
    }

    Promise.resolve(props.animation(id, element.value)).then(() => {
      clonedChildren.value = null
    });
  }, {immediate: true});

  return () => {

    if (!props.children && !clonedChildren.value && previousChildren.value) {
      clonedChildren.value = previousChildren.value
      previousChildren.value = props.children
    }


    return (
      <Fragment>
        {props.children}
        {clonedChildren.value ? cloneVNode(clonedChildren.value, {ref: element}) : null}
      </Fragment>
    );
  }
})

AnimationManager.props = vuePropsType
AnimationManager.name = 'AnimationManager'

export {
  AnimationManager
}

