/**
 * Framework-agnostic area measurement class
 */

import { area, centroid, lineString, point, polygon } from '@turf/turf';
import { Feature } from 'geojson';
import { formatAreaText } from '../../utils';
import type { IViewSetting } from '../../types';
import { Measure } from './Measure';

/**
 * Class for measuring area of a polygon
 */
export class MeasureArea extends Measure {
  get name(): string {
    return 'Measure Area';
  }

  override get type(): string {
    return 'area';
  }

  override getResult(): IViewSetting {
    const features: Feature[] = [];
    const value = 0;
    const features_label: Feature[] = [];
    const result: IViewSetting = {
      features,
      value,
      features_label,
    };

    if (!this.coordinates || this.coordinates.length < 1) {
      return result;
    }

    if (this.coordinates.length == 1) {
      result.features = [point(this.coordinates[0])];
      return result;
    }

    if (this.coordinates.length == 2) {
      result.features = [lineString(this.coordinates)];
      return result;
    }

    const geometry = polygon([[...this.coordinates, this.coordinates[0]]]);
    result.features = [geometry];
    result.value = area(geometry);
    result.format = formatAreaText(result.value);
    result.features_label = [
      centroid(geometry, {
        properties: {
          is_label: true,
          is_center: true,
          text: formatAreaText(result.value),
        },
      }),
    ];
    result.fields = [
      {
        trans: 'map.measurement.setting.area',
        value: formatAreaText(result.value),
      },
    ];

    return result;
  }
}
