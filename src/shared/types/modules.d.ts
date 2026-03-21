declare module '*.ttf' {
  const src: string;
  export default src;
}

declare module 'react-sortablejs' {
  import * as React from 'react';

  interface SortableChangeEvent {
    oldIndex?: number;
    newIndex?: number;
  }

  interface ReactSortableProps {
    children?: React.ReactNode;
    options?: Record<string, unknown>;
    onChange?: (order: unknown, sortable: unknown, evt: SortableChangeEvent) => void;
  }

  const ReactSortable: React.ComponentType<ReactSortableProps>;
  export default ReactSortable;
}
