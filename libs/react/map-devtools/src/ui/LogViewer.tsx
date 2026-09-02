import { BaseButton } from '@hungpvq/react-map-core';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { LogEntry } from '../log-adapter';
import { clearDevtoolLogs } from '../store';
import { useDevtoolState } from '../useDevtoolState';
import { GroupItem } from './GroupItem';
import { TreeItem } from './TreeItem';

type StructuredGroup = {
  id: string;
  type: 'group';
  title: string;
  collapsed: boolean;
  children: StructuredItem[];
};

type StructuredLog = {
  id: string;
  type: 'log';
  log: LogEntry;
};

type StructuredItem = StructuredGroup | StructuredLog;

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString();
}

function isObject(val: unknown) {
  return val !== null && typeof val === 'object';
}

function formatArg(arg: unknown) {
  return String(arg);
}

function buildStructuredLogs(logs: LogEntry[]): StructuredItem[] {
  const stack: StructuredGroup[] = [];
  const root: StructuredItem[] = [];

  logs.forEach((log) => {
    if (log.level === 'groupCollapsed') {
      const group: StructuredGroup = {
        id: log.id,
        type: 'group',
        title: log.args.map((arg) => String(arg)).join(' '),
        collapsed: log.level === 'groupCollapsed',
        children: [],
      };

      if (stack.length > 0) {
        stack[stack.length - 1].children.push(group);
      } else {
        root.push(group);
      }

      stack.push(group);
      return;
    }

    if (log.level === 'groupEnd') {
      stack.pop();
      return;
    }

    const entry: StructuredLog = { id: log.id, type: 'log', log };

    if (stack.length > 0) {
      stack[stack.length - 1].children.push(entry);
    } else {
      root.push(entry);
    }
  });

  return root;
}

function LogRenderItem({ item }: { item: StructuredItem }) {
  if (item.type === 'group') {
    return (
      <GroupItem title={item.title} collapsed={item.collapsed}>
        {item.children.map((child) => (
          <LogRenderItem key={child.id} item={child} />
        ))}
      </GroupItem>
    );
  }

  const { log } = item;

  return (
    <div className={`log-entry log-entry--${log.level}`}>
      <div className="log-entry__header">
        <span className="log-entry__timestamp">{formatTime(log.timestamp)}</span>
        <span className="log-entry__level">
          [{(log.level || 'unknown').toUpperCase()}]
        </span>
        {log.namespaces.length > 0 ? (
          <span className="log-entry__namespaces">
            [{log.namespaces.join(':')}]
          </span>
        ) : null}
      </div>
      <div className="log-entry__args">
        {log.args.map((arg, index) =>
          isObject(arg) ? (
            <div key={index} className="log-entry__arg-object">
              <TreeItem data={arg} />
            </div>
          ) : (
            <span key={index}>{formatArg(arg)}</span>
          ),
        )}
      </div>
    </div>
  );
}

export function LogViewer() {
  const { logs } = useDevtoolState();
  const logListRef = useRef<HTMLDivElement | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const structuredLogs = useMemo(() => buildStructuredLogs(logs), [logs]);

  useEffect(() => {
    if (!autoScroll) return;

    requestAnimationFrame(() => {
      const list = logListRef.current;
      if (list) list.scrollTop = 0;
    });
  }, [logs.length, autoScroll]);

  return (
    <div className="log-viewer">
      <div className="log-viewer__controls">
        <BaseButton onClick={clearDevtoolLogs}>Clear</BaseButton>
        <label>
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(event) => setAutoScroll(event.target.checked)}
          />{' '}
          Auto-scroll
        </label>
      </div>
      <div className="log-viewer__list" ref={logListRef}>
        {structuredLogs.map((item) => (
          <LogRenderItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
