import {useIsomorphicLayoutEffect} from '@dnd-kit-vue/utilities';

import {scrollIntoViewIfNeeded} from '../../utilities/scroll';

export function useScrollIntoViewIfNeeded(
  element: HTMLElement | null | undefined
) {
  useIsomorphicLayoutEffect(() => {
    scrollIntoViewIfNeeded(element);
  });
}
