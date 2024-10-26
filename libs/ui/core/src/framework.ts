// Utilities

// Types
import type { App } from 'vue';
import { getUid } from './utils/getCurrentInstance';

export function createUI() {
  const install = (app: App) => {
    getUid.reset();
  };
  return {
    install,
  };
}
