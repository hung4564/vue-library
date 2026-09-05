import path from 'path';
import { fileURLToPath } from 'url';
import UnoCSS from 'unocss/vite';
import { defineConfig, type DefaultTheme, type UserConfig } from 'vitepress';

import { SharedFunctionsSideBar } from '../../libs/share/shared/metadata';
import { getDraggableSideBar, getMapSideBar } from './metadata';
import { navLabel, packageVersions } from './packages-versions';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDemoDraggable = process.env.VITEPRESS_SITE === 'demo-draggable';

function rewriteDraggableLink(link?: string) {
  if (!link) return link;
  if (link === '/draggable' || link === '/draggable/') return '/';
  return link.replace(/^\/draggable\//, '/');
}

function mapSidebar(items: DefaultTheme.SidebarItem[]): DefaultTheme.SidebarItem[] {
  return items.map((item) => ({
    ...item,
    link: rewriteDraggableLink(item.link),
    items: item.items ? mapSidebar(item.items) : undefined,
  }));
}

const sharedVite = {
  plugins: [UnoCSS()] as any[],
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@hungpvq/shared': path.resolve(__dirname, '../../libs/share/shared/src'),
      '@hungpvq/shared-core': path.resolve(__dirname, '../../libs/share/core/src'),
    },
  },
};

/**
 * Full docs site → https://hung4564.github.io/docs/
 */
const mainDocsConfig: UserConfig = {
  title: 'Doc @hungpvq',
  description: 'Doc @hungpvq',
  srcDir: './pages',
  base: '/docs/',
  outDir: '../deploy/docs',
  lastUpdated: true,
  themeConfig: {
    search: { provider: 'local' },
    nav: [
      { text: 'Home', link: '/' },
      {
        text: navLabel('Shared', '@hungpvq/shared'),
        link: '/shared/',
        activeMatch: '/^shared/',
      },
      {
        text: navLabel('Draggable', '@hungpvq/draggable'),
        link: '/draggable/',
        activeMatch: '/draggable/',
      },
      {
        text: navLabel('Map', '@hungpvq/vue-map-core'),
        link: '/map/',
        activeMatch: '/map/',
      },
    ],
    sidebar: {
      '/shared': SharedFunctionsSideBar,
      '/shared-core': SharedFunctionsSideBar,
      '/draggable': [
        {
          text: 'Demo Vue',
          link: 'https://hung4564.github.io/demo-draggable/vue/',
        },
        {
          text: 'Demo React',
          link: 'https://hung4564.github.io/demo-draggable/react/',
        },
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
  vite: sharedVite,
};

/**
 * GitHub Pages site for https://hung4564.github.io/demo-draggable/
 * - /              → draggable docs
 * - /vue/          → Vue demo (built separately)
 * - /react/        → React demo (built separately)
 *
 * Demo links MUST be absolute (https://...) so VitePress does a full page
 * load instead of client-routing to a missing markdown page (404).
 */
const demoSiteOrigin = 'https://hung4564.github.io';
const demoDraggableConfig: UserConfig = {
  title: `@hungpvq/draggable ${packageVersions['@hungpvq/draggable']}`,
  description: 'Draggable docs and demos',
  srcDir: path.resolve(__dirname, '../../libs/draggable/core/docs'),
  base: '/demo-draggable/',
  outDir: path.resolve(__dirname, '../../deploy/demo-draggable'),
  lastUpdated: true,
  ignoreDeadLinks: [
    /^\/vue/,
    /^\/react/,
    /^https?:\/\/hung4564\.github\.io\/demo-draggable\/(vue|react)/,
  ],
  themeConfig: {
    search: { provider: 'local' },
    nav: [
      {
        text: navLabel('Docs', '@hungpvq/draggable'),
        link: '/',
      },
      {
        text: 'Demo Vue',
        link: `${demoSiteOrigin}/demo-draggable/vue/`,
        target: '_self',
        rel: 'noopener',
      },
      {
        text: 'Demo React',
        link: `${demoSiteOrigin}/demo-draggable/react/`,
        target: '_self',
        rel: 'noopener',
      },
    ],
    sidebar: [
      {
        text: 'Demo Vue',
        link: `${demoSiteOrigin}/demo-draggable/vue/`,
        target: '_self',
        rel: 'noopener',
      },
      {
        text: 'Demo React',
        link: `${demoSiteOrigin}/demo-draggable/react/`,
        target: '_self',
        rel: 'noopener',
      },
      ...mapSidebar(getDraggableSideBar() as DefaultTheme.SidebarItem[]),
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/hung4564/vue-library' },
    ],
  },
  vite: {
    ...sharedVite,
    build: {
      // Script cleans deploy/demo-draggable (keeps .git); demos write /vue /react after.
      emptyOutDir: false,
    },
  },
};

export default defineConfig(
  isDemoDraggable ? demoDraggableConfig : mainDocsConfig,
);
