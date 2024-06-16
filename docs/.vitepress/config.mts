import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vitepress';

import { getDraggableSideBar } from '../../libs/draggable/metadata';
import { getMapSideBar } from '../../libs/map-core/metadata';
import { SharedFunctionsSideBar } from '../../libs/shared/metadata';
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Doc @hungpv97',
  description: 'Doc @hungpv97',
  srcDir: '../',
  lastUpdated: true,
  themeConfig: {
    search: {
      provider: 'local',
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Shared', link: '/shared/' },
      { text: 'Draggable', link: '/draggable/' },
      { text: 'Map', link: '/map/' },
    ],

    sidebar: {
      '/shared': SharedFunctionsSideBar,
      '/shared-core': SharedFunctionsSideBar,
      '/draggable': getDraggableSideBar(),
      '/map': [...getMapSideBar()],
    },

    // socialLinks: [
    //   { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
    // ],
  },
  rewrites: {
    'docs/pages/index.md': 'index.md',
    'docs/pages/:pkg.md': ':pkg/index.md',
    'libs/shared/src/:pkg/index.md': 'shared/:pkg/index.md',
    'libs/shared-core/src/:pkg/index.md': 'shared-core/:pkg/index.md',
    'libs/shared-file/src/:pkg/index.md': 'shared-file/:pkg/index.md',
    'libs/draggable/README.md': 'draggable/index.md',
    'libs/draggable/docs/:pkg.md': 'draggable/:pkg/index.md',
    'libs/map-core/README.md': 'map/index.md',
    'libs/map-core/src/modules/index.md': 'map/modules/index.md',
    'libs/map-core/src/modules/:pkg/index.md': 'map/modules/:pkg/index.md',
    'libs/map-core/src/store/index.md': 'map/store/index.md',
    'libs/map-core/src/store/:pkg/index.md': 'map/store/:pkg/index.md',
    'libs/map-core/src/extra/:pkg/index.md': 'map/extra/:pkg/index.md',
    'libs/map-basemap/README.md': 'map/basemap/index.md',
    'libs/map-measurement/README.md': 'map/measurement/index.md',
    'libs/map-print/README.md': 'map/print/index.md',
    'libs/map-draw/README.md': 'map/draw/index.md',
    'libs/map-layer/README.md': 'map/layer/index.md',
  },
  vite: {
    plugins: [UnoCSS()] as any[],
    resolve: {
      alias: {
        '@hungpv97/metadata': 'libs/metadata/src/index.ts',
      },
    },
  },
});
