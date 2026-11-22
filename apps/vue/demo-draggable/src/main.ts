import './styles.scss';

import { createStoreRegistryPlugin } from '@hungpvq/shared-store';
import { createApp } from 'vue';

import App from './app/App.vue';
import router from './router';

const app = createApp(App);
app.use(createStoreRegistryPlugin());
app.use(router);
app.mount('#root');
