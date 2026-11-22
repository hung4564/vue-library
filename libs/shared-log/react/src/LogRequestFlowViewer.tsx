import { BaseButton, CopyButton, Tabs, type TabItem } from '@hungpvq/react-ui-core';
import {
  buildRequestFlowSteps,
  buildRequestFlowTree,
  formatFlowDelta,
  resolveMaybePromise,
  type DebugRecord,
  type LogDataStore,
  type RequestFlowStep,
  type RequestFlowTreeNode,
} from '@hungpvq/shared-log';
import { useEffect, useMemo, useState } from 'react';

import { LogDetailPanel } from './LogDetailPanel';
import { LogRequestFlowNode } from './LogRequestFlowNode';
import { DevtoolPanelCard } from './ui/DevtoolPanelCard';
import { DevtoolPanelSplit } from './ui/DevtoolPanelSplit';

export interface LogRequestFlowViewerProps {
  show: boolean;
  actionId: string;
  store: LogDataStore;
  onClose: () => void;
}

const MODE_TABS: TabItem[] = [
  { id: 'tree', label: 'Tree' },
  { id: 'flat', label: 'Flat' },
];

export function LogRequestFlowViewer({
  show,
  actionId,
  store,
  onClose,
}: LogRequestFlowViewerProps) {
  const [viewMode, setViewMode] = useState<string>('tree');
  const [localActiveId, setLocalActiveId] = useState<string | null>(null);
  const [matchedLogs, setMatchedLogs] = useState<DebugRecord[]>([]);

  useEffect(() => {
    let gen = 0;
    const run = async () => {
      const id = ++gen;
      if (!show || !actionId) {
        setMatchedLogs([]);
        return;
      }
      const rows = await resolveMaybePromise(store.list({ actionId }));
      if (id !== gen) return;
      setMatchedLogs(rows);
    };
    void run();
  }, [store, actionId, show]);

  useEffect(() => {
    if (!show) return;
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [show, onClose]);

  const steps = useMemo(
    () => buildRequestFlowSteps(matchedLogs),
    [matchedLogs],
  );
  const tree = useMemo(() => buildRequestFlowTree(matchedLogs), [matchedLogs]);
  const flatAsNodes = useMemo(
    (): RequestFlowTreeNode[] =>
      steps.map((step: RequestFlowStep) => ({
        ...step,
        children: [],
      })),
    [steps],
  );

  const selectedLog = useMemo(() => {
    if (!localActiveId) return matchedLogs[0] ?? null;
    return (
      matchedLogs.find((l) => l.id === localActiveId) ?? matchedLogs[0] ?? null
    );
  }, [localActiveId, matchedLogs]);

  const totalDurationMs = useMemo(() => {
    if (steps.length < 2) return null;
    const start = steps[0]?.ts;
    const end = steps[steps.length - 1]?.ts;
    if (start != null && end != null && end >= start) {
      return end - start;
    }
    return null;
  }, [steps]);

  const hasError = useMemo(
    () =>
      steps.some(
        (s) => s.level === 'error' || s.phase === 'ERROR',
      ),
    [steps],
  );

  if (!show) return null;

  const nodes = viewMode === 'tree' ? tree : flatAsNodes;
  const nodeCount = matchedLogs.length;

  return (
    <div
      className="debug-flow-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="debug-flow-viewer"
        role="dialog"
        aria-modal="true"
        aria-label="Action flow"
      >
        <div className="debug-flow-viewer__header">
          <div className="debug-flow-viewer__header-left">
            <span className="debug-flow-viewer__title">Action Flow</span>
            <code
              className="debug-flow-viewer__action-id"
              title={actionId}
            >
              {actionId}
            </code>
            <CopyButton
              value={actionId}
              title="Copy actionId"
            />
            <span className="debug-flow-viewer__badge">
              {nodeCount} {nodeCount === 1 ? 'step' : 'steps'}
            </span>
            {totalDurationMs != null ? (
              <span className="debug-flow-viewer__badge debug-flow-viewer__badge--time">
                {formatFlowDelta(totalDurationMs)}
              </span>
            ) : null}
            {hasError ? (
              <span className="debug-flow-viewer__badge debug-flow-viewer__badge--error">
                Error
              </span>
            ) : null}
          </div>
          <div className="debug-flow-viewer__header-right">
            <Tabs
              items={MODE_TABS}
              value={viewMode}
              onChange={setViewMode}
              withPanes={false}
            />
            <BaseButton
              variant="text"
              size="small"
              className="debug-flow-viewer__close"
              title="Close (Esc)"
              onClick={onClose}
            >
              ✕
            </BaseButton>
          </div>
        </div>
        <div className="log-request-flow">
          <DevtoolPanelSplit className="log-request-flow__layout">
            <DevtoolPanelCard className="log-request-flow__tree">
              {nodeCount ? (
                <ol
                  className={`log-request-flow__list ${viewMode === 'flat' ? 'log-request-flow__list--flat' : ''}`}
                >
                  {nodes.map((node) => (
                    <LogRequestFlowNode
                      key={node.id}
                      node={node}
                      depth={0}
                      flat={viewMode === 'flat'}
                      activeLogId={selectedLog?.id}
                      onSelect={setLocalActiveId}
                    />
                  ))}
                </ol>
              ) : (
                <div className="log-request-flow__empty">
                  No logs for this actionId
                </div>
              )}
            </DevtoolPanelCard>
            <LogDetailPanel log={selectedLog} />
          </DevtoolPanelSplit>
        </div>
      </div>
    </div>
  );
}

export const LogRequestFlowModal = LogRequestFlowViewer;
