import { MapSimple } from '@hungpvq/shared-map';

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
declare module '@jamescoyle/vue-icon' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

interface Document {
  exitFullscreen: any;
  mozCancelFullScreen: any;
  webkitExitFullscreen: any;
  fullscreenElement: any;
  mozFullScreenElement: any;
  webkitFullscreenElement: any;
  msExitFullscreen: any;
}

interface HTMLElement {
  webkitRequestFullscreen: any;
  msRequestFullscreen: any;
}

declare module '@mapbox/mapbox-gl-sync-move' {
  const syncMove: (maps: MapSimple[]) => () => void;
  export default syncMove;
}
declare global {
  interface Window {
    $_hungpv_drag: any;
    $_hungpv_map_queue: any;
  }
}
