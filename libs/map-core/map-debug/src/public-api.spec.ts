/**
 * Locks `@hungpvq/map-debug` root **runtime** export surface (Experimental).
 */
import { describe, expect, it } from 'vitest';
import * as api from './index';

export const MAP_DEBUG_EXPERIMENTAL_RUNTIME_EXPORTS = [
  'LEVEL_FILTERS',
  'GROUP_LEVELS',
  'UUID_RE',
  'beginPanelDrag',
  'buildStructuredLogs',
  'childKeys',
  'clampPanelPos',
  'collectErrorMapIds',
  'collectLogMapIds',
  'collectNamespaces',
  'collectStructuredLogs',
  'countNewLogsWhilePaused',
  'displayNamespace',
  'displayValue',
  'entryText',
  'errorMapId',
  'filterErrorsByMapId',
  'filterLogs',
  'formatArg',
  'formatDevtoolErrorForCopy',
  'formatErrorTime',
  'formatLogTime',
  'getDatasetStore',
  'getMapScopedStore',
  'getValueType',
  'hasChildren',
  'installMapDebug',
  'isMapDebugInstalled',
  'isObject',
  'levelLetter',
  'listMapIds',
  'logMapId',
  'namespaceKey',
  'namespaceParts',
  'objectArgs',
  'offsetParentRect',
  'PANEL_DRAG_THRESHOLD_PX',
  'panelPosStyle',
  'previewValue',
  'shortErrorMapId',
  'shortMapId',
  'snapshotGlobalStore',
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
