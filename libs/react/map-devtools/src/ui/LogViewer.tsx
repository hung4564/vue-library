import { MapControlButton, MapCopyButton } from '@hungpvq/react-map-core';
import {
  InputCheckbox,
  InputSelect,
  InputText,
} from '@hungpvq/react-map-core/fields';
import {
  formatDevtoolsLogEntryForCopy,
  type BufferingLogEntry as LogEntry,
} from '@hungpvq/map-core/devtools';
import {
  LEVEL_FILTERS,
  buildStructuredLogs,
  collectLogMapIds,
  collectNamespaces,
  collectStructuredLogs,
  countNewLogsWhilePaused,
  displayNamespace,
  filterLogs,
  formatArg,
  formatLogTime,
  isObject,
  levelLetter,
  namespaceParts,
  shortMapId,
  type LevelFilter,
  type StructuredItem,
} from '@hungpvq/map-debug';
import { useEffect, useMemo, useRef, useState } from 'react';
import { clearDevtoolLogs } from '../store';
import { useDevtoolState } from '../useDevtoolState';
import { GroupItem } from './GroupItem';
import { TreeItem } from './TreeItem';

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
  const letter = levelLetter(log.level);

  return (
    <div className={`log-entry log-entry--${log.level}`}>
      <div className="log-entry__row">
        <span className="log-entry__time">{formatLogTime(log.timestamp)}</span>
        <span
          className="log-entry__level"
          title={(log.level || 'unknown').toUpperCase()}
        >
          {letter}
        </span>
        <div className="log-entry__content">
          {message ? <span className="log-entry__msg">{message}</span> : null}
          {ns.path ? (
            <MapControlButton
              variant="text"
              size="small"
              className="log-entry__ns"
              title={ns.full}
              onClick={() => onNamespaceClick(ns.full)}
            >
              {ns.path}
            </MapControlButton>
          ) : null}
        </div>
        <MapCopyButton
          className="log-entry__copy"
          title="Copy log"
          value={formatDevtoolsLogEntryForCopy(log)}
        />
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
  const newCount = countNewLogsWhilePaused(logs, frozenLogs, paused);

  const mapIds = useMemo(() => collectLogMapIds(logs), [logs]);

  useEffect(() => {
    if (mapId !== 'all' && !mapIds.includes(mapId)) setMapId('all');
  }, [mapIds, mapId]);

  const namespaces = useMemo(
    () => collectNamespaces(logs, mapId, mapIds.length),
    [logs, mapId, mapIds.length],
  );

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

  const showingCount = collectStructuredLogs(structuredLogs).length;
  const totalCount = sourceLogs.filter(
    (l) => l.level !== 'groupCollapsed' && l.level !== 'groupEnd',
  ).length;

  const hasActiveFilter =
    Boolean(search.trim()) ||
    level !== 'all' ||
    namespace !== 'all' ||
    (mapIds.length > 1 && mapId !== 'all');

  const visibleCopyText = useMemo(
    () =>
      collectStructuredLogs(structuredLogs)
        .map(formatDevtoolsLogEntryForCopy)
        .join('\n'),
    [structuredLogs],
  );

  useEffect(() => {
    if (!autoScroll || paused) return;
    const list = logListRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [structuredLogs.length, autoScroll, paused]);

  useEffect(() => {
    const list = logListRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [search, level, namespace, mapId]);

  return (
    <div className="log-viewer">
      <div className="log-viewer__toolbar">
        <span className="log-viewer__count">
          {showingCount}/{totalCount}
        </span>
        <div
          className="log-viewer__levels"
          role="group"
          aria-label="Level filter"
        >
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
            className="log-viewer__pause"
            variant="text"
            size="small"
            onClick={() => {
              if (paused) {
                setPaused(false);
                setFrozenLogs(null);
              } else {
                setFrozenLogs([...logs]);
                setPaused(true);
              }
            }}
          >
            {paused
              ? newCount > 0
                ? `Resume (${newCount})`
                : 'Resume'
              : 'Pause'}
          </MapControlButton>
          <MapCopyButton
            title="Copy visible logs"
            value={visibleCopyText}
          />
          <MapControlButton
            variant="text"
            size="small"
            onClick={() => {
              clearDevtoolLogs();
              if (paused) setFrozenLogs([]);
            }}
          >
            Clear
          </MapControlButton>
          <InputCheckbox
            label="Auto-scroll"
            checked={autoScroll}
            disabled={paused}
            onChange={setAutoScroll}
          />
        </div>
      </div>
      <div className="log-viewer__filters">
        <div className="log-viewer__search">
          <InputText
            type="search"
            placeholder="Search"
            aria-label="Search logs"
            value={search}
            onChange={setSearch}
          />
        </div>
        {mapIds.length > 1 ? (
          <div className="log-viewer__mapid">
            <InputSelect
              aria-label="Filter by mapId"
              value={mapId}
              items={[
                { value: 'all', text: 'All maps' },
                ...mapIds.map((id) => ({
                  value: id,
                  text: shortMapId(id),
                })),
              ]}
              onChange={(value) => setMapId(String(value))}
            />
          </div>
        ) : null}
        <div className="log-viewer__namespace">
          <InputSelect
            aria-label="Filter by namespace"
            value={namespace}
            items={[
              { value: 'all', text: 'All namespaces' },
              ...namespaces.map((ns) => ({
                value: ns,
                text: displayNamespace(ns),
              })),
            ]}
            onChange={(value) => setNamespace(String(value))}
          />
        </div>
      </div>
      <div className="log-viewer__body" ref={logListRef}>
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
