import {
  clearDebugLogs,
  getDebugLogDataStore,
  LEVEL_FILTERS,
  type LevelFilter,
  type LogRecord,
  refreshDebugLogsFromStore,
  resolveMaybePromise,
  rootNamespace,
  textMessage,
} from '@hungpvq/shared-log';
import { BaseButton, InputSelect, InputText } from '@hungpvq/react-ui-core';
import { useEffect, useMemo, useState } from 'react';

import { phaseLabel, runWithPhase, type ActionFeedbackPhase } from './feedback';
import { useDebugHost } from './use-debug-host';

export function LogViewer() {
  const { logs } = useDebugHost();
  const [level, setLevel] = useState<LevelFilter>('all');
  const [actionId, setActionId] = useState('');
  const [namespace, setNamespace] = useState('all');
  const [listed, setListed] = useState<LogRecord[]>([]);
  const [allLogs, setAllLogs] = useState<LogRecord[]>([]);
  const [refreshPhase, setRefreshPhase] = useState<ActionFeedbackPhase>('idle');
  const store = useMemo(() => getDebugLogDataStore(), []);

  useEffect(() => {
    let gen = 0;
    const run = async () => {
      const id = ++gen;
      const [rows, all] = await Promise.all([
        resolveMaybePromise(store.list({ level, namespace, actionId })),
        resolveMaybePromise(store.getAll()),
      ]);
      if (id !== gen) return;
      setListed(rows);
      setAllLogs(all);
    };
    void run();
  }, [store, level, namespace, actionId, logs]);

  const namespaces = useMemo(() => {
    const set = new Set<string>();
    for (const log of allLogs) {
      const key = rootNamespace(log);
      if (key) set.add(key);
    }
    return [...set].sort();
  }, [allLogs]);

  return (
    <div className="log-viewer">
      <div className="log-viewer__toolbar">
        <div className="log-viewer__toolbar-main">
          <span className="log-viewer__count">
            {listed.length}/{allLogs.length}
          </span>
          <div className="log-viewer__levels">
            {LEVEL_FILTERS.map((item) => (
              <BaseButton
                key={item}
                active={level === item}
                onClick={() => setLevel(item)}
              >
                {item}
              </BaseButton>
            ))}
          </div>
        </div>
        <div className="log-viewer__actions">
          <BaseButton
            disabled={refreshPhase === 'loading'}
            onClick={() =>
              void runWithPhase(setRefreshPhase, () =>
                refreshDebugLogsFromStore(),
              )
            }
          >
            {phaseLabel(refreshPhase, 'Refresh')}
          </BaseButton>
          <BaseButton onClick={clearDebugLogs}>Clear</BaseButton>
        </div>
      </div>
      <div className="log-viewer__filters">
        <InputText
          type="search"
          placeholder="actionId"
          value={actionId}
          onChange={setActionId}
        />
        <InputSelect
          value={namespace}
          onChange={(value) => setNamespace(String(value))}
          items={[
            { value: 'all', text: 'All namespaces' },
            ...namespaces.map((ns) => ({ value: ns, text: ns })),
          ]}
        />
      </div>
      <div className="log-viewer__body">
        {listed.length === 0 ? (
          <div className="log-viewer__empty">
            {allLogs.length === 0 ? 'No logs' : 'No matching logs'}
          </div>
        ) : (
          listed.map((log) => (
            <div
              key={log.id}
              className={`log-entry log-entry--${log.header.level}`}
            >
              <span className="log-entry__level">
                {(log.header.level || '?').toUpperCase()}
              </span>{' '}
              {textMessage(log)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
