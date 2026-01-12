/**
 * Framework-agnostic measurement service
 */

import { area, length } from '@turf/turf';
import type { Feature } from 'geojson';
import { formatAreaText, formatDistanceText } from '../utils';

/**
 * Service for measurement operations
 */
export class MeasurementService {
  /**
   * Calculate distance from a line feature using Turf.js
   *
   * @param feature - GeoJSON LineString feature
   * @returns Distance in kilometers
   */
  static calculateDistance(feature: Feature): number {
    try {
      if (feature.geometry.type !== 'LineString') {
        return 0;
      }
      return length(feature, { units: 'kilometers' });
    } catch (error) {
      console.error('Failed to calculate distance:', error);
      return 0;
    }
  }

  /**
   * Calculate area from a polygon feature using Turf.js
   *
   * @param feature - GeoJSON Polygon feature
   * @returns Area in square meters
   */
  static calculateArea(feature: Feature): number {
    try {
      if (feature.geometry.type !== 'Polygon') {
        return 0;
      }
      return area(feature);
    } catch (error) {
      console.error('Failed to calculate area:', error);
      return 0;
    }
  }

  /**
   * Format measurement value with units
   * Uses the utility functions from map-core for consistent formatting
   *
   * @param value - Measurement value
   * @param type - Type of measurement ('distance' or 'area')
   * @param locales - Locale string for number formatting (default: 'vi')
   * @returns Formatted string with units
   */
  static formatMeasurement(
    value: number,
    type: 'distance' | 'area',
    locales = 'vi',
  ): string {
    try {
      if (type === 'distance') {
        // value should be in kilometers for formatDistanceText
        return formatDistanceText(value, locales);
      } else {
        // value should be in square meters for formatAreaText
        return formatAreaText(value, locales);
      }
    } catch (error) {
      console.error('Failed to format measurement:', error);
      return '0';
    }
  }
}
