import { MapControlButton, MapCopyButton } from '@hungpvq/react-map-core';
import {
  InputCheckbox,
  InputSelect,
  InputText,
} from '@hungpvq/react-map-core/fields';
import {
  createActionFeedback,
  type ActionFeedbackPhase,
} from '@hungpvq/map-core';
import {
  formatDevtoolsLogEntryForCopy,
  getDevtoolLogDataStore,
  refreshDevtoolLogsFromStore,
} from '@hungpvq/map-core/devtools';
import { logActionId, type LogRecord } from '@hungpvq/shared-log';
import {
  LEVEL_FILTERS,
  formatLogTime,
  shortActionId,
  textMessage,
  type LevelFilter,
} from '@hungpvq/map-debug';
import { useEffect, useMemo, useRef, useState } from 'react';
import { clearDevtoolLogs } from '../store';
import { useDevtoolState } from '../useDevtoolState';
import { LogDetailPanel } from './LogDetailPanel';
import { LogRequestFlowModal } from './LogRequestFlowModal';
import { useLogStoreView } from './useLogStoreView';

function refreshActionLabel(phase: ActionFeedbackPhase): string {
  if (phase === 'loading') return '…';
  if (phase === 'success') return 'Refreshed';
  if (phase === 'error') return 'Failed';
  return 'Refresh';
}

function LogRenderItem({
  log,
  selectedId,
  onNamespaceClick,
  onActionIdClick,
  onFlowClick,
  onSelect,
}: {
  log: LogRecord;
  selectedId: string | null;
  onNamespaceClick: (ns: string) => void;
  onActionIdClick: (actionId: string) => void;
  onFlowClick: (actionId: string) => void;
  onSelect: (log: LogRecord) => void;
}) {
  const nsRoot = log.header.namespaces[0];
  const message = textMessage(log);
  const levelLabel = (log.header.level || '?').toUpperCase();
  const actionId = logActionId(log);
  const hasMeta = Boolean(nsRoot || actionId);
  const selected = selectedId === log.id;

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
        onSelect(log);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onSelect(log);
      }}
    >
      <div className="log-entry__main">
        <span className="log-entry__time">{formatLogTime(log.header.ts)}</span>
        <div className="log-entry__row">
          <div className="log-entry__content">
            {message ? <span className="log-entry__msg">{message}</span> : null}
          </div>
          <div className="log-entry__actions">
            {actionId ? (
              <MapControlButton
                className="log-entry__flow"
                variant="text"
                size="small"
                title="Open action flow"
                onClick={(e) => {
                  e.stopPropagation();
                  onFlowClick(actionId);
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
            {actionId ? (
              <MapControlButton
                variant="text"
                size="small"
                className="log-entry__meta-cell log-entry__req"
                title={actionId}
                onClick={(e) => {
                  e.stopPropagation();
                  onActionIdClick(actionId);
                }}
              >
                action={shortActionId(actionId)}
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
  const [actionIdFilter, setActionIdFilter] = useState('');
  const [level, setLevel] = useState<LevelFilter>('all');
  const [namespace, setNamespace] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flowActionId, setFlowActionId] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [refreshPhase, setRefreshPhase] =
    useState<ActionFeedbackPhase>('idle');
  const refreshFeedbackRef = useRef(
    createActionFeedback({
      onChange: (phase) => setRefreshPhase(phase),
    }),
  );

  useEffect(() => () => refreshFeedbackRef.current.dispose(), []);

  const liveStore = getDevtoolLogDataStore();

  const filterQuery = useMemo(
    () => ({
      level,
      namespace,
      mapId: filterMapId,
      actionId: actionIdFilter,
    }),
    [level, namespace, filterMapId, actionIdFilter],
  );

  const { listed, all, namespaces, totalCount } = useLogStoreView(
    liveStore,
    filterQuery,
    logs,
  );

  useEffect(() => {
    if (namespace !== 'all' && !namespaces.includes(namespace)) {
      setNamespace('all');
    }
  }, [namespaces, namespace]);

  const selectedLog = useMemo(() => {
    if (!selectedId) return null;
    return (
      listed.find((l) => l.id === selectedId) ??
      all.find((l) => l.id === selectedId) ??
      null
    );
  }, [listed, all, selectedId]);

  useEffect(() => {
    if (!autoScroll) return;
    const el = logListRef.current;
    if (el) el.scrollTop = 0;
  }, [listed.length, autoScroll]);

  useEffect(() => {
    const el = logListRef.current;
    if (el) el.scrollTop = 0;
  }, [actionIdFilter, level, namespace, filterMapId]);

  async function onRefresh() {
    await refreshFeedbackRef.current.run('refresh', async () => {
      await refreshDevtoolLogsFromStore();
    });
  }

  return (
    <div className="log-viewer">
      <div className="log-viewer__toolbar">
        <div className="log-viewer__toolbar-main">
          <span className="log-viewer__count">
            {listed.length}/{totalCount}
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
            variant="text"
            size="small"
            title="Refresh logs from store"
            disabled={refreshPhase === 'loading'}
            onClick={() => {
              void onRefresh();
            }}
          >
            {refreshActionLabel(refreshPhase)}
          </MapControlButton>
          <MapControlButton
            variant="text"
            size="small"
            onClick={() => {
              clearDevtoolLogs();
              setSelectedId(null);
              setFlowActionId(null);
            }}
          >
            Clear
          </MapControlButton>
          <InputCheckbox
            className="log-viewer__autoscroll"
            label="Auto-scroll"
            checked={autoScroll}
            onChange={setAutoScroll}
          />
        </div>
      </div>
      <div className="log-viewer__filters">
        <div className="log-viewer__requestid">
          <InputText
            type="search"
            placeholder="actionId"
            aria-label="Filter by actionId"
            value={actionIdFilter}
            onChange={setActionIdFilter}
          />
        </div>
        <div
          className={[
            'log-viewer__namespace',
            namespace !== 'all' ? 'log-viewer__namespace--filtered' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
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
          {namespace !== 'all' ? (
            <button
              type="button"
              className="log-viewer__namespace-clear"
              title="Clear namespace filter"
              aria-label="Clear namespace filter"
              onClick={() => setNamespace('all')}
            >
              ✕
            </button>
          ) : null}
        </div>
      </div>
      <div className="log-viewer__split">
        <div className="log-viewer__body" ref={logListRef}>
          {listed.length === 0 ? (
            <div className="log-viewer__empty">
              {totalCount === 0 ? 'No logs' : 'No matching logs'}
            </div>
          ) : (
            listed.map((log) => (
              <LogRenderItem
                key={log.id}
                log={log}
                selectedId={selectedId}
                onNamespaceClick={setNamespace}
                onActionIdClick={setActionIdFilter}
                onFlowClick={setFlowActionId}
                onSelect={(row) => setSelectedId(row.id)}
              />
            ))
          )}
        </div>
        <LogDetailPanel log={selectedLog} />
      </div>
      {flowActionId ? (
        <LogRequestFlowModal
          show
          actionId={flowActionId}
          store={liveStore}
          onClose={() => {
            setFlowActionId(null);
          }}
        />
      ) : null}
    </div>
  );
}
