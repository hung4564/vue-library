import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/HomePage.vue'),
    },
    {
      path: '/sidebar',
      name: 'sidebar',
      component: () => import('../pages/SidebarPage.vue'),
    },
    {
      path: '/popup',
      name: 'popup',
      component: () => import('../pages/PopupPage.vue'),
    },
    {
      path: '/float',
      name: 'float',
      component: () => import('../pages/FloatPage.vue'),
    },
    {
      path: '/bottom',
      name: 'bottom',
      component: () => import('../pages/BottomPage.vue'),
    },
    {
      path: '/drawer',
      name: 'drawer',
      component: () => import('../pages/DrawerPage.vue'),
    },
    {
      path: '/modal',
      name: 'modal',
      component: () => import('../pages/ModalPage.vue'),
    },
    {
      path: '/custom-card',
      name: 'custom-card',
      component: () => import('../pages/CustomCardPage.vue'),
    },
  ],
});

export default router;
