import { afterEach, describe, expect, it, vi } from 'vitest';

const mockWarn = vi.hoisted(() => vi.fn());

vi.mock('@hungpvq/shared-log', () => ({
  loggerFactory: {
    getAdapters: () => [],
    createLogger: () => {
      const logger = {
        setNamespace: () => logger,
        with: () => logger,
        warn: mockWarn,
        debug: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
      };
      return logger;
    },
  },
}));

import { LIST_VIEW_MENU_COMPONENT_KEY } from '../menu/items';
import {
  resetDatasetRegistryWarnFlag,
  warnIfDatasetRegistryMissing,
} from './warn-registry';

afterEach(() => {
  resetDatasetRegistryWarnFlag();
  mockWarn.mockClear();
  vi.restoreAllMocks();
});

describe('warnIfDatasetRegistryMissing', () => {
  it('warns once when toggleShowButton is not registered', () => {
    const getComponent = vi.fn().mockReturnValue(undefined);

    warnIfDatasetRegistryMissing(getComponent, 'vue-map-dataset');
    warnIfDatasetRegistryMissing(getComponent, 'vue-map-dataset');

    expect(mockWarn).toHaveBeenCalledTimes(1);
    expect(String(mockWarn.mock.calls[0]?.[0])).toContain('installMapApp');
  });

  it('does not warn when component is registered', () => {
    const getComponent = vi
      .fn()
      .mockImplementation((key) =>
        key === LIST_VIEW_MENU_COMPONENT_KEY.toggleShowButton ? {} : undefined,
      );

    warnIfDatasetRegistryMissing(getComponent, 'vue-map-dataset');
    expect(mockWarn).not.toHaveBeenCalled();
  });
});
