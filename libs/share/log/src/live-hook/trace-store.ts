import type { DebugHeader, DebugRecord, LiveData } from '../core/types';
import { getUUIDv4 } from '../core/uuid';
import { getLogDebugStore } from '../debug/store';

const MAX_EVENTS = 2_000;

function notify() {
  for (const listener of getLogDebugStore().liveListeners) listener();
}

export function emitLiveRecord(
  data: LiveData,
  header?: Partial<DebugHeader>,
): DebugRecord<LiveData> {
  const bag = getLogDebugStore();
  const record: DebugRecord<LiveData> = {
    id: getUUIDv4(),
    header: {
      ts: Date.now(),
      kind: 'live',
      namespaces: [`live:${data.component}`],
      level: 'debug',
      span: data.event,
      fn: data.component,
      ...header,
    },
    data,
  };
  bag.liveEvents.unshift(record);
  if (bag.liveEvents.length > MAX_EVENTS) bag.liveEvents.length = MAX_EVENTS;
  notify();
  return record;
}

export function getLiveTraceEvents(): DebugRecord<LiveData>[] {
  return getLogDebugStore().liveEvents;
}

export function clearLiveTraceEvents(): void {
  getLogDebugStore().liveEvents.length = 0;
  notify();
}

export function subscribeLiveTrace(listener: () => void): () => void {
  const bag = getLogDebugStore();
  bag.liveListeners.add(listener);
  return () => {
    bag.liveListeners.delete(listener);
  };
}

export function resetLiveTraceForTests(): void {
  const bag = getLogDebugStore();
  bag.liveEvents.length = 0;
  bag.liveListeners.clear();
}
