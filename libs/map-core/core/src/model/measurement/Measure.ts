/**
 * Framework-agnostic base class for measurement operations
 */

import type { CoordinatesNumber, IViewSetting } from '../../types';

/**
 * Helper function to find first invalid coordinate index
 */
function getFirstIndexNotValid(coordinates: CoordinatesNumber[] = []): number {
  return coordinates.findIndex((value) => !value[0] || !value[1]);
}

/**
 * Base class for all measurement types
 * Provides common functionality for coordinate management and measurement operations
 */
export class Measure {
  public value: CoordinatesNumber[];

  constructor() {
    this.value = [];
  }

  /**
   * Get the measurement type identifier
   * Override in subclasses
   */
  get type(): string | null {
    return null;
  }

  /**
   * Get measurement-specific settings
   * Override in subclasses
   */
  get setting(): any {
    return {};
  }

  /**
   * Get valid coordinates (filter out null/undefined values)
   */
  get coordinates(): CoordinatesNumber[] {
    return this.value.filter((x) => x[0] != null && x[1] != null);
  }

  /**
   * Start measurement (placeholder for subclasses)
   */
  start(): void {
    return;
  }

  /**
   * Add a coordinate to the measurement
   * Replaces invalid coordinates if any, otherwise appends
   *
   * @param coordinate - Coordinate to add
   */
  add(coordinate: CoordinatesNumber): void {
    const index = getFirstIndexNotValid(this.value);
    if (index >= 0) {
      this.value[index] = coordinate;
    } else {
      this.value.push(coordinate);
    }
  }

  /**
   * Initialize measurement with coordinates
   *
   * @param coordinates - Array of coordinates
   */
  init(coordinates: CoordinatesNumber[]): void {
    this.value = coordinates;
  }

  /**
   * Get measurement result
   * Override in subclasses to provide specific calculation logic
   *
   * @returns Measurement result as IViewSetting
   */
  getResult(): IViewSetting {
    return {};
  }

  /**
   * Reset measurement (clear all coordinates)
   */
  reset(): void {
    this.value = [];
  }

  /**
   * Destroy measurement (cleanup)
   */
  destroy(): void {
    this.value = [];
  }
}
