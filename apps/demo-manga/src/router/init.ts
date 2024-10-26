import { addLayout, createMiddleware } from '@hungpvq/router';
import { defineAsyncComponent } from 'vue';

createMiddleware('about-2', () => {
  return 'about-2';
});

addLayout(
  'default',
  defineAsyncComponent(() => import(`../layout/custom/BlankLayout.vue`))
);
addLayout(
  'HomeLayout',
  defineAsyncComponent(() => import(`../layout/custom/HomeLayout.vue`))
);
