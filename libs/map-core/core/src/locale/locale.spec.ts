import { describe, expect, it } from 'vitest';
import { BASEMAP_CONTROL_LOCALE } from '../basemap/locale';
import { MEASUREMENT_CONTROL_LOCALE } from '../measurement/locale';
import { PRINT_CONTROL_LOCALE } from '../print/locale';
import { diffLocaleKeys } from '../types/lang';
import { HOME_CONTROL_LOCALE, INFO_CONTROL_LOCALE, MAP_ACTION_LOCALE } from './index';
import { MAP_CORE_LOCALE_EN } from './locale.en';
import { MAP_CORE_LOCALE_VI } from './locale.vi';

describe('locale smoke', () => {
  it('exposes required control locale keys', () => {
    expect(
      MAP_ACTION_LOCALE.map.action['navigation-control-zoom-in'],
    ).toBeTruthy();
    expect(HOME_CONTROL_LOCALE.map.home.title).toBeTruthy();
    expect(INFO_CONTROL_LOCALE.map['info-control'].screenshot).toBeTruthy();
    expect(BASEMAP_CONTROL_LOCALE.map.basemap.title).toBeTruthy();
    expect(PRINT_CONTROL_LOCALE.map.print.btn.apply).toBeTruthy();
    expect(
      MEASUREMENT_CONTROL_LOCALE.map.measurement.tools.distance,
    ).toBeTruthy();
  });

  it('keeps EN and VI catalog key parity', () => {
    const { missingInA, missingInB } = diffLocaleKeys(
      MAP_CORE_LOCALE_EN,
      MAP_CORE_LOCALE_VI,
    );
    expect(missingInB).toEqual([]);
    expect(missingInA).toEqual([]);
  });
});
