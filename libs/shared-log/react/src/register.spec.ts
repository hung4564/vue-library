import {
  peekHungpvqDebugHost,
  resetHungpvqDebugHostForTests,
  setDebugTabEnabled,
  toggleDebugTab,
} from '@hungpvq/shared-log';
import { afterEach, describe, expect, it } from 'vitest';

import * as api from './index';
import { ensureReactLogUiStore } from './store';

afterEach(() => {
  ensureReactLogUiStore().builtinRegistered = false;
  resetHungpvqDebugHostForTests();
});

describe('react-shared-log register', () => {
  it('exposes all tab registrars, map, and defaults', () => {
    expect(typeof api.registerDebugTab).toBe('function');
    expect(typeof api.registerBuiltinDebugTabs).toBe('function');
    expect(typeof api.registerStoreDebugTab).toBe('function');
    expect(typeof api.registerLiveDebugTab).toBe('function');
    expect(typeof api.registerLogsDebugTab).toBe('function');
    expect(typeof api.registerErrorsDebugTab).toBe('function');
    expect(typeof api.registerTabsDebugTab).toBe('function');
    expect(Array.isArray(api.DEFAULT_BUILTIN_DEBUG_TABS)).toBe(true);
    expect(api.DEFAULT_BUILTIN_DEBUG_TABS.length).toBe(5);
    expect(Object.keys(api.BUILTIN_DEBUG_TAB_MAP)).toEqual([
      'store',
      'live',
      'logs',
      'errors',
      'tabs',
    ]);
  });

  it('registerStoreDebugTab registers store tab and unregisters', () => {
    const unsub = api.registerStoreDebugTab();
    const tabs = peekHungpvqDebugHost()?.listTabs('react') ?? [];
    expect(tabs.map((t) => t.id)).toEqual(['store']);

    unsub();
    const afterTabs = peekHungpvqDebugHost()?.listTabs('react') ?? [];
    expect(afterTabs.map((t) => t.id)).not.toContain('store');
  });

  it('registerTabsDebugTab registers tabs manager tab and unregisters', () => {
    const unsub = api.registerTabsDebugTab();
    const tabs = peekHungpvqDebugHost()?.listTabs('react') ?? [];
    expect(tabs.map((t) => t.id)).toEqual(['tabs']);

    unsub();
    const afterTabs = peekHungpvqDebugHost()?.listTabs('react') ?? [];
    expect(afterTabs.map((t) => t.id)).not.toContain('tabs');
  });

  it('registerBuiltinDebugTabs accepts custom tab list', () => {
    const cleanup = api.registerBuiltinDebugTabs([
      api.registerStoreDebugTab,
      api.registerLiveDebugTab,
    ]);
    const tabs = peekHungpvqDebugHost()?.listTabs('react') ?? [];
    expect(tabs.map((t) => t.id)).toEqual(['store', 'live']);

    cleanup();
    const afterTabs = peekHungpvqDebugHost()?.listTabs('react') ?? [];
    expect(afterTabs.length).toBe(0);
  });

  it('registerBuiltinDebugTabs accepts tab ids as string array', () => {
    const cleanup = api.registerBuiltinDebugTabs(['store', 'logs']);
    const tabs = peekHungpvqDebugHost()?.listTabs('react') ?? [];
    expect(tabs.map((t) => t.id)).toEqual(['store', 'logs']);

    cleanup();
  });

  it('registerBuiltinDebugTabs accepts object config to disable tabs by id', () => {
    const cleanup = api.registerBuiltinDebugTabs({ live: false, errors: false, tabs: false });
    const tabs = peekHungpvqDebugHost()?.listTabs('react') ?? [];
    expect(tabs.map((t) => t.id)).toEqual(['store', 'logs']);

    cleanup();
  });

  it('allows dynamic toggle on/off by id at runtime', () => {
    const cleanup = api.registerBuiltinDebugTabs();
    expect((peekHungpvqDebugHost()?.listTabs('react') ?? []).map((t) => t.id)).toEqual([
      'store',
      'live',
      'logs',
      'errors',
      'tabs',
    ]);

    setDebugTabEnabled('live', false);
    expect((peekHungpvqDebugHost()?.listTabs('react') ?? []).map((t) => t.id)).toEqual([
      'store',
      'logs',
      'errors',
      'tabs',
    ]);

    toggleDebugTab('live', true);
    expect((peekHungpvqDebugHost()?.listTabs('react') ?? []).map((t) => t.id)).toEqual([
      'store',
      'live',
      'logs',
      'errors',
      'tabs',
    ]);

    cleanup();
  });

  it('registerBuiltinDebugTabs default registers all 5 default tabs', () => {
    const cleanup = api.registerBuiltinDebugTabs();
    const ids = (peekHungpvqDebugHost()?.listTabs('react') ?? []).map(
      (t) => t.id,
    );
    expect(ids).toContain('store');
    expect(ids).toContain('live');
    expect(ids).toContain('logs');
    expect(ids).toContain('errors');
    expect(ids).toContain('tabs');

    cleanup();
    const afterTabs = peekHungpvqDebugHost()?.listTabs('react') ?? [];
    expect(afterTabs.length).toBe(0);
  });
});
