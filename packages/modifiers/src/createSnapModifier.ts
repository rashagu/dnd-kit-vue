import type {Modifier} from '@kousum/core';

export function createSnapModifier(gridSize: number): Modifier {
  return ({transform}) => ({
    ...transform,
    x: Math.ceil(transform.x / gridSize) * gridSize,
    y: Math.ceil(transform.y / gridSize) * gridSize,
  });
}
