declare module '*.vue' {
  import { defineComponent } from 'vue';
  const component: ReturnType<typeof defineComponent>;
  export default component;
}
declare module 'togpx' {
  import type { FeatureCollection } from 'geojson';
  function togpx(fc: FeatureCollection, options?: Record<string, any>): string;
  export default togpx;
}

declare module 'tokml';
