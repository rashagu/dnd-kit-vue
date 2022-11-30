import type {ClientRect} from '@dnd-kit-vue/core';
import type {Transform} from '@dnd-kit-vue/utilities';

export type SortingStrategy = (args: {
  activeNodeRect: ClientRect | null;
  activeIndex: number;
  index: number;
  rects: ClientRect[];
  overIndex: number;
}) => Transform | null;
