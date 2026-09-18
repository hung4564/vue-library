declare module '*.vue' {
  import { defineComponent } from 'vue';
  const component: ReturnType<typeof defineComponent>;
  export default component;
}

declare module 'vue-draggable-resizable' {
  import { DefineComponent } from 'vue';
  const VueDraggableResizable: DefineComponent<{
    w?: number;
    h?: number;
    x?: number;
    y?: number;
    z?: number | string;
    draggable?: boolean;
    resizable?: boolean;
    parent?: boolean;
    dragHandle?: string;
    dragCancel?: string;
    axis?: string;
    grid?: [number, number];
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    lockAspectRatio?: boolean;
  }>;
  export default VueDraggableResizable;
}

declare module 'vue-resize-directive' {
  import { defineComponent } from 'vue';
  const component: ReturnType<typeof defineComponent>;
  export default component;
}
