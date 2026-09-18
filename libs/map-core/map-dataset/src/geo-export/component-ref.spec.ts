import { describe, expect, it } from 'vitest';
import {
  resolveGeoExportComponentRef,
  resolveGeoExportUiSlot,
} from './component-ref';

describe('resolveGeoExportComponentRef', () => {
  it('maps string to componentKey', () => {
    expect(resolveGeoExportComponentRef('my-form')).toEqual({
      componentKey: 'my-form',
    });
  });

  it('maps component to defaultComponent', () => {
    const Comp = () => null;
    expect(resolveGeoExportComponentRef(Comp)).toEqual({
      defaultComponent: Comp,
    });
  });

  it('ignores empty', () => {
    expect(resolveGeoExportComponentRef(undefined)).toEqual({});
    expect(resolveGeoExportComponentRef('')).toEqual({});
    expect(resolveGeoExportComponentRef('  ')).toEqual({});
  });
});

describe('resolveGeoExportUiSlot', () => {
  const builtin = { name: 'builtin' };
  const globalKey = 'layer-action-export-geo-form';

  it('uses global key when no local override', () => {
    expect(resolveGeoExportUiSlot(undefined, globalKey, builtin)).toEqual({
      componentKey: globalKey,
      defaultComponent: builtin,
    });
  });

  it('local string wins as componentKey (builtin fallback)', () => {
    expect(resolveGeoExportUiSlot('local-form', globalKey, builtin)).toEqual({
      componentKey: 'local-form',
      defaultComponent: builtin,
    });
  });

  it('local component skips global key', () => {
    const Local = { name: 'Local' };
    expect(resolveGeoExportUiSlot(Local, globalKey, builtin)).toEqual({
      defaultComponent: Local,
    });
  });
});
