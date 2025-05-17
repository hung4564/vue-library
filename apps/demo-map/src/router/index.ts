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
      path: '/legend/',
      component: () => import('../views/legend.vue'),
    },
    {
      path: '/draw/',
      component: () => import('../views/Draw/example.vue'),
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
