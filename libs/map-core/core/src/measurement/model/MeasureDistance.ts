/**
 * Framework-agnostic distance measurement class
 */

import { lineString, point } from '@turf/helpers';
import length from '@turf/length';
import midpoint from '@turf/midpoint';
import { Feature } from 'geojson';

import type { IViewSetting } from '../types';
import {
  edgeLabelRotation,
  formatDistanceText,
  getMeasurementLabelPrefs,
} from '../utils';
import { Measure } from './Measure';

/**
 * Class for measuring distance along a line
 */
export class MeasureDistance extends Measure {
  get name(): string {
    return 'Measure Distance';
  }

  override get type(): string {
    return 'line';
  }

  override getResult(): IViewSetting {
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
    const lengthValue = Number(length(line));
    const prefs = getMeasurementLabelPrefs();
    const labels: Feature[] = [];

    if (prefs.showVertexLabels) {
      for (let i = 0; i < this.coordinates.length; i++) {
        const x = this.coordinates[i];
        labels.push({
          type: 'Feature',
          properties: {
            is_label: true,
            is_vertex: true,
            text: formatDistanceText(
              i < 1
                ? 0
                : Number(length(lineString(this.coordinates.slice(0, i + 1)))),
            ),
          },
          geometry: { type: 'Point', coordinates: x },
        });
      }
    }

    if (prefs.showEdgeLabels) {
      for (let i = 0; i < this.coordinates.length - 1; i++) {
        const start = this.coordinates[i] as [number, number];
        const end = this.coordinates[i + 1] as [number, number];
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

    result.features = [line];
    result.value = lengthValue;
    result.format = formatDistanceText(lengthValue);
    result.features_label = labels;
    result.fields = [
      {
        trans: 'map.measurement.setting.distance',
        value: formatDistanceText(lengthValue),
      },
    ];

    return result;
  }
}
