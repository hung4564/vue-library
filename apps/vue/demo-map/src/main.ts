import '@hungpvq/map-core/style.css';
import '@hungpvq/map-dataset/style.css';
import '@hungpvq/vue-draggable/style.css';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-dataset/style.css';
import '@hungpvq/vue-map-devtools/style.css';
import '@hungpvq/vue-map-draw/style.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import './styles.css';

import { createStoreRegistryPlugin } from '@hungpvq/shared-store';
import { installMapApp } from '@hungpvq/vue-map-dataset';
import { createApp } from 'vue';

import { installDevtools } from '@hungpvq/map-debug';
import { installDatasetDebug } from '@hungpvq/map-debug/dataset';
import App from './app/App.vue';
import router from './router';

const app = createApp(App);

app.use(router);
installDevtools();
installDatasetDebug();
app.use(createStoreRegistryPlugin());
// Theme stays in App.vue as bootstrapMapTheme('auto'); dataset registry via installMapApp
installMapApp(app, { theme: false });

app.mount('#root');
