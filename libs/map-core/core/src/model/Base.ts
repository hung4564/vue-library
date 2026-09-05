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
    // If ID is provided, use it; otherwise generate one
    // Note: In actual implementation, you might want to use a UUID library
    // For now, using timestamp + random for simplicity
    this._id = id || this.generateId();
  }

  /**
   * Generate a unique ID
   * In actual implementation, this should use @hungpvq/shared getUUIDv4()
   * or similar UUID library
   */
  private generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for environments without crypto.randomUUID
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
