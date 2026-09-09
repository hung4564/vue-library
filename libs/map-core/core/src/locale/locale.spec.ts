import { describe, expect, it } from 'vitest';
import { BASEMAP_CONTROL_LOCALE } from '../basemap/locale';
import { HOME_CONTROL_LOCALE, INFO_CONTROL_LOCALE, MAP_ACTION_LOCALE } from './index';
import { MEASUREMENT_CONTROL_LOCALE } from '../measurement/locale';
import { PRINT_CONTROL_LOCALE } from '../print/locale';

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
});
