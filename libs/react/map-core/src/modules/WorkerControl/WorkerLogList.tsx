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

/** Newest-on-top log list — stick to top while following; else keep viewport stable. */
export const WorkerLogList = memo(
  function WorkerLogList({ logs, compact }: WorkerLogListProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const savedScrollTop = useRef(0);
    const savedScrollHeight = useRef(0);
    const stickToLatest = useRef(true);

    const el = rootRef.current;
    if (el) {
      savedScrollTop.current = el.scrollTop;
      savedScrollHeight.current = el.scrollHeight;
      stickToLatest.current = el.scrollTop <= 8;
    }

    useLayoutEffect(() => {
      const node = rootRef.current;
      if (!node) return;
      if (stickToLatest.current) {
        node.scrollTop = 0;
        return;
      }
      const delta = node.scrollHeight - savedScrollHeight.current;
      node.scrollTop = savedScrollTop.current + Math.max(0, delta);
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
