import { MapControlButton } from '@hungpvq/react-map-core';
import type { LogLevel } from '@hungpvq/shared-log';
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

type LevelFilter = 'all' | 'error' | 'warn' | 'info' | 'debug';

const LEVEL_FILTERS: LevelFilter[] = [
  'all',
  'error',
  'warn',
  'info',
  'debug',
];

const GROUP_LEVELS = new Set<LogLevel>(['groupCollapsed', 'groupEnd']);
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString();
}

function isObject(val: unknown) {
  return val !== null && typeof val === 'object';
}

function formatArg(arg: unknown) {
  if (typeof arg === 'string') return arg;
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}

function namespaceKey(log: LogEntry) {
  return log.namespaces.join(':');
}

function namespaceParts(namespaces: string[]) {
  if (namespaces.length > 1 && UUID_RE.test(namespaces[0])) {
    return {
      full: namespaces.join(':'),
      path: namespaces.slice(1).join(':'),
    };
  }
  return {
    full: namespaces.join(':'),
    path: namespaces.join(':'),
  };
}

function displayNamespace(full: string) {
  const parts = full.split(':');
  if (parts.length > 1 && UUID_RE.test(parts[0])) {
    return parts.slice(1).join(':');
  }
  return full;
}

function entryText(log: LogEntry) {
  return [
    log.level,
    namespaceKey(log),
    ...log.args.map((arg) => formatArg(arg)),
  ]
    .join(' ')
    .toLowerCase();
}

function formatEntryForCopy(log: LogEntry) {
  const ns = namespaceKey(log);
  const args = log.args
    .map((arg) => {
      if (typeof arg === 'string') return arg;
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    })
    .join(' ');
  return `${formatTime(log.timestamp)} [${(log.level || 'unknown').toUpperCase()}]${ns ? ` [${ns}]` : ''} ${args}`.trim();
}

async function copyText(text: string) {
  try {
    await navigator.clipboard?.writeText(text);
  } catch {
    // ignore clipboard failure
  }
}

function logMapId(log: LogEntry): string | null {
  if (log.namespaces.length > 0 && UUID_RE.test(log.namespaces[0])) {
    return log.namespaces[0];
  }
  return null;
}

function shortMapId(id: string) {
  return id.length > 13 ? `${id.slice(0, 8)}…` : id;
}

function filterLogs(
  logs: LogEntry[],
  search: string,
  level: LevelFilter,
  namespace: string,
  mapId: string,
  mapIdCount: number,
): LogEntry[] {
  const q = search.trim().toLowerCase();
  const mapFilterActive = mapIdCount > 1 && mapId !== 'all';
  const hasFilter =
    Boolean(q) || level !== 'all' || namespace !== 'all' || mapFilterActive;

  return logs.filter((log) => {
    if (GROUP_LEVELS.has(log.level)) {
      return !hasFilter;
    }
    if (level !== 'all' && log.level !== level) return false;
    if (mapFilterActive && logMapId(log) !== mapId) return false;
    if (namespace !== 'all' && namespaceKey(log) !== namespace) return false;
    if (q && !entryText(log).includes(q)) return false;
    return true;
  });
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
        collapsed: true,
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

function collectStructuredLogs(items: StructuredItem[]): LogEntry[] {
  const out: LogEntry[] = [];
  for (const item of items) {
    if (item.type === 'log') out.push(item.log);
    else out.push(...collectStructuredLogs(item.children));
  }
  return out;
}

function LogRenderItem({
  item,
  onNamespaceClick,
}: {
  item: StructuredItem;
  onNamespaceClick: (ns: string) => void;
}) {
  if (item.type === 'group') {
    return (
      <GroupItem title={item.title} collapsed={item.collapsed}>
        {item.children.map((child) => (
          <LogRenderItem
            key={child.id}
            item={child}
            onNamespaceClick={onNamespaceClick}
          />
        ))}
      </GroupItem>
    );
  }

  const { log } = item;
  const ns = namespaceParts(log.namespaces);
  const textArgs = log.args.filter((arg) => !isObject(arg)).map(formatArg);
  const objects = log.args.filter(isObject);
  const message = textArgs.join(' ');
  const levelLetter = (log.level || '?').charAt(0).toUpperCase();

  return (
    <div className={`log-entry log-entry--${log.level}`}>
      <div className="log-entry__row">
        <span className="log-entry__time">{formatTime(log.timestamp)}</span>
        <span
          className="log-entry__level"
          title={(log.level || 'unknown').toUpperCase()}
        >
          {levelLetter}
        </span>
        <div className="log-entry__content">
          {message ? <span className="log-entry__msg">{message}</span> : null}
          {ns.path ? (
            <button
              type="button"
              className="log-entry__ns"
              title={ns.full}
              onClick={() => onNamespaceClick(ns.full)}
            >
              {ns.path}
            </button>
          ) : null}
        </div>
        <MapControlButton
          variant="text"
          size="small"
          className="log-entry__copy"
          onClick={() => void copyText(formatEntryForCopy(log))}
        >
          Copy
        </MapControlButton>
      </div>
      {objects.length > 0 ? (
        <div className="log-entry__objects">
          {objects.map((arg, index) => (
            <div key={index} className="log-entry__object">
              <TreeItem data={arg} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function LogViewer() {
  const { logs } = useDevtoolState();
  const logListRef = useRef<HTMLDivElement | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [paused, setPaused] = useState(false);
  const [frozenLogs, setFrozenLogs] = useState<LogEntry[] | null>(null);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState<LevelFilter>('all');
  const [namespace, setNamespace] = useState('all');
  const [mapId, setMapId] = useState('all');

  const sourceLogs = paused && frozenLogs ? frozenLogs : logs;
  const newCount = useMemo(() => {
    if (!paused || !frozenLogs) return 0;
    const frozenIds = new Set(frozenLogs.map((l) => l.id));
    return logs.reduce((n, l) => n + (frozenIds.has(l.id) ? 0 : 1), 0);
  }, [paused, frozenLogs, logs]);

  const mapIds = useMemo(() => {
    const set = new Set<string>();
    for (const log of logs) {
      if (GROUP_LEVELS.has(log.level)) continue;
      const id = logMapId(log);
      if (id) set.add(id);
    }
    return [...set].sort();
  }, [logs]);

  useEffect(() => {
    if (mapId !== 'all' && !mapIds.includes(mapId)) {
      setMapId('all');
    }
  }, [mapIds, mapId]);

  const namespaces = useMemo(() => {
    const set = new Set<string>();
    const mapFilterActive = mapIds.length > 1 && mapId !== 'all';
    for (const log of logs) {
      if (GROUP_LEVELS.has(log.level)) continue;
      if (mapFilterActive && logMapId(log) !== mapId) continue;
      const key = namespaceKey(log);
      if (key) set.add(key);
    }
    return [...set].sort();
  }, [logs, mapIds.length, mapId]);

  useEffect(() => {
    if (namespace !== 'all' && !namespaces.includes(namespace)) {
      setNamespace('all');
    }
  }, [namespaces, namespace]);

  const filteredLogs = useMemo(
    () =>
      filterLogs(sourceLogs, search, level, namespace, mapId, mapIds.length),
    [sourceLogs, search, level, namespace, mapId, mapIds.length],
  );

  const structuredLogs = useMemo(
    () => buildStructuredLogs(filteredLogs),
    [filteredLogs],
  );

  const showingCount = useMemo(
    () => filteredLogs.filter((l) => !GROUP_LEVELS.has(l.level)).length,
    [filteredLogs],
  );

  const totalCount = useMemo(
    () => sourceLogs.filter((l) => !GROUP_LEVELS.has(l.level)).length,
    [sourceLogs],
  );

  const hasActiveFilter =
    search.trim().length > 0 ||
    level !== 'all' ||
    namespace !== 'all' ||
    (mapIds.length > 1 && mapId !== 'all');

  useEffect(() => {
    if (!autoScroll || paused) return;

    requestAnimationFrame(() => {
      const list = logListRef.current;
      if (list) list.scrollTop = 0;
    });
  }, [logs.length, autoScroll, paused]);

  function togglePause() {
    if (paused) {
      setPaused(false);
      setFrozenLogs(null);
      return;
    }
    setFrozenLogs([...logs]);
    setPaused(true);
  }

  function onClear() {
    if (paused) {
      setPaused(false);
      setFrozenLogs(null);
    }
    clearDevtoolLogs();
  }

  function copyVisible() {
    const entries = collectStructuredLogs(structuredLogs);
    void copyText(entries.map(formatEntryForCopy).join('\n'));
  }

  return (
    <div className="log-viewer">
      <div className="log-viewer__toolbar">
        <div className="log-viewer__toolbar-row">
          <input
            type="search"
            className="log-viewer__search"
            placeholder="Search"
            aria-label="Search logs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {mapIds.length > 1 ? (
            <select
              className="log-viewer__mapid"
              aria-label="Filter by mapId"
              value={mapId}
              onChange={(e) => setMapId(e.target.value)}
            >
              <option value="all">All maps</option>
              {mapIds.map((id) => (
                <option key={id} value={id}>
                  {shortMapId(id)}
                </option>
              ))}
            </select>
          ) : null}
          <select
            className="log-viewer__namespace"
            aria-label="Filter by namespace"
            value={namespace}
            onChange={(e) => setNamespace(e.target.value)}
          >
            <option value="all">All namespaces</option>
            {namespaces.map((ns) => (
              <option key={ns} value={ns}>
                {displayNamespace(ns)}
              </option>
            ))}
          </select>
          <span className="log-viewer__count">
            {showingCount}/{totalCount}
          </span>
        </div>
        <div className="log-viewer__toolbar-row">
          <div className="log-viewer__levels" role="group" aria-label="Level filter">
            {LEVEL_FILTERS.map((item) => (
              <MapControlButton
                key={item}
                variant="text"
                size="small"
                active={level === item}
                onClick={() => setLevel(item)}
              >
                {item}
              </MapControlButton>
            ))}
          </div>
          <div className="log-viewer__actions">
            <MapControlButton
              onClick={togglePause}
              variant="text"
              size="small"
            >
              {paused
                ? newCount > 0
                  ? `Resume (${newCount})`
                  : 'Resume'
                : 'Pause'}
            </MapControlButton>
            <MapControlButton onClick={copyVisible} variant="text" size="small">
              Copy visible
            </MapControlButton>
            <MapControlButton onClick={onClear} variant="text" size="small">
              Clear
            </MapControlButton>
            <label className="log-viewer__autoscroll">
              <input
                type="checkbox"
                checked={autoScroll}
                disabled={paused}
                onChange={(event) => setAutoScroll(event.target.checked)}
              />{' '}
              Auto-scroll
            </label>
          </div>
        </div>
      </div>
      <div className="log-viewer__list" ref={logListRef}>
        {structuredLogs.length === 0 ? (
          <div className="log-viewer__empty">
            {sourceLogs.length === 0
              ? 'No logs'
              : hasActiveFilter
                ? 'No matching logs'
                : 'No logs'}
          </div>
        ) : (
          structuredLogs.map((item) => (
            <LogRenderItem
              key={item.id}
              item={item}
              onNamespaceClick={setNamespace}
            />
          ))
        )}
      </div>
    </div>
  );
}
