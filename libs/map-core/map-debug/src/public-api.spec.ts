/**
 * Locks `@hungpvq/map-debug` root **runtime** export surface (Experimental).
 */
import { describe, expect, it } from 'vitest';
import * as api from './index';

export const MAP_DEBUG_EXPERIMENTAL_RUNTIME_EXPORTS = [
  'LEVEL_FILTERS',
  'buildRequestFlowSteps',
  'buildRequestFlowTree',
  'childKeys',
  'collectErrorMapIds',
  'displayValue',
  'errorMapId',
  'filterErrorsByMapId',
  'formatDevtoolErrorForCopy',
  'formatErrorTime',
  'formatFlowDelta',
  'formatLogTime',
  'getDatasetStore',
  'getMapBag',
  'getMapScopedStore',
  'getValueType',
  'hasChildren',
  'installMapDebug',
  'isMapDebugInstalled',
  'listMapIds',
  'objectArgs',
  'previewValue',
  'shortActionId',
  'shortErrorMapId',
  'shortMapId',
  'snapshotGlobalStore',
  'snapshotMapScopedStore',
  'stringifyLogRecord',
  'textMessage',
  'uninstallMapDebug',
] as const;

describe('public API surface', () => {
  it('root runtime exports match Experimental allowlist', () => {
    const keys = Object.keys(api).sort();
    const expected = [...MAP_DEBUG_EXPERIMENTAL_RUNTIME_EXPORTS].sort();
    expect(keys).toEqual(expected);
  });
});
