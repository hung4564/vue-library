// https://vitepress.dev/guide/custom-theme
import 'uno.css';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { h } from 'vue';
import BooleanDisplay from './components/BooleanDisplay.vue';
import DemoContainer from './components/DemoContainer.vue';
import FunctionInfo from './components/FunctionInfo.vue';
import Note from './components/Note.vue';
import './style.css';
import './styles/demo.css';
export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    });
  },
  enhanceApp({ app, router, siteData }) {
    // ...

    app.component('FunctionInfo', FunctionInfo);
    app.component('DemoContainer', DemoContainer);
    app.component('Note', Note);
    app.component('BooleanDisplay', BooleanDisplay);
  },
} satisfies Theme;
