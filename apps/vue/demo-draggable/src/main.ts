import { createStoreRegistryPlugin } from '@hungpvq/shared-store';
import { createApp } from 'vue';
import App from './app/App.vue';
import router from './router';
import './styles.scss';

const app = createApp(App);
app.use(createStoreRegistryPlugin());
app.use(router);
app.mount('#root');
