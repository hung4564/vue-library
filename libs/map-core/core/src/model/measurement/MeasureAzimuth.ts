/**
 * Framework-agnostic azimuth measurement class
 */

import { bearing, bearingToAzimuth, lineString, point } from '@turf/turf';
import type { Feature } from 'geojson';
import type { CoordinatesNumber, IViewSetting } from '../../types';
import { Measure } from './Measure';

/**
 * Class for measuring azimuth (bearing) between two points
 */
export class MeasureAzimuth extends Measure {
  get name(): string {
    return 'Measure Azimuth';
  }

  get type(): string {
    return 'line';
  }

  get setting() {
    return { maxLength: 2 };
  }

  /**
   * Add coordinate with max length constraint (only 2 points for azimuth)
   *
   * @param coordinate - Coordinate to add
   */
  add(coordinate: CoordinatesNumber): void {
    if (this.value.length > 1) {
      this.value = this.value.slice(0, 1);
    }
    this.value.push(coordinate);
  }

  getResult(): IViewSetting {
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
