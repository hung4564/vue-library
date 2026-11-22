import {
  BaseButton,
  InputCheckbox,
  InputSelect,
  InputText,
} from '@hungpvq/react-ui-core';
import {
  clearDebugLogs,
  getDebugLogDataStore,
  logActionId,
  refreshDebugLogsFromStore,
  rootNamespace,
  type DebugRecord,
  type LevelFilter,
} from '@hungpvq/shared-log';
import { useEffect, useMemo, useRef, useState } from 'react';

import { phaseLabel, runWithPhase, type ActionFeedbackPhase } from '../feedback';
import { LogDetailPanel } from '../LogDetailPanel';
import { LogRenderNode } from '../LogRenderNode';
import { LogRequestFlowViewer } from '../LogRequestFlowViewer';
import { DevtoolPanelCard } from '../ui/DevtoolPanelCard';
import { DevtoolPanelContainer } from '../ui/DevtoolPanelContainer';
import { DevtoolPanelSplit } from '../ui/DevtoolPanelSplit';
import { DevtoolPanelToolbar } from '../ui/DevtoolPanelToolbar';
import { useDebugHost } from '../use-debug-host';

function filterLogs(
  rows: DebugRecord[],
  level: LevelFilter,
  namespace: string,
  actionId: string,
): DebugRecord[] {
  const action = actionId.trim().toLowerCase();
  return rows.filter((log) => {
    if (level !== 'all' && log.header.level !== level) return false;
    if (namespace !== 'all' && rootNamespace(log) !== namespace) return false;
    if (action && !(logActionId(log) ?? '').toLowerCase().includes(action)) {
      return false;
    }
    return true;
  });
}

export function PanelLogViewer() {
  const { logs } = useDebugHost();
  const logListRef = useRef<HTMLDivElement | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [level, setLevel] = useState<LevelFilter>('all');
  const [actionId, setActionId] = useState('');
  const [namespace, setNamespace] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flowActionId, setFlowActionId] = useState<string | null>(null);
  const [refreshPhase, setRefreshPhase] = useState<ActionFeedbackPhase>('idle');
  const store = useMemo(() => getDebugLogDataStore(), []);

  const listed = useMemo(
    () => filterLogs(logs, level, namespace, actionId),
    [logs, level, namespace, actionId],
  );

  useEffect(() => {
    if (!autoScroll) return;
    if (logListRef.current) logListRef.current.scrollTop = 0;
  }, [listed.length, autoScroll]);

  const namespaces = useMemo(() => {
    const set = new Set<string>();
    for (const log of logs) {
      const key = rootNamespace(log);
      if (key) set.add(key);
    }
    return [...set].sort();
  }, [logs]);

  const selectedLog = useMemo(() => {
    if (!selectedId) return null;
    return (
      listed.find((l) => l.id === selectedId) ??
      logs.find((l) => l.id === selectedId) ??
      null
    );
  }, [selectedId, listed, logs]);

  return (
    <DevtoolPanelContainer
      title={
        <DevtoolPanelToolbar
          title={
            <>
              <span className="log-viewer__count">
                {listed.length}/{logs.length}
              </span>
            </>
          }
          actions={
            <>
              <BaseButton
                disabled={refreshPhase === 'loading'}
                onClick={() =>
                  void runWithPhase(setRefreshPhase, async () => {
                    await refreshDebugLogsFromStore();
                  })
                }
              >
                {phaseLabel(refreshPhase, 'Refresh')}
              </BaseButton>
              <BaseButton
                onClick={() => {
                  clearDebugLogs();
                  setSelectedId(null);
                  setFlowActionId(null);
                }}
              >
                Clear
              </BaseButton>
              <InputCheckbox
                checked={autoScroll}
                onChange={setAutoScroll}
                label="Auto-scroll"
              />
            </>
          }
        />
      }
    >
      <div className="log-viewer__container">
        <div className="log-viewer__filters">
          <div className="log-viewer__requestid">
            <InputText
              type="search"
              placeholder="actionId"
              aria-label="Filter by actionId"
              value={actionId}
              onChange={setActionId}
            />
          </div>
          <div className="log-viewer__namespace">
            <InputSelect
              aria-label="Filter by namespace"
              value={namespace}
              onChange={(value) => setNamespace(String(value))}
              items={[
                { value: 'all', text: 'All namespaces' },
                ...namespaces.map((ns) => ({ value: ns, text: ns })),
              ]}
            />
          </div>
        </div>
        <DevtoolPanelSplit className="log-viewer__split">
          <DevtoolPanelCard
            className="log-viewer__body"
            ref={logListRef}
          >
            {listed.length === 0 ? (
              <div className="log-viewer__empty">
                {logs.length === 0 ? 'No logs' : 'No matching logs'}
              </div>
            ) : (
              listed.map((log) => (
                <LogRenderNode
                  key={log.id}
                  log={log}
                  selectedId={selectedId}
                  onNamespaceClick={setNamespace}
                  onActionIdClick={setActionId}
                  onFlowClick={setFlowActionId}
                  onSelect={(row) => setSelectedId(row.id)}
                />
              ))
            )}
          </DevtoolPanelCard>
          <LogDetailPanel log={selectedLog} />
        </DevtoolPanelSplit>
        {flowActionId ? (
          <LogRequestFlowViewer
            show
            actionId={flowActionId}
            store={store}
            onClose={() => setFlowActionId(null)}
          />
        ) : null}
      </div>
    </DevtoolPanelContainer>
  );
}

export { PanelLogViewer as LogViewer };
