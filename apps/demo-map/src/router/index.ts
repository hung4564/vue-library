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
      path: '/toolbar/',
      component: () => import('../views/toolbar.vue'),
    },
    {
      path: '/legend/',
      component: () => import('../views/legend.vue'),
    },
    {
      path: '/inspect/',
      component: () => import('../views/Draw/inspect.vue'),
    },
    {
      path: '/compare/',
      component: () => import('../views/AllMapCompareView.vue'),
    },
    {
      path: '/basemap/',
      component: () => import('../views/BaseMapControl/example.vue'),
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
      path: '/dataset-menu/',
      component: () => import('../views/dataset-menu/example.vue'),
    },
    {
      path: '/dataset-list/',
      component: () => import('../views/dataset-list/example.vue'),
    },
    {
      path: '/dataset-data-management/',
      component: () => import('../views/dataset-data-management/example.vue'),
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
  ],
});

export default router;
