/* eslint-disable no-console */

// Utilities
import { warn } from 'vue';

export function consoleWarn(message: string): void {
  warn(`Vuetify: ${message}`);
}

export function consoleError(message: string): void {
  warn(`Vuetify error: ${message}`);
}
