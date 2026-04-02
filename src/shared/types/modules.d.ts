declare module '*.ttf' {
  const src: string;
  export default src;
}

declare module '*.ttc' {
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
    className?: string;
    options?: Record<string, unknown>;
    onChange?: (order: unknown, sortable: unknown, evt: SortableChangeEvent) => void;
    style?: React.CSSProperties;
    tag?: keyof JSX.IntrinsicElements | React.ComponentType<unknown>;
  }

  const ReactSortable: React.ComponentType<ReactSortableProps>;
  export default ReactSortable;
}
