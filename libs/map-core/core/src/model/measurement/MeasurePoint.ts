/**
 * Framework-agnostic point measurement class
 */

import { point } from '@turf/turf';
import type { Feature } from 'geojson';
import type { CoordinatesNumber, CrsItem, IViewSetting } from '../../types';
import { lookupProj4CrsItem } from '../../utils/proj4-crs-catalog';
import { formatCoordinate } from '../../utils';
import { Measure } from './Measure';

function enrichCrsItem(crs: CrsItem): CrsItem {
  if (crs.proj4js) return crs;
  const resolved = lookupProj4CrsItem(crs.epsg);
  if (!resolved?.proj4js) return crs;
  return { ...crs, proj4js: resolved.proj4js, unit: crs.unit ?? resolved.unit };
}

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
    const formatOptions = { precision: null as null };

    const temp = formatCoordinate(
      { longitude: lng, latitude: lat },
      undefined,
      false,
      formatOptions.precision,
    );
    if (temp) result.value = `${temp.longitude}, ${temp.latitude}`;

    const crsDefault = crsItems.find((x) => x.default);
    result.fields = [
      {
        trans: crsDefault?.name,
        value: result.value,
      },
    ];

    crsItems
      .filter((x) => !x.default)
      .forEach((crs) => {
        const enriched = enrichCrsItem(crs);
        const pointFormatted = formatCoordinate(
          { longitude: lng, latitude: lat },
          enriched,
          false,
          formatOptions.precision,
        );
        if (pointFormatted) {
          result.fields?.push({
            trans: enriched.name || `EPSG:${enriched.epsg}`,
            value: `${pointFormatted.longitude}, ${pointFormatted.latitude}`,
          });
        }
      });

    result.features_label = [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: this.coordinates[0],
        },
        properties: {
          is_label: true,
          text: result.value,
        },
      },
    ];

    return result;
  }
}
