import {
  peekHungpvqDebugHost,
  resetHungpvqDebugHostForTests,
  setDebugTabEnabled,
  toggleDebugTab,
} from '@hungpvq/shared-log';
import { afterEach, describe, expect, it } from 'vitest';

import {
  BUILTIN_DEBUG_TAB_MAP,
  DEFAULT_BUILTIN_DEBUG_TABS,
  registerBuiltinDebugTabs,
  registerErrorsDebugTab,
  registerLiveDebugTab,
  registerLogsDebugTab,
  registerStoreDebugTab,
  registerTabsDebugTab,
  resolveBuiltinDebugTabs,
} from './index';
import { useVueLogUiStore } from './store';

afterEach(() => {
  useVueLogUiStore().builtinRegistered.value = false;
  resetHungpvqDebugHostForTests();
});

describe('vue-shared-log register-builtin', () => {
  it('registerStoreDebugTab registers only the store tab and unregisters on cleanup', () => {
    const unsub = registerStoreDebugTab();
    const tabs = peekHungpvqDebugHost()?.listTabs('vue') ?? [];
    expect(tabs.map((t) => t.id)).toEqual(['store']);

    unsub();
    const afterTabs = peekHungpvqDebugHost()?.listTabs('vue') ?? [];
    expect(afterTabs.map((t) => t.id)).not.toContain('store');
  });

  it('registerTabsDebugTab registers the tabs manager tab and unregisters on cleanup', () => {
    const unsub = registerTabsDebugTab();
    const tabs = peekHungpvqDebugHost()?.listTabs('vue') ?? [];
    expect(tabs.map((t) => t.id)).toEqual(['tabs']);

    unsub();
    const afterTabs = peekHungpvqDebugHost()?.listTabs('vue') ?? [];
    expect(afterTabs.map((t) => t.id)).not.toContain('tabs');
  });

  it('registerBuiltinDebugTabs with specific tab array only registers specified tabs', () => {
    const cleanup = registerBuiltinDebugTabs([
      registerStoreDebugTab,
      registerLiveDebugTab,
    ]);
    const tabs = peekHungpvqDebugHost()?.listTabs('vue') ?? [];
    expect(tabs.map((t) => t.id)).toEqual(['store', 'live']);

    cleanup();
    const afterTabs = peekHungpvqDebugHost()?.listTabs('vue') ?? [];
    expect(afterTabs.length).toBe(0);
  });

  it('registerBuiltinDebugTabs accepts tab ids as string array', () => {
    const cleanup = registerBuiltinDebugTabs(['store', 'logs']);
    const tabs = peekHungpvqDebugHost()?.listTabs('vue') ?? [];
    expect(tabs.map((t) => t.id)).toEqual(['store', 'logs']);

    cleanup();
    const afterTabs = peekHungpvqDebugHost()?.listTabs('vue') ?? [];
    expect(afterTabs.length).toBe(0);
  });

  it('registerBuiltinDebugTabs accepts object config to disable tabs by id', () => {
    const cleanup = registerBuiltinDebugTabs({ live: false, errors: false, tabs: false });
    const tabs = peekHungpvqDebugHost()?.listTabs('vue') ?? [];
    expect(tabs.map((t) => t.id)).toEqual(['store', 'logs']);

    cleanup();
  });

  it('allows dynamic toggle on/off by id at runtime', () => {
    const cleanup = registerBuiltinDebugTabs();
    expect((peekHungpvqDebugHost()?.listTabs('vue') ?? []).map((t) => t.id)).toEqual([
      'store',
      'live',
      'logs',
      'errors',
      'tabs',
    ]);

    setDebugTabEnabled('live', false);
    expect((peekHungpvqDebugHost()?.listTabs('vue') ?? []).map((t) => t.id)).toEqual([
      'store',
      'logs',
      'errors',
      'tabs',
    ]);

    toggleDebugTab('live', true);
    expect((peekHungpvqDebugHost()?.listTabs('vue') ?? []).map((t) => t.id)).toEqual([
      'store',
      'live',
      'logs',
      'errors',
      'tabs',
    ]);

    cleanup();
  });

  it('registerBuiltinDebugTabs default registers all 5 default tabs', () => {
    expect(DEFAULT_BUILTIN_DEBUG_TABS.length).toBe(5);
    expect(Object.keys(BUILTIN_DEBUG_TAB_MAP)).toEqual(['store', 'live', 'logs', 'errors', 'tabs']);
    const cleanup = registerBuiltinDebugTabs();
    const ids = (peekHungpvqDebugHost()?.listTabs('vue') ?? []).map((t) => t.id);
    expect(ids).toContain('store');
    expect(ids).toContain('live');
    expect(ids).toContain('logs');
    expect(ids).toContain('errors');
    expect(ids).toContain('tabs');

    cleanup();
    const afterTabs = peekHungpvqDebugHost()?.listTabs('vue') ?? [];
    expect(afterTabs.length).toBe(0);
  });
});
