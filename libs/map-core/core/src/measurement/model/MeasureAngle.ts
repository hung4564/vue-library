/**
 * Framework-agnostic angle measurement (3 points: arm → vertex → arm).
 */

import bearing from '@turf/bearing';
import destination from '@turf/destination';
import distance from '@turf/distance';
import { lineString, point } from '@turf/helpers';
import lineArc from '@turf/line-arc';
import type { Feature, LineString, Point } from 'geojson';
import type { CoordinatesNumber } from '../../types';
import { getMeasurementLabelPrefs } from '../utils';
import type { IViewSetting } from '../types';
import { Measure } from './Measure';

/** Smaller interior angle at B between points A–B–C (degrees, 0–180). */
export function angleAtVertexDegrees(
  a: CoordinatesNumber,
  b: CoordinatesNumber,
  c: CoordinatesNumber,
): number {
  const b1 = bearing(point(b), point(a));
  const b2 = bearing(point(b), point(c));
  let angle = Math.abs(b1 - b2);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

/**
 * Clockwise start/end bearings spanning the *smaller* angle at B
 * (turf.lineArc draws clockwise from bearing1 → bearing2).
 */
export function smallerAngleArcBearings(
  a: CoordinatesNumber,
  b: CoordinatesNumber,
  c: CoordinatesNumber,
): { bearing1: number; bearing2: number; bisector: number } {
  const b1 = bearing(point(b), point(a));
  const b2 = bearing(point(b), point(c));
  const cw = (b2 - b1 + 360) % 360;
  if (cw <= 180) {
    return {
      bearing1: b1,
      bearing2: b2,
      bisector: (b1 + cw / 2 + 360) % 360,
    };
  }
  const cw2 = (b1 - b2 + 360) % 360;
  return {
    bearing1: b2,
    bearing2: b1,
    bisector: (b2 + cw2 / 2 + 360) % 360,
  };
}

/** Arc radius in km: ~28% of the shorter arm (keeps label inside the wedge at any zoom). */
export function angleArcRadiusKm(
  a: CoordinatesNumber,
  b: CoordinatesNumber,
  c: CoordinatesNumber,
): number {
  const d1 = distance(point(b), point(a), { units: 'kilometers' });
  const d2 = distance(point(b), point(c), { units: 'kilometers' });
  const shorter = Math.min(d1, d2);
  if (!(shorter > 0)) return 0;
  return Math.max(shorter * 0.28, shorter * 0.15);
}

/**
 * Measure the angle formed by three points (vertex is the middle point).
 */
export class MeasureAngle extends Measure {
  get name(): string {
    return 'Measure Angle';
  }

  override get type(): string {
    return 'angle';
  }

  override get setting() {
    return { maxLength: 3 };
  }

  override add(coordinate: CoordinatesNumber): void {
    if (this.value.length > 2) {
      this.value = this.value.slice(0, 2);
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

    if (this.coordinates.length === 2) {
      result.features = [lineString(this.coordinates)];
      return result;
    }

    const [a, b, c] = this.coordinates;
    const angle = angleAtVertexDegrees(a, b, c);
    const reflex = 360 - angle;
    const prefs = getMeasurementLabelPrefs();
    const angleText = `${angle.toFixed(2)} °`;
    const arms = lineString(this.coordinates);
    const drawn: Feature[] = [arms];

    const radiusKm = angleArcRadiusKm(a, b, c);
    if (radiusKm > 0 && angle > 0) {
      const { bearing1, bearing2, bisector } = smallerAngleArcBearings(a, b, c);
      const arc = lineArc(point(b), radiusKm, bearing1, bearing2, {
        units: 'kilometers',
        steps: Math.max(16, Math.ceil(angle / 3)),
      }) as Feature<LineString>;
      drawn.push(arc);

      if (prefs.showResultLabel) {
        const labelFeature = destination(point(b), radiusKm, bisector, {
          units: 'kilometers',
        }) as Feature<Point>;
        labelFeature.properties = {
          is_label: true,
          is_center: true,
          is_result: true,
          text: angleText,
        };
        result.features_label = [labelFeature];
      }
    } else if (prefs.showResultLabel) {
      result.features_label = [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: b },
          properties: {
            is_label: true,
            is_result: true,
            text: angleText,
          },
        },
      ];
    }

    result.features = drawn;
    result.value = angle;
    result.format = angleText;
    result.fields = [
      {
        trans: 'map.measurement.setting.angle',
        value: angleText,
      },
      {
        trans: 'map.measurement.setting.angle-reflex',
        value: `${reflex.toFixed(2)} °`,
      },
    ];

    return result;
  }
}
