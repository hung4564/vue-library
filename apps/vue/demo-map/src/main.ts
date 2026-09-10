import './styles.css';

import router from './router';

import { createStoreRegistryPlugin } from '@hungpvq/shared-store';
import { installMapApp } from '@hungpvq/vue-map-dataset';
import { installDevtools } from '@hungpvq/vue-map-devtools';
import { createApp } from 'vue';
import App from './app/App.vue';

const app = createApp(App);

app.use(router);
installDevtools();
app.use(createStoreRegistryPlugin());
// Theme stays in App.vue as bootstrapMapTheme('auto'); dataset registry via installMapApp
installMapApp(app, { theme: false });

app.mount('#root');
