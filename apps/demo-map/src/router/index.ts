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
      path: '/draw/',
      component: () => import('../views/Draw/example.vue'),
    },
    {
      path: '/basemap/',
      component: () => import('../views/BaseMapControl/example.vue'),
    },
    {
      path: '/layer/',
      component: () => import('../views/LayerControl/example.vue'),
    },
    {
      path: '/measurement/',
      component: () => import('../views/Measurement/example.vue'),
    },
    {
      path: '/geojson/',
      component: () => import('../views/GeojsonIo/index.vue'),
    },
  ],
});

export default router;
