import router from './router';
import './styles.scss';

import { createUI } from '@hungpvq/ui-core';
import { createApp } from 'vue';
import App from './app/App.vue';

const app = createApp(App);
const ui = createUI();
app.use(router);
app.use(ui);

app.mount('#root');
