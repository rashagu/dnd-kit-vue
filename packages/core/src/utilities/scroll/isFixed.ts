import {getWindow} from '@dnd-kit-vue/utilities';

export function isFixed(
  node: HTMLElement,
  computedStyle: CSSStyleDeclaration = getWindow(node).getComputedStyle(node)
): boolean {
  return computedStyle.position === 'fixed';
}
