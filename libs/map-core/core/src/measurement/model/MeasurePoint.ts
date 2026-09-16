/**
 * Framework-agnostic point measurement class
 */

import { point } from '@turf/turf';
import type { Feature } from 'geojson';
import type { CoordinatesNumber } from '../../types';

import { enrichCrsItemProjection } from '../../crs/crs-catalog';
import type { CrsItem } from '../../crs/types';
import { IViewSetting } from '../types';
import { getMeasurementLabelPrefs } from '../utils';
import { formatCoordinate } from '../../utils/coordinate';
import { Measure } from './Measure';

/**
 * Class for measuring a single point with coordinate formatting
 */
export class MeasurePoint extends Measure {
  protected getCrsItems: () => CrsItem[];

  constructor(crs_items: CrsItem[] | (() => CrsItem[])) {
    super();
    this.getCrsItems =
      typeof crs_items === 'function' ? crs_items : () => crs_items.slice();
  }

  setCrsItems(crs_items: CrsItem[]) {
    this.getCrsItems = () => crs_items.slice();
  }

  get name(): string {
    return 'Measure Point';
  }

  override get type(): string {
    return 'point';
  }

  override get setting() {
    return { maxLength: 1 };
  }

  /**
   * Add coordinate (only one point allowed)
   *
   * @param coordinate - Coordinate to add
   */
  override add(coordinate: CoordinatesNumber): void {
    if (this.value.length > 0) {
      this.value = [];
    }
    this.value.push(coordinate);
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

    result.features = [point(this.coordinates[0])];
    const lng = this.coordinates[0][0];
    const lat = this.coordinates[0][1];
    const crsItems = this.getCrsItems();

    const temp = formatCoordinate(
      { longitude: lng, latitude: lat },
      undefined,
      false,
    );
    if (temp) result.value = `${temp.longitude}, ${temp.latitude}`;

    const crsDefault = crsItems.find((x) => x.default);
    result.fields = [
      {
        text: crsDefault ? `EPSG:${crsDefault.epsg}` : 'EPSG:4326',
        value: result.value,
      },
    ];

    crsItems
      .filter((x) => !x.default)
      .forEach((crs) => {
        const enriched = enrichCrsItemProjection(crs);
        const pointFormatted = formatCoordinate(
          { longitude: lng, latitude: lat },
          enriched,
          false,
        );
        if (pointFormatted) {
          result.fields?.push({
            text: `EPSG:${enriched.epsg}`,
            value: `${pointFormatted.longitude}, ${pointFormatted.latitude}`,
          });
        }
      });

    result.features_label = getMeasurementLabelPrefs().showResultLabel
      ? [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: this.coordinates[0],
            },
            properties: {
              is_label: true,
              is_result: true,
              text: result.value,
            },
          },
        ]
      : [];

    return result;
  }
}
