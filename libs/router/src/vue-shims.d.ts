declare module '*.vue' {
  import { defineComponent } from 'vue';
  const component: ReturnType<typeof defineComponent>;
  export default component;
}
import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    middleware: string[];
    title: string;
  }
}
