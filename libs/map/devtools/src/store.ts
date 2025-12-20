import { reactive } from 'vue';
import { DevtoolLogAdapter } from './log-adapter';

export const devtoolState = reactive({
  isOpen: false,
  activeTab: 'store' as 'store' | 'logs',
});

export const devtoolLogAdapter = new DevtoolLogAdapter();
