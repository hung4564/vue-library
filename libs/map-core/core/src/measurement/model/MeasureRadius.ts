/**
 * Framework-agnostic radius measurement (center + edge point).
 */

import { circle, distance, lineString, point } from '@turf/turf';
import type { Feature } from 'geojson';
import type { CoordinatesNumber } from '../../types';
import {
  edgeLabelRotation,
  formatDistanceText,
  getMeasurementLabelPrefs,
} from '../utils';
import type { IViewSetting } from '../types';
import { Measure } from './Measure';

/**
 * Measure circle radius from center to second vertex.
 */
export class MeasureRadius extends Measure {
  get name(): string {
    return 'Measure Radius';
  }

  override get type(): string {
    return 'radius';
  }

  override get setting() {
    return { maxLength: 2 };
  }

  override add(coordinate: CoordinatesNumber): void {
    if (this.value.length > 1) {
      this.value = this.value.slice(0, 1);
    }
    this.value.push(coordinate);
  }

  override getResult(): IViewSetting {
    const features: Feature[] = [];
    const features_label: Feature[] = [];
    const result: IViewSetting = {
      features,
      value: 0,
      features_label,
      fields: [],
    };

    if (!this.coordinates?.length) return result;

    if (this.coordinates.length === 1) {
      result.features = [point(this.coordinates[0])];
      return result;
    }

    const center = this.coordinates[0] as [number, number];
    const edge = this.coordinates[1] as [number, number];
    const radiusKm = Number(
      distance(point(center), point(edge), { units: 'kilometers' }),
    );
    const circumferenceKm = 2 * Math.PI * radiusKm;
    const ring = circle(center, radiusKm, { steps: 64, units: 'kilometers' });
    const radiusLine = lineString([center, edge]);
    const prefs = getMeasurementLabelPrefs();
    const labels: Feature[] = [];

    if (prefs.showEdgeLabels) {
      const midLng = (center[0] + edge[0]) / 2;
      const midLat = (center[1] + edge[1]) / 2;
      labels.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [midLng, midLat] },
        properties: {
          is_label: true,
          is_edge: true,
          text_rotate: edgeLabelRotation(center, edge),
          text: formatDistanceText(radiusKm),
        },
      });
    }

    result.features = [ring, radiusLine, point(center)];
    result.value = radiusKm;
    result.format = formatDistanceText(radiusKm);
    result.features_label = labels;
    result.fields = [
      {
        trans: 'map.measurement.setting.radius',
        value: formatDistanceText(radiusKm),
      },
      {
        trans: 'map.measurement.setting.circumference',
        value: formatDistanceText(circumferenceKm),
      },
    ];

    return result;
  }
}
