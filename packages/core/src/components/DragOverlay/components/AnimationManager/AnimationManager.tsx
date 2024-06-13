import type { UniqueIdentifier } from '../../../../types'
import {
  cloneVNode,
  type ComponentObjectPropsOptions,
  defineComponent,
  Fragment, type PropType,
  ref,
  shallowRef,
  useSlots,
  watch
} from 'vue'

export type Animation = (
  key: UniqueIdentifier,
  node: HTMLElement
) => Promise<void> | void;

export interface Props {
  animation: Animation;
  children: any
}

export const vuePropsType: ComponentObjectPropsOptions<Props> = {
  animation: Function as PropType<Props['animation']>,
  children: [Object, Function] as PropType<Props['animation']>,
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
    if (!element.value) {
      return;
    }

    const key = clonedChildren.value?.key;
    const id = clonedChildren.value?.props.id;

    if (key == null || id == null) {
      clonedChildren.value = null
      return;
    }

    Promise.resolve(props.animation(
      id,
      // @ts-ignore
      element.value.$el?element.value.$el:element.value
    )).then(() => {
      clonedChildren.value = null
    });
  }, {immediate: true});

  return () => {

    if (!props.children && !clonedChildren.value && previousChildren.value) {
      clonedChildren.value = previousChildren.value
      previousChildren.value = props.children
    }

    // console.log(clonedChildren.value?.el,props.animation)

    return (
      <Fragment>
        {props.children}
        {clonedChildren.value ? cloneVNode(clonedChildren.value, {ref: element}) : null}
      </Fragment>
    );
  }
}, {
  props: vuePropsType,
  name: 'AnimationManager'
})


export {
  AnimationManager
}

