import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/AllMapView.vue';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.VITE_BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/map-core/',
      component: () => import('../views/map-core.vue'),
    },
    {
      path: '/language/',
      component: () => import('../views/language.vue'),
    },
    {
      path: '/minimal/',
      component: () => import('../views/minimal.vue'),
    },
    {
      path: '/map-dataset/',
      component: () => import('../views/map-dataset.vue'),
    },
    {
      path: '/worker-sample/',
      component: () => import('../views/worker-sample/example.vue'),
    },
    {
      path: '/toolbar/',
      component: () => import('../views/toolbar.vue'),
    },
    {
      path: '/mobile-menu/',
      component: () => import('../views/mobile-menu.vue'),
    },
    {
      path: '/legend/',
      component: () => import('../views/legend.vue'),
    },
    {
      path: '/draw/',
      component: () => import('../views/Draw/example.vue'),
    },
    {
      path: '/basemap/',
      component: () => import('../views/BaseMapControl/example.vue'),
    },
    {
      path: '/basemap-error/',
      component: () => import('../views/basemap-error.vue'),
    },
    {
      path: '/multi-map/',
      component: () => import('../views/multi-map.vue'),
    },
    {
      path: '/dataset-highlight/',
      component: () => import('../views/dataset-highlight/example.vue'),
    },
    {
      path: '/dataset-identify/',
      component: () => import('../views/dataset-identify/example.vue'),
    },
    {
      path: '/dataset-identify-present/',
      component: () =>
        import('../views/dataset-identify-present/example.vue'),
    },
    {
      path: '/dataset-menu/',
      component: () => import('../views/dataset-menu/example.vue'),
    },
    {
      path: '/dataset-list/',
      component: () => import('../views/dataset-list/example.vue'),
    },
    {
      path: '/registry-control/',
      component: () => import('../views/registry-control/example.vue'),
    },
    {
      path: '/dataset-data-management/',
      component: () => import('../views/dataset-data-management/example.vue'),
    },
    {
      path: '/dataset-attribute-table/',
      component: () => import('../views/dataset-attribute-table/example.vue'),
    },
    {
      path: '/dataset-geo-export/',
      component: () => import('../views/dataset-geo-export/example.vue'),
    },
    {
      path: '/measurement/',
      component: () => import('../views/Measurement/example.vue'),
    },
    {
      path: '/story-telling/',
      component: () => import('../views/StoryTelling/example.vue'),
    },
    {
      path: '/story-telling-gps/',
      component: () => import('../views/StoryTelling/example-gps.vue'),
    },
    {
      path: '/print/',
      component: () => import('../views/print.vue'),
    },
    {
      path: '/crs/',
      component: () => import('../views/crs.vue'),
    },
    {
      path: '/devtools/',
      component: () => import('../views/devtools.vue'),
    },
    {
      path: '/logging-cookbook/',
      component: () => import('../views/logging-cookbook/example.vue'),
    },
    {
      path: '/shared-log/',
      component: () => import('../views/shared-log/example.vue'),
    },
    {
      path: '/theme/',
      component: () => import('../views/theme.vue'),
    },
  ],
});

export default router;
