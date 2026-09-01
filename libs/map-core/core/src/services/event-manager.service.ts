/**
 * Framework-agnostic event management service
 * Handles event operations, state management, and events
 */

import type { AnyIEvent, MapEventStore, MittTypeMapEvent } from '../types';
import { MittTypeMapEventEventKey as EventKey } from '../types';
import type { Emitter } from 'mitt';
import type { LoggerFunction } from '../store/interface';

/** Normalize event `from` to kebab-case (Vue/React parity). */
export function normalizeEventFrom(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

/**
 * Event manager service
 * Provides framework-agnostic event management
 * Core is single source of truth for state
 */
export class EventManager {
  constructor(
    private mapId: string,
    private store: MapEventStore,
    private emitter: Emitter<MittTypeMapEvent>,
    private logger?: LoggerFunction,
  ) {}

  /**
   * Get all events
   * Core is single source of truth
   */
  getItems(): AnyIEvent[] {
    return this.store.items;
  }

  /**
   * Get current event by key
   * Core is single source of truth
   */
  getCurrent(key?: string): AnyIEvent | undefined {
    if (!key) {
      // Return first current event if no key specified
      const keys = Object.keys(this.store.current);
      return keys.length > 0 ? this.store.current[keys[0]] : undefined;
    }
    return this.store.current[key];
  }

  /**
   * Check if an event is active
   *
   * @param eventId - Event ID to check
   * @returns true if event is active
   */
  isActive(eventId: string): boolean {
    const current = this.getCurrent();
    return !!current && current.id === eventId;
  }

  /**
   * Add event to the list
   * Updates core state and emits events
   *
   * @param event - Event to add
   * @param componentName - Component name (optional, for logging)
   */
  add(event: AnyIEvent, componentName?: string): void {
    if (this.logger) {
      this.logger(this.mapId, 'debug', 'add', { event, componentName });
    }

    const rawFrom = event.from || componentName;
    if (rawFrom) {
      event.from = normalizeEventFrom(rawFrom);
    }

    // Update core state (single source of truth)
    this.store.items.unshift(event);

    // Emit events for subscribers
    this.emitter.emit(EventKey.add, event);
    this.emitter.emit(EventKey.setItems, this.store.items);
  }

  /**
   * Remove event from the list
   * Updates core state and emits events
   *
   * @param event - Event to remove
   */
  remove(event: AnyIEvent): void {
    if (this.logger) {
      this.logger(this.mapId, 'debug', 'remove', { event });
    }

    if (!this.store || !this.store.items || this.store.items.length < 1) {
      return;
    }

    const eventIndex = this.store.items.findIndex((x) => x.id === event.id);
    if (eventIndex < 0) {
      return;
    }

    // Update core state
    this.store.items.splice(eventIndex, 1);

    // Emit events for subscribers
    this.emitter.emit(EventKey.remove, event);
    this.emitter.emit(EventKey.setItems, this.store.items);
  }

  /**
   * Set current event
   * Updates core state and emits event
   *
   * @param event - Event to set as current (or undefined to clear)
   * @param key - Optional key for current event
   */
  setCurrent(event: AnyIEvent | undefined | null, key?: string): void {
    const eventKey = key || event?.id || 'default';

    // Update core state
    if (event) {
      this.store.current[eventKey] = event;
    } else {
      delete this.store.current[eventKey];
    }

    // Emit event for subscribers
    this.emitter.emit(EventKey.setCurrent, event || undefined);
  }
}
