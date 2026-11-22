import { describe, expect, it } from 'vitest';

import * as api from './index';

export const VUE_SHARED_LOG_RUNTIME_EXPORTS = [
  'BUILTIN_DEBUG_TAB_MAP',
  'DEFAULT_BUILTIN_DEBUG_TABS',
  'DevtoolPanelCard',
  'DevtoolPanelContainer',
  'DevtoolPanelSplit',
  'DevtoolPanelToolbar',
  'DevtoolsShell',
  'PanelTabManager',
  'registerBuiltinDebugTabs',
  'registerDebugTab',
  'registerErrorsDebugTab',
  'registerLiveDebugTab',
  'registerLogsDebugTab',
  'registerStoreDebugTab',
  'registerTabsDebugTab',
  'resolveBuiltinDebugTabs',
  'TreeItem',
  'useDebugHost',
  'useLiveHookDebug',
] as const;

describe('public API surface', () => {
  it('root runtime exports match allowlist', () => {
    expect(Object.keys(api).sort()).toEqual(
      [...VUE_SHARED_LOG_RUNTIME_EXPORTS].sort(),
    );
  });
});
