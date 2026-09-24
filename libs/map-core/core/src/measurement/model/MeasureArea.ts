/**
 * Framework-agnostic area measurement class
 */

import area from '@turf/area';
import centroid from '@turf/centroid';
import { lineString, point, polygon } from '@turf/helpers';
import length from '@turf/length';
import midpoint from '@turf/midpoint';
import { Feature } from 'geojson';

import type { IViewSetting } from '../types';
import {
  edgeLabelRotation,
  formatAreaText,
  formatDistanceText,
  getMeasurementLabelPrefs,
} from '../utils';
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
    const areaValue = Number(area(geometry));
    const labels: Feature[] = [];
    const prefs = getMeasurementLabelPrefs();

    if (prefs.showResultLabel) {
      labels.push(
        centroid(geometry, {
          properties: {
            is_label: true,
            is_center: true,
            is_result: true,
            text: formatAreaText(areaValue),
          },
        }),
      );
    }

    if (prefs.showEdgeLabels) {
      for (let i = 0; i < this.coordinates.length; i++) {
        const start = this.coordinates[i] as [number, number];
        const end = this.coordinates[(i + 1) % this.coordinates.length] as [
          number,
          number,
        ];
        const edgeKm = Number(length(lineString([start, end])));
        const mid = midpoint(point(start), point(end));
        labels.push({
          type: 'Feature',
          geometry: mid.geometry,
          properties: {
            is_label: true,
            is_edge: true,
            text_rotate: edgeLabelRotation(start, end),
            text: formatDistanceText(edgeKm),
          },
        });
      }
    }

    result.features = [geometry];
    result.value = areaValue;
    result.format = formatAreaText(areaValue);
    result.features_label = labels;
    result.fields = [
      {
        trans: 'map.measurement.setting.area',
        value: formatAreaText(areaValue),
      },
    ];

    return result;
  }
}
