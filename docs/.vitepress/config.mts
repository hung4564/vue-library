import path from 'path';
import { fileURLToPath } from 'url';
import UnoCSS from 'unocss/vite';
import { defineConfig, type DefaultTheme, type UserConfig } from 'vitepress';

import { SharedFunctionsSideBar } from '../../libs/share/shared/metadata';
import { getDraggableSideBar, getMapSideBar } from './metadata';
import { navLabel, packageVersions } from './packages-versions';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDemoDraggable = process.env.VITEPRESS_SITE === 'demo-draggable';
const isDemoMap = process.env.VITEPRESS_SITE === 'demo-map';
const demoSiteOrigin = 'https://hung4564.github.io';

function rewritePrefixLink(prefix: string, link?: string) {
  if (!link) return link;
  if (link === `/${prefix}` || link === `/${prefix}/`) return '/';
  return link.replace(new RegExp(`^/${prefix}/`), '/');
}

function rewriteSidebar(
  items: DefaultTheme.SidebarItem[],
  rewrite: (link?: string) => string | undefined,
): DefaultTheme.SidebarItem[] {
  return items.map((item) => ({
    ...item,
    link: rewrite(item.link),
    items: item.items ? rewriteSidebar(item.items, rewrite) : undefined,
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
          link: `${demoSiteOrigin}/demo-draggable/vue/`,
        },
        {
          text: 'Demo React',
          link: `${demoSiteOrigin}/demo-draggable/react/`,
        },
        ...getDraggableSideBar(),
      ],
      '/map': [
        {
          text: 'Demo Vue',
          link: `${demoSiteOrigin}/demo-map/vue/`,
        },
        {
          text: 'Demo React',
          link: `${demoSiteOrigin}/demo-map/react/`,
        },
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
      ...rewriteSidebar(
        getDraggableSideBar() as DefaultTheme.SidebarItem[],
        (link) => rewritePrefixLink('draggable', link),
      ),
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

/**
 * GitHub Pages site for https://hung4564.github.io/demo-map/
 * - /              → map docs
 * - /vue/          → Vue demo (built separately)
 * - /react/        → React demo (built separately)
 */
const demoMapConfig: UserConfig = {
  title: `@hungpvq/vue-map-core ${packageVersions['@hungpvq/vue-map-core']}`,
  description: 'Map docs and demos',
  srcDir: path.resolve(__dirname, '../../libs/map-core/core/docs'),
  base: '/demo-map/',
  outDir: path.resolve(__dirname, '../../deploy/demo-map'),
  lastUpdated: true,
  ignoreDeadLinks: [
    /^\/vue/,
    /^\/react/,
    // Markdown uses absolute /map/... paths for the main docs site;
    // they are rewritten to /... at render time below.
    /^\/map(\/|$)/,
    /^https?:\/\/hung4564\.github\.io\/demo-map\/(vue|react)/,
  ],
  markdown: {
    config(md) {
      const defaultLinkOpen =
        md.renderer.rules.link_open ||
        ((tokens, idx, options, _env, self) =>
          self.renderToken(tokens, idx, options));

      md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
        const hrefIndex = tokens[idx].attrIndex('href');
        if (hrefIndex >= 0) {
          const href = tokens[idx].attrs![hrefIndex][1];
          if (href === '/map' || href === '/map/') {
            tokens[idx].attrs![hrefIndex][1] = '/';
          } else if (href.startsWith('/map/')) {
            tokens[idx].attrs![hrefIndex][1] = href.slice('/map'.length);
          }
        }
        return defaultLinkOpen(tokens, idx, options, env, self);
      };
    },
  },
  themeConfig: {
    search: { provider: 'local' },
    nav: [
      {
        text: navLabel('Docs', '@hungpvq/vue-map-core'),
        link: '/',
      },
      {
        text: 'Demo Vue',
        link: `${demoSiteOrigin}/demo-map/vue/`,
        target: '_self',
        rel: 'noopener',
      },
      {
        text: 'Demo React',
        link: `${demoSiteOrigin}/demo-map/react/`,
        target: '_self',
        rel: 'noopener',
      },
    ],
    sidebar: [
      {
        text: 'Demo Vue',
        link: `${demoSiteOrigin}/demo-map/vue/`,
        target: '_self',
        rel: 'noopener',
      },
      {
        text: 'Demo React',
        link: `${demoSiteOrigin}/demo-map/react/`,
        target: '_self',
        rel: 'noopener',
      },
      ...rewriteSidebar(
        getMapSideBar() as DefaultTheme.SidebarItem[],
        (link) => rewritePrefixLink('map', link),
      ),
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/hung4564/vue-library' },
    ],
  },
  vite: {
    ...sharedVite,
    build: {
      emptyOutDir: false,
    },
  },
};

export default defineConfig(
  isDemoDraggable
    ? demoDraggableConfig
    : isDemoMap
      ? demoMapConfig
      : mainDocsConfig,
);
