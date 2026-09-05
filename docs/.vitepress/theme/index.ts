// https://vitepress.dev/guide/custom-theme
import 'uno.css';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { h } from 'vue';
import BooleanDisplay from './components/BooleanDisplay.vue';
import DemoContainer from './components/DemoContainer.vue';
import DocPackageVersions from './components/DocPackageVersions.vue';
import FunctionInfo from './components/FunctionInfo.vue';
import Note from './components/Note.vue';
import './style.css';
import './styles/demo.css';
export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      'doc-before': () => h(DocPackageVersions),
    });
  },
  enhanceApp({ app }) {
    app.component('FunctionInfo', FunctionInfo);
    app.component('DemoContainer', DemoContainer);
    app.component('DocPackageVersions', DocPackageVersions);
    app.component('Note', Note);
    app.component('BooleanDisplay', BooleanDisplay);
  },
} satisfies Theme;
