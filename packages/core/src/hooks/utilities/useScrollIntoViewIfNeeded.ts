import {useIsomorphicLayoutEffect} from '@kousum/utilities';

import {scrollIntoViewIfNeeded} from '../../utilities/scroll';

export function useScrollIntoViewIfNeeded(
  element: HTMLElement | null | undefined
) {
  useIsomorphicLayoutEffect(() => {
    scrollIntoViewIfNeeded(element);
  });
}
