/**
 * Framework-agnostic distance measurement class
 */

import { length, lineString, point } from '@turf/turf';
import { Feature } from 'geojson';
import { formatDistanceText } from '../../utils';
import type { IViewSetting } from '../../types';
import { Measure } from './Measure';

/**
 * Class for measuring distance along a line
 */
export class MeasureDistance extends Measure {
  get name(): string {
    return 'Measure Distance';
  }

  get type(): string {
    return 'line';
  }

  getResult(): IViewSetting {
    const features: Feature[] = [];
    const value: number | string = 0;
    const features_label: Feature[] = [];
    const result: IViewSetting = {
      features,
      value,
      features_label,
      fields: [],
    };

    if (!this.coordinates || this.coordinates.length < 1) {
      return result;
    }

    if (this.coordinates.length == 1) {
      result.features = [point(this.coordinates[0])];
      return result;
    }

    const line = lineString(this.coordinates);
    result.features = [line];
    result.value = length(line);
    result.format = formatDistanceText(result.value);
    result.features_label = this.coordinates.map((x, i, array) => {
      return {
        type: 'Feature',
        properties: {
          is_label: true,
          text: formatDistanceText(
            i < 1 ? 0 : length(lineString(array.slice(0, i + 1))),
          ),
        },
        geometry: { type: 'Point', coordinates: x },
      };
    });
    result.fields = [
      {
        trans: 'map.measurement.setting.distance',
        value: formatDistanceText(result.value),
      },
    ];

    return result;
  }
}
