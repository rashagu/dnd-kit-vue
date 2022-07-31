import type {Without} from '@kousum/utilities';

export type SyntheticEventName = keyof Without<
  any,
  'children' | 'dangerouslySetInnerHTML'
>;
