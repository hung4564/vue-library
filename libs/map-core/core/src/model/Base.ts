import { getMapUUIDv4 } from '../utils/uuid';

/**
 * Base class for map-related entities.
 * Provides a unique ID for each instance.
 */
export class Base {
  protected _id: string;

  /**
   * Get the unique ID of this instance
   */
  get id(): string {
    return this._id;
  }

  constructor(id?: string) {
    this._id = id || this.generateId();
  }

  private generateId(): string {
    return getMapUUIDv4();
  }
}
