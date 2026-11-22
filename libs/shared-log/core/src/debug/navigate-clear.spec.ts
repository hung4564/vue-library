import { afterEach, describe, expect, it } from 'vitest';

import { emitLiveRecord } from '../live-hook/trace-store';
import { resetHungpvqDebugHostForTests } from './host';
import { uninstallDebug } from './install';
import { applyDebugNavigation } from './navigate-clear';
import {
  getDebugLogs,
  getLogDebugStore,
  isClearLogsOnNavigate,
  setClearLogsOnNavigate,
} from './store';
import { getLiveTraceEvents } from '../live-hook/trace-store';

afterEach(() => {
  const bag = getLogDebugStore();
  bag.logs = [];
  bag.liveEvents = [];
  bag.clearOnNavigate = true;
  bag.navKey = undefined;
  uninstallDebug();
  resetHungpvqDebugHostForTests();
});

describe('clear logs on navigate', () => {
  it('defaults to on and can be toggled', () => {
    expect(isClearLogsOnNavigate()).toBe(true);
    setClearLogsOnNavigate(false);
    expect(isClearLogsOnNavigate()).toBe(false);
    expect(getLogDebugStore().clearOnNavigate).toBe(false);
  });

  it('clears logs and live traces when the path key changes', () => {
    const bag = getLogDebugStore();
    bag.logs = [
      {
        id: 'keep-me',
        header: { ts: 1, kind: 'log', level: 'debug', namespaces: ['t'] },
        data: { args: ['x'] },
      },
    ];
    emitLiveRecord({
      event: 'component:render',
      instanceId: 'vue:1',
      component: 'Demo',
      framework: 'vue',
    });
    bag.navKey = '/a';
    applyDebugNavigation('/b');
    expect(getDebugLogs()).toEqual([]);
    expect(getLiveTraceEvents()).toEqual([]);
    expect(bag.navKey).toBe('/b');
  });

  it('keeps data when the option is off', () => {
    const bag = getLogDebugStore();
    setClearLogsOnNavigate(false);
    bag.logs = [
      {
        id: 'stay',
        header: { ts: 1, kind: 'log', level: 'debug', namespaces: ['t'] },
        data: { args: ['x'] },
      },
    ];
    bag.navKey = '/a';
    applyDebugNavigation('/b');
    expect(getDebugLogs()).toHaveLength(1);
    expect(getDebugLogs()[0]?.id).toBe('stay');
  });

  it('ignores the same key', () => {
    const bag = getLogDebugStore();
    bag.logs = [
      {
        id: 'same',
        header: { ts: 1, kind: 'log', level: 'debug', namespaces: ['t'] },
        data: { args: ['x'] },
      },
    ];
    bag.navKey = '/same';
    applyDebugNavigation('/same');
    expect(getDebugLogs()).toHaveLength(1);
  });
});
