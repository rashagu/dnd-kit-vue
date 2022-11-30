import type {UniqueIdentifier} from '@dnd-kit-vue/core';

export type SortableData = {
  sortable: {
    containerId: UniqueIdentifier;
    items: UniqueIdentifier[];
    index: number;
  };
};
