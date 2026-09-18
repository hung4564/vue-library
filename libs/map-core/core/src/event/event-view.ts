import type { IEvent } from './model/Event';

/**
 * Whether `event` is the active listener for its `event_map_type`.
 */
export function isEventActive(
  current: Record<string, IEvent | undefined>,
  event: IEvent,
): boolean {
  const currentCheck = current[event.event_map_type];
  return !!(currentCheck && currentCheck.id === event.id);
}

/**
 * Group events by `event_map_type` (EventManagementControl list UI).
 */
export function groupEventsByMapType(
  events: readonly IEvent[],
): Record<string, IEvent[]> {
  const groups: Record<string, IEvent[]> = {};
  for (const view of events) {
    const type = view.event_map_type;
    if (!groups[type]) groups[type] = [];
    groups[type].push(view);
  }
  return groups;
}
