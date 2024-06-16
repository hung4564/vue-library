import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dropzone',
    },
    {
      path: '/sortable',
      name: 'sortable',
      component: HomeView,
    },
    {
      path: '/dropzone',
      name: 'dropzone',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/DropZoneView/index.vue'),
    },
  ],
});

export default router;
