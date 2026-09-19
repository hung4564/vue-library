import {
  formatWorkerLogTime,
  type WorkerLogEntry,
} from '@hungpvq/map-core';
import { memo, useLayoutEffect, useRef } from 'react';

export interface WorkerLogListProps {
  logs: WorkerLogEntry[];
  compact?: boolean;
}

function logsSignature(logs: WorkerLogEntry[]) {
  if (!logs.length) return '0';
  const first = logs[0];
  const last = logs[logs.length - 1];
  return `${logs.length}:${first.id}:${last.id}`;
}

/** Scroll-stable log list — parent re-renders on progress/elapsed should not jump scroll. */
export const WorkerLogList = memo(
  function WorkerLogList({ logs, compact }: WorkerLogListProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const savedScrollTop = useRef(0);

    // Capture before commit so progress/elapsed parent re-renders don't jump scroll.
    const el = rootRef.current;
    if (el) savedScrollTop.current = el.scrollTop;

    useLayoutEffect(() => {
      const node = rootRef.current;
      if (node) node.scrollTop = savedScrollTop.current;
    });

    return (
      <div
        ref={rootRef}
        className={`map-worker-control__log-list${compact ? ' is-compact' : ''}`}
      >
        {logs.map((entry) => (
          <div
            key={entry.id}
            className="map-worker-control__log"
            data-level={entry.level}
          >
            <span className="map-worker-control__log-time">
              {formatWorkerLogTime(entry.at)}
            </span>
            <span className="map-worker-control__log-level">{entry.level}</span>
            <span className="map-worker-control__log-message">
              {entry.message}
            </span>
          </div>
        ))}
      </div>
    );
  },
  (prev, next) =>
    prev.compact === next.compact &&
    logsSignature(prev.logs) === logsSignature(next.logs),
);
