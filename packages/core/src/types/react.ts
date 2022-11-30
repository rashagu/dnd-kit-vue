import type {Without} from '@dnd-kit-vue/utilities';

export type SyntheticEventName = keyof Without<
  any,
  'children' | 'dangerouslySetInnerHTML'
>;
