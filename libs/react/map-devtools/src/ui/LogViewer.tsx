import { MapControlButton, MapCopyButton } from '@hungpvq/react-map-core';
import {
  InputCheckbox,
  InputSelect,
  InputText,
} from '@hungpvq/react-map-core/fields';
import {
  resolveMapDragContainerId,
  formatDevtoolsLogEntryForCopy,
  type BufferingLogEntry as LogEntry,
} from '@hungpvq/map-core/devtools';
import {
  LEVEL_FILTERS,
  buildStructuredLogs,
  collectNamespaces,
  collectStructuredLogs,
  countNewLogsWhilePaused,
  filterLogs,
  formatArg,
  formatLogTime,
  isObject,
  logMapId,
  shortRequestId,
  type LevelFilter,
  type StructuredItem,
} from '@hungpvq/map-debug';
import { useEffect, useMemo, useRef, useState } from 'react';
import { clearDevtoolLogs } from '../store';
import { useDevtoolState } from '../useDevtoolState';
import { GroupItem } from './GroupItem';
import { LogDetailPanel } from './LogDetailPanel';
import { LogRequestFlowModal } from './LogRequestFlowModal';

function LogRenderItem({
  item,
  selectedId,
  onNamespaceClick,
  onRequestIdClick,
  onFlowClick,
  onSelect,
}: {
  item: StructuredItem;
  selectedId: string | null;
  onNamespaceClick: (ns: string) => void;
  onRequestIdClick: (requestId: string) => void;
  onFlowClick: (requestId: string) => void;
  onSelect: (item: StructuredItem) => void;
}) {
  if (item.type === 'group') {
    return (
      <GroupItem title={item.title} collapsed={item.collapsed}>
        {item.children.map((child) => (
          <LogRenderItem
            key={child.id}
            item={child}
            selectedId={selectedId}
            onNamespaceClick={onNamespaceClick}
            onRequestIdClick={onRequestIdClick}
            onFlowClick={onFlowClick}
            onSelect={onSelect}
          />
        ))}
      </GroupItem>
    );
  }

  const { log } = item;
  const nsRoot = log.header.namespaces[0];
  const textArgs = log.args.filter((arg) => !isObject(arg)).map(formatArg);
  const message = textArgs.join(' ');
  const levelLabel = (log.header.level || '?').toUpperCase();
  const { requestId } = log.header;
  const hasMeta = Boolean(nsRoot || requestId);
  const selected = selectedId === item.id;

  return (
    <div
      className={`log-entry log-entry--${log.header.level}${
        selected ? ' log-entry--selected' : ''
      }`}
      role="button"
      tabIndex={0}
      onClick={(event) => {
        const t = event.target as HTMLElement | null;
        if (t?.closest('button, a, input, .log-entry__actions')) return;
        onSelect(item);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onSelect(item);
      }}
    >
      <div className="log-entry__main">
        <span className="log-entry__time">{formatLogTime(log.header.ts)}</span>
        <div className="log-entry__row">
          <div className="log-entry__content">
            {message ? <span className="log-entry__msg">{message}</span> : null}
          </div>
          <div className="log-entry__actions">
            {requestId ? (
              <MapControlButton
                className="log-entry__flow"
                variant="text"
                size="small"
                title="Open request flow"
                onClick={(e) => {
                  e.stopPropagation();
                  onFlowClick(requestId);
                }}
              >
                Flow
              </MapControlButton>
            ) : null}
            <MapCopyButton
              className="log-entry__copy"
              title="Copy log"
              value={formatDevtoolsLogEntryForCopy(log)}
            />
          </div>
        </div>
        <span className="log-entry__level" title={levelLabel}>
          {levelLabel}
        </span>
        {hasMeta ? (
          <div className="log-entry__meta">
            {nsRoot ? (
              <MapControlButton
                variant="text"
                size="small"
                className="log-entry__meta-cell log-entry__ns"
                title={nsRoot}
                onClick={(e) => {
                  e.stopPropagation();
                  onNamespaceClick(nsRoot);
                }}
              >
                {nsRoot}
              </MapControlButton>
            ) : null}
            {requestId ? (
              <MapControlButton
                variant="text"
                size="small"
                className="log-entry__meta-cell log-entry__req"
                title={requestId}
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestIdClick(requestId);
                }}
              >
                req={shortRequestId(requestId)}
              </MapControlButton>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function LogViewer() {
  const { logs, filterMapId } = useDevtoolState();
  const logListRef = useRef<HTMLDivElement | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [paused, setPaused] = useState(false);
  const [frozenLogs, setFrozenLogs] = useState<LogEntry[] | null>(null);
  const [search, setSearch] = useState('');
  const [requestId, setRequestId] = useState('');
  const [level, setLevel] = useState<LevelFilter>('all');
  const [namespace, setNamespace] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flowOpen, setFlowOpen] = useState(false);
  const [flowRequestId, setFlowRequestId] = useState<string | null>(null);

  const sourceLogs = paused && frozenLogs ? frozenLogs : logs;
  const newCount = countNewLogsWhilePaused(logs, frozenLogs, paused);

  const namespaces = useMemo(
    () => collectNamespaces(logs, filterMapId, 2),
    [logs, filterMapId],
  );

  useEffect(() => {
    if (namespace !== 'all' && !namespaces.includes(namespace)) {
      setNamespace('all');
    }
  }, [namespaces, namespace]);

  const filteredLogs = useMemo(
    () =>
      filterLogs(
        sourceLogs,
        search,
        level,
        namespace,
        filterMapId,
        2,
        requestId,
      ),
    [sourceLogs, search, level, namespace, filterMapId, requestId],
  );

  const structuredLogs = useMemo(
    () => buildStructuredLogs(filteredLogs),
    [filteredLogs],
  );

  const flatLogs = useMemo(
    () => collectStructuredLogs(structuredLogs),
    [structuredLogs],
  );

  const selectedLog = useMemo(() => {
    if (!selectedId) return null;
    return (
      sourceLogs.find((l) => l.id === selectedId) ??
      filteredLogs.find((l) => l.id === selectedId) ??
      null
    );
  }, [sourceLogs, filteredLogs, selectedId]);

  const flowMapId = useMemo(() => {
    if (filterMapId !== 'all') return filterMapId;
    if (selectedLog) return logMapId(selectedLog);
    if (!flowRequestId) return null;
    const first = sourceLogs.find((l) => l.header.requestId === flowRequestId);
    return first ? logMapId(first) : null;
  }, [filterMapId, selectedLog, flowRequestId, sourceLogs]);

  const showingCount = flatLogs.length;
  const totalCount = sourceLogs.length;

  const hasActiveFilter =
    Boolean(search.trim()) ||
    Boolean(requestId.trim()) ||
    level !== 'all' ||
    namespace !== 'all' ||
    filterMapId !== 'all';

  useEffect(() => {
    if (!autoScroll || paused) return;
    const list = logListRef.current;
    if (list) list.scrollTop = 0;
  }, [structuredLogs.length, autoScroll, paused]);

  useEffect(() => {
    const list = logListRef.current;
    if (list) list.scrollTop = 0;
  }, [search, requestId, level, namespace, filterMapId]);

  function openFlow(reqId: string) {
    setFlowRequestId(reqId);
    const match = sourceLogs.find((l) => l.header.requestId === reqId);
    const mapId =
      filterMapId !== 'all'
        ? filterMapId
        : match
          ? logMapId(match)
          : selectedLog
            ? logMapId(selectedLog)
            : null;
    if (!mapId) return;
    const dragId = resolveMapDragContainerId(null, mapId);
    if (
      !dragId ||
      (typeof document !== 'undefined' &&
        !document.getElementById(`modal-layer-${dragId}`))
    ) {
      return;
    }
    setFlowOpen(true);
  }

  return (
    <div className="log-viewer">
      <div className="log-viewer__toolbar">
        <div className="log-viewer__toolbar-main">
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
                className="log-viewer__level"
                variant="text"
                size="small"
                active={level === item}
                onClick={() => setLevel(item)}
              >
                {item}
              </MapControlButton>
            ))}
          </div>
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
          <MapControlButton
            variant="text"
            size="small"
            onClick={() => {
              clearDevtoolLogs();
              if (paused) setFrozenLogs([]);
              setSelectedId(null);
              setFlowOpen(false);
              setFlowRequestId(null);
            }}
          >
            Clear
          </MapControlButton>
          <InputCheckbox
            className="log-viewer__autoscroll"
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
        <div className="log-viewer__requestid">
          <InputText
            type="search"
            placeholder="requestId"
            aria-label="Filter by requestId"
            value={requestId}
            onChange={setRequestId}
          />
        </div>
        <div className="log-viewer__namespace">
          <InputSelect
            aria-label="Filter by namespace"
            value={namespace}
            items={[
              { value: 'all', text: 'All namespaces' },
              ...namespaces.map((ns) => ({
                value: ns,
                text: ns,
              })),
            ]}
            onChange={(value) => setNamespace(String(value))}
          />
        </div>
      </div>
      <div className="log-viewer__split">
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
                selectedId={selectedId}
                onNamespaceClick={setNamespace}
                onRequestIdClick={setRequestId}
                onFlowClick={openFlow}
                onSelect={(it) => {
                  if (it.type === 'log') setSelectedId(it.id);
                }}
              />
            ))
          )}
        </div>
        <LogDetailPanel log={selectedLog} />
      </div>
      {flowRequestId && flowMapId ? (
        <LogRequestFlowModal
          show={flowOpen}
          requestId={flowRequestId}
          mapId={flowMapId}
          logs={sourceLogs}
          activeLogId={selectedId}
          onClose={() => setFlowOpen(false)}
        />
      ) : null}
    </div>
  );
}
