import { createStoreRegistryPlugin } from '@hungpvq/shared-store';
import { createApp } from 'vue';
import App from './app/App.vue';
import './styles.scss';

const app = createApp(App);
app.use(createStoreRegistryPlugin());
app.mount('#root');
