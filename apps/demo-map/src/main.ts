import './styles.css';

import router from './router';

import { createStoreRegistryPlugin } from '@hungpvq/shared-store';
import { createApp } from 'vue';
import App from './app/App.vue';

const app = createApp(App);

app.use(router);
app.use(createStoreRegistryPlugin());

app.mount('#root');
app.config.unwrapInjectedRef = true;
