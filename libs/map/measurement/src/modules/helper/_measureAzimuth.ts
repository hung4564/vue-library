import { bearing, bearingToAzimuth, lineString, point } from '@turf/turf';
import type { Feature } from 'geojson';

import { type CoordinatesNumber } from '@hungpvq/shared-map';
import { IViewSetting } from '../types';
import { Measure } from './_measurement';

export class MeasureAzimuth extends Measure {
  get name() {
    return 'Measure Azimuth';
  }
  get type() {
    return 'line';
  }
  get setting() {
    return { maxLength: 2 };
  }
  add(coordinate: CoordinatesNumber) {
    if (this.value.length > 1) {
      this.value = this.value.slice(0, 1);
    }
    this.value.push(coordinate);
  }
  getResult() {
    const features: Feature[] = [];
    const value = 0;
    const features_label: Feature[] = [];
    const result: IViewSetting = {
      features,
      value: value as number | string,
      features_label,
    };
    if (!this.coordinates || this.coordinates.length < 1) {
      return result;
    }
    if (this.coordinates.length == 1) {
      result.features = [point(this.coordinates[0])];
      return result;
    }
    const end = this.coordinates[this.coordinates.length - 1];
    const start = this.coordinates[this.coordinates.length - 2];
    const line = lineString(this.coordinates);
    result.features = [line];
    const lineBearing = bearing(start, end);
    result.value = bearingToAzimuth(lineBearing).toFixed(3);
    result.features_label = [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: end,
        },
        properties: {
          is_label: true,
          text: `${result.value} °`,
          rotation: lineBearing,
        },
      },
    ];
    result.fields = [
      {
        trans: 'map.measurement.setting.azimuth',
        value: `${result.value} °`,
      },
    ];
    return result;
  }
}
