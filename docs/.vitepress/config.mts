import path from 'path';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vitepress';

import { SharedFunctionsSideBar } from '../../libs/share/shared/metadata';
import { getDraggableSideBar, getMapSideBar } from './metadata';
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Doc @hungpvq',
  description: 'Doc @hungpvq',
  srcDir: './pages',
  base: '/docs/',
  outDir: '../deploy/docs',
  lastUpdated: true,
  themeConfig: {
    search: {
      provider: 'local',
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Shared', link: '/shared/', activeMatch: '/^shared/' },
      { text: 'Draggable', link: '/draggable/', activeMatch: '/draggable/' },
      { text: 'Map', link: '/map/', activeMatch: '/map/' },
    ],

    sidebar: {
      '/shared': SharedFunctionsSideBar,
      '/shared-core': SharedFunctionsSideBar,
      '/draggable': [
        { text: 'Demo', link: 'https://hung4564.github.io/demo-draggable' },
        ...getDraggableSideBar(),
      ],
      '/map': [
        { text: 'Demo', link: 'https://hung4564.github.io/demo-map' },
        ...getMapSideBar(),
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/hung4564/vue-library' },
    ],
  },
  rewrites: {
    'share/shared/:pkg/index.md': 'shared/:pkg/index.md',
    'share/core/:pkg/index.md': 'shared-core/:pkg/index.md',
    'share/file/:pkg/index.md': 'shared-file/:pkg/index.md',
  },
  vite: {
    plugins: [UnoCSS()] as any[],
    resolve: {
      preserveSymlinks: true,
      alias: {
        '@hungpvq/shared': path.resolve(
          __dirname,
          '../../libs/share/shared/src',
        ),
        '@hungpvq/shared-core': path.resolve(
          __dirname,
          '../../libs/share/core/src',
        ),
      },
    },
  },
});
