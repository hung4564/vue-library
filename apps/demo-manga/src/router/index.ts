import { initialize, Layout } from '@hungpvq/router';
import { createRouter, createWebHistory } from 'vue-router';
import './init';
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: '',
          component: () => import('../views/home.vue'),
          meta: {
            middleware: ['about'],
            layout: 'HomeLayout',
          },
        },
        {
          path: 'manga',
          component: () => import('../views/manga-detail.vue'),
          meta: {
            middleware: ['about'],
            layout: 'HomeLayout',
          },
        },
      ],
    },
  ],
});

export default initialize(router);
