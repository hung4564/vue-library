/**
 * Framework-agnostic event management service
 * Handles event operations, state management, and events
 */

import type { Emitter } from 'mitt';

import type { LoggerFunction } from '../store/interface';
import type { AnyIEvent, MapEventStore, MittTypeMapEvent } from './types';
import { MittTypeMapEventEventKey as EventKey } from './types';

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

/** Compact fields for Devtools log message + payload. */
function summarizeEvent(
  event: AnyIEvent,
  extra?: { componentName?: string },
): {
  id: string;
  event_map_type: string;
  type_select: string;
  from?: string;
  name?: string;
  componentName?: string;
} {
  return {
    id: event.id,
    event_map_type: event.event_map_type,
    type_select: event.type_select,
    from: event.from,
    name: event.name,
    ...(extra?.componentName ? { componentName: extra.componentName } : {}),
  };
}

function formatEventAction(
  action: 'add' | 'remove',
  event: AnyIEvent,
  extra?: { componentName?: string; removed?: boolean; remaining?: number },
): string {
  const from = event.from || extra?.componentName || '?';
  const name = event.name ? ` name=${event.name}` : '';
  const type = event.event_map_type || '?';
  const select = event.type_select || '?';
  let msg = `${action} ${type} (${select}) from=${from} id=${event.id}${name}`;
  if (action === 'remove' && extra?.removed !== undefined) {
    msg += extra.removed
      ? ` removed remaining=${extra.remaining ?? 0}`
      : ' skipped (not in store)';
  }
  return msg;
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
    const rawFrom = event.from || componentName;
    if (rawFrom) {
      event.from = normalizeEventFrom(rawFrom);
    }

    this.logger?.(
      this.mapId,
      'debug',
      formatEventAction('add', event, { componentName }),
      {
        event: summarizeEvent(event, { componentName }),
        items: this.store.items.length + 1,
      },
    );

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
    if (!this.store?.items?.length) {
      this.logger?.(
        this.mapId,
        'debug',
        formatEventAction('remove', event, { removed: false }),
        { event: summarizeEvent(event), removed: false, remaining: 0 },
      );
      return;
    }

    const eventIndex = this.store.items.findIndex((x) => x.id === event.id);
    if (eventIndex < 0) {
      this.logger?.(
        this.mapId,
        'debug',
        formatEventAction('remove', event, { removed: false }),
        {
          event: summarizeEvent(event),
          removed: false,
          remaining: this.store.items.length,
        },
      );
      return;
    }

    this.store.items.splice(eventIndex, 1);
    const remaining = this.store.items.length;

    this.logger?.(
      this.mapId,
      'debug',
      formatEventAction('remove', event, { removed: true, remaining }),
      { event: summarizeEvent(event), removed: true, remaining },
    );

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
