declare module '*.vue' {
  import { defineComponent } from 'vue';
  const component: ReturnType<typeof defineComponent>;
  export default component;
}
declare module '@jamescoyle/vue-icon';
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
