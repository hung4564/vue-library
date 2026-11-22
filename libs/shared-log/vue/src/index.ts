export { default as DevtoolsShell } from './DevtoolsShell.vue';
export { default as PanelTabManager } from './panels/PanelTabManager.vue';
export { registerDebugTab } from './register';
export {
  BUILTIN_DEBUG_TAB_MAP,
  type BuiltinDebugTabId,
  DEFAULT_BUILTIN_DEBUG_TABS,
  type DebugTabItem,
  type DebugTabRegistrar,
  type DebugTabsConfig,
  registerBuiltinDebugTabs,
  registerErrorsDebugTab,
  registerLiveDebugTab,
  registerLogsDebugTab,
  registerStoreDebugTab,
  registerTabsDebugTab,
  resolveBuiltinDebugTabs,
} from './register-builtin';
export { TreeItem } from '@hungpvq/vue-ui-core';
export { useDebugHost } from './use-debug-host';
export { useLiveHookDebug } from './useLiveHookDebug';
export { default as DevtoolPanelCard } from './ui/DevtoolPanelCard.vue';
export { default as DevtoolPanelContainer } from './ui/DevtoolPanelContainer.vue';
export { default as DevtoolPanelSplit } from './ui/DevtoolPanelSplit.vue';
export { default as DevtoolPanelToolbar } from './ui/DevtoolPanelToolbar.vue';
