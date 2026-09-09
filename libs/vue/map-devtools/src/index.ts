/**
 * Root barrel: explicit named exports (Stable).
 * Do not reintroduce `export *`.
 */
export type { LogEntry } from './log-adapter';
export { DevtoolLogAdapter } from './log-adapter';
export { DevtoolsPlugin, uninstallDevtools } from './plugin';
export type { DevtoolTab, ErrorRecord } from './store';
export {
  clearDevtoolErrors,
  clearDevtoolLogs,
  devtoolLogAdapter,
  devtoolState,
  getDevtoolState,
  setDevtoolActiveTab,
  subscribeDevtoolState,
  toggleDevtoolOpen,
  useDevtoolState,
} from './store';
export { default as Devtools } from './ui/Devtools.vue';
