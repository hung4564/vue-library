import './styles.css';

import router from './router';

import { DevtoolsPlugin } from '@hungpvq/map-devtools';
import { createStoreRegistryPlugin } from '@hungpvq/shared-store';
import { createDatasetRegistryPlugin } from '@hungpvq/vue-map-dataset';
import { createApp } from 'vue';
import App from './app/App.vue';

const app = createApp(App);

app.use(router);
app.use(DevtoolsPlugin);
app.use(createStoreRegistryPlugin());
app.use(createDatasetRegistryPlugin());

app.mount('#root');
