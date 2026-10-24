import type { LiveTraceEvent } from './types';

const MAX_EVENTS = 2_000;

const events: LiveTraceEvent[] = [];
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function traceLiveEvent(
  event: Omit<LiveTraceEvent, 'ts'> & { ts?: number },
): void {
  events.unshift({
    ...event,
    ts: event.ts ?? Date.now(),
  });
  if (events.length > MAX_EVENTS) events.length = MAX_EVENTS;
  notify();
}

export function getLiveTraceEvents(): LiveTraceEvent[] {
  return events;
}

export function clearLiveTraceEvents(): void {
  events.length = 0;
  notify();
}

export function subscribeLiveTrace(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function resetLiveTraceForTests(): void {
  events.length = 0;
  listeners.clear();
}
