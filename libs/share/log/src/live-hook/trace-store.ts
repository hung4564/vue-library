import mitt from 'mitt';

import type { LiveTraceEvent, TraceInput } from './types';

type TraceEvents = {
  'live:trace': LiveTraceEvent;
};

const emitter = mitt<TraceEvents>();

let enabled = true;
let consoleEnabled = true;
let nextEventId = 0;

function createEventId(): string {
  return `trace:${Date.now()}:${++nextEventId}`;
}

export function setLiveDebugEnabled(value: boolean): void {
  enabled = value;
}

export function isLiveDebugEnabled(): boolean {
  return enabled;
}

export function setLiveConsoleEnabled(value: boolean): void {
  consoleEnabled = value;
}

export function traceLiveEvent(input: TraceInput): LiveTraceEvent | undefined {
  if (!enabled) return undefined;

  const { context, ...data } = input;

  const event: LiveTraceEvent = {
    ...data,
    id: createEventId(),
    ts: Date.now(),
    actionId: context?.actionId ?? data.cause?.actionId,
    causeId: context?.causeId ?? data.cause?.causeId,
  };

  if (consoleEnabled) {
    console.log(
      `[LiveTrace][${event.framework}] ${event.event} ${event.component}`,
      event,
    );
  }

  emitter.emit('live:trace', event);

  return event;
}

export function subscribeLiveTrace(
  listener: (event: LiveTraceEvent) => void,
): () => void {
  emitter.on('live:trace', listener);

  return () => {
    emitter.off('live:trace', listener);
  };
}
