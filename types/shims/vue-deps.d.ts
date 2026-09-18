/**
 * Ambient typings for Vue deps that ship without usable package.json "exports" types
 * (moduleResolution "bundler" / vue-tsc path-follow).
 */
declare module 'vue-draggable-resizable' {
  import type { DefineComponent } from 'vue';
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
  import type { Directive } from 'vue';
  const vueResizeDirective: Directive;
  export default vueResizeDirective;
}

declare module '@jamescoyle/vue-icon' {
  import type { DefineComponent } from 'vue';
  const SvgIcon: DefineComponent<object, object, unknown>;
  export default SvgIcon;
}

declare module 'vue-material-design-icons/*' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
