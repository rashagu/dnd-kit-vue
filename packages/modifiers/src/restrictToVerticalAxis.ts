import type {Modifier} from '@dnd-kit-vue/core';

export const restrictToVerticalAxis: Modifier = ({transform}) => {
  return {
    ...transform,
    x: 0,
  };
};
