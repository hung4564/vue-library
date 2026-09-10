import { LIST_VIEW_MENU_COMPONENT_KEY } from '@hungpvq/map-dataset/menu';
import { UniversalRegistry } from '@hungpvq/react-map-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  resetDatasetRegistryWarnFlag,
  warnIfDatasetRegistryMissing,
} from './warn-registry';

afterEach(() => {
  resetDatasetRegistryWarnFlag();
  vi.restoreAllMocks();
});

describe('warnIfDatasetRegistryMissing', () => {
  it('warns once when toggleShowButton is not registered', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(UniversalRegistry, 'getComponent').mockReturnValue(undefined);

    warnIfDatasetRegistryMissing();
    warnIfDatasetRegistryMissing();

    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toContain('installMapApp');
  });

  it('does not warn when component is registered', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(UniversalRegistry, 'getComponent').mockImplementation((key) =>
      key === LIST_VIEW_MENU_COMPONENT_KEY.toggleShowButton
        ? ({} as never)
        : undefined,
    );

    warnIfDatasetRegistryMissing();
    expect(warn).not.toHaveBeenCalled();
  });
});
