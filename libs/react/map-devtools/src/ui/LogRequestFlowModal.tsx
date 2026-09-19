import {
  resolveMapDragContainerId,
  type BufferingLogEntry,
} from '@hungpvq/map-core/devtools';
import {
  buildRequestFlowSteps,
  buildRequestFlowTree,
  collectLogsByRequestId,
  formatFlowDelta,
  formatLogTime,
  shortRequestId,
  type RequestFlowTreeNode,
} from '@hungpvq/map-debug';
import { MapControlButton } from '@hungpvq/react-map-core';
import { DraggableModal } from '@hungpvq/react-draggable';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { LogDetailPanel } from './LogDetailPanel';

function resolveFlowContainerId(mapId?: string | null): string | null {
  const id = resolveMapDragContainerId(null, mapId);
  if (!id) return null;
  if (
    typeof document !== 'undefined' &&
    !document.getElementById(`modal-layer-${id}`)
  ) {
    return null;
  }
  return id;
}

function splitFrameChildren(children: RequestFlowTreeNode[]) {
  const body: RequestFlowTreeNode[] = [];
  const closers: RequestFlowTreeNode[] = [];
  const after: RequestFlowTreeNode[] = [];
  let closed = false;
  for (const child of children) {
    if (!closed && (child.phase === 'END' || child.phase === 'ERROR')) {
      closers.push(child);
      closed = true;
    } else if (closed) {
      after.push(child);
    } else {
      body.push(child);
    }
  }
  return { body, closers, after };
}

function phaseClassName(
  node: RequestFlowTreeNode,
  activeLogId?: string | null,
): string {
  let extra = '';
  if (activeLogId === node.id) extra += ' log-request-flow__step--active';
  if (node.phase === 'EMIT') extra += ' log-request-flow__step--emit';
  else if (node.flowKind === 'handler')
    extra += ' log-request-flow__step--handler';
  else if (node.phase === 'START') extra += ' log-request-flow__step--start';
  else if (node.phase === 'END') extra += ' log-request-flow__step--end';
  else if (node.phase === 'ERROR')
    extra += ' log-request-flow__step--error-phase';
  return extra;
}

function StepRow({
  node,
  activeLogId,
  onSelect,
  twist,
}: {
  node: RequestFlowTreeNode;
  activeLogId?: string | null;
  onSelect: (logId: string) => void;
  twist?: ReactNode;
}) {
  return (
    <div
      className={`log-request-flow__step log-request-flow__step--${
        node.level
      }${phaseClassName(node, activeLogId)}`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(node.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSelect(node.id);
      }}
    >
      {twist ?? (
        <span className="log-request-flow__twist log-request-flow__twist--empty" />
      )}
      <span className="log-request-flow__delta">
        {formatFlowDelta(node.deltaMs)}
      </span>
      <span className="log-request-flow__rail" aria-hidden="true">
        <span className="log-request-flow__dot" />
      </span>
      <span className="log-request-flow__card">
        <span className="log-request-flow__title">
          <span className="log-request-flow__label">{node.label}</span>
          {node.phase && node.phase !== 'mid' ? (
            <span className="log-request-flow__kind">{node.phase}</span>
          ) : node.flowKind ? (
            <span className="log-request-flow__kind">{node.flowKind}</span>
          ) : null}
        </span>
        <span className="log-request-flow__sub">
          {node.index != null ? `#${node.index} · ` : null}
          {formatLogTime(node.ts)}
          {node.namespace ? ` · ${node.namespace}` : null}
          {node.fn && node.phase === 'mid' ? ` · ${node.fn}` : null}
          {node.span ? ` · ${node.span}` : null}
        </span>
      </span>
    </div>
  );
}

function FlowNode({
  node,
  depth,
  flat,
  activeLogId,
  onSelect,
}: {
  node: RequestFlowTreeNode;
  depth: number;
  flat?: boolean;
  activeLogId?: string | null;
  onSelect: (logId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const isFrame = !flat && node.phase === 'START';
  const { body, closers, after } = isFrame
    ? splitFrameChildren(node.children)
    : {
        body: node.children,
        closers: [] as RequestFlowTreeNode[],
        after: [] as RequestFlowTreeNode[],
      };
  const canToggle = isFrame
    ? body.length > 0
    : node.children.length > 0;

  const twist = canToggle ? (
    <button
      type="button"
      className="log-request-flow__twist"
      aria-expanded={expanded}
      title={expanded ? 'Collapse' : 'Expand'}
      onClick={(e) => {
        e.stopPropagation();
        setExpanded((v) => !v);
      }}
    >
      {expanded ? '▾' : '▸'}
    </button>
  ) : undefined;

  return (
    <li
      className={`log-request-flow__item${
        isFrame ? ' log-request-flow__frame' : ''
      }${
        isFrame && expanded && body.length > 0
          ? ' log-request-flow__frame--open'
          : ''
      }${
        isFrame && closers.length > 0
          ? ' log-request-flow__frame--has-end'
          : ''
      }`}
      style={{ ['--flow-depth' as string]: String(depth) }}
    >
      <StepRow
        node={node}
        activeLogId={activeLogId}
        onSelect={onSelect}
        twist={twist}
      />

      {isFrame && expanded && body.length > 0 ? (
        <div className="log-request-flow__frame-body">
          <ol className="log-request-flow__children">
            {body.map((child) => (
              <FlowNode
                key={child.id}
                node={child}
                depth={depth + 1}
                flat={flat}
                activeLogId={activeLogId}
                onSelect={onSelect}
              />
            ))}
          </ol>
        </div>
      ) : null}

      {isFrame
        ? closers.map((closer) => (
            <StepRow
              key={closer.id}
              node={closer}
              activeLogId={activeLogId}
              onSelect={onSelect}
            />
          ))
        : null}

      {isFrame && expanded && after.length > 0 ? (
        <ol className="log-request-flow__children log-request-flow__children--after">
          {after.map((child) => (
            <FlowNode
              key={child.id}
              node={child}
              depth={depth}
              flat={flat}
              activeLogId={activeLogId}
              onSelect={onSelect}
            />
          ))}
        </ol>
      ) : null}

      {!isFrame && canToggle && expanded ? (
        <ol className="log-request-flow__children">
          {node.children.map((child) => (
            <FlowNode
              key={child.id}
              node={child}
              depth={depth + 1}
              flat={flat}
              activeLogId={activeLogId}
              onSelect={onSelect}
            />
          ))}
        </ol>
      ) : null}
    </li>
  );
}

export function LogRequestFlowModal({
  show,
  requestId,
  mapId,
  logs,
  activeLogId,
  onClose,
}: {
  show: boolean;
  requestId: string;
  mapId?: string | null;
  logs: BufferingLogEntry[];
  activeLogId?: string | null;
  onClose: () => void;
}) {
  const containerId = resolveFlowContainerId(mapId);
  const matched = useMemo(
    () => collectLogsByRequestId(logs, requestId),
    [logs, requestId],
  );
  const tree = useMemo(() => buildRequestFlowTree(matched), [matched]);
  const flatNodes = useMemo((): RequestFlowTreeNode[] => {
    return buildRequestFlowSteps(matched).map((step) => ({
      ...step,
      children: [],
    }));
  }, [matched]);
  const [localId, setLocalId] = useState<string | null>(activeLogId ?? null);
  const [viewMode, setViewMode] = useState<'tree' | 'flat'>('tree');

  useEffect(() => {
    if (!show) return;
    setLocalId(activeLogId ?? null);
  }, [show, activeLogId, requestId]);

  if (!show || !containerId) return null;

  const selected =
    matched.find((l) => l.id === localId) ?? matched[0] ?? null;
  const title = `Request flow · ${shortRequestId(requestId)}`;
  const nodes = matched.length;
  const displayNodes = viewMode === 'tree' ? tree : flatNodes;
  const isFlat = viewMode === 'flat';

  return (
    <DraggableModal
      show
      title={title}
      containerId={containerId}
      width={780}
      height={560}
      mask
      maskClosable
      onUpdateShow={(value) => {
        if (!value) onClose();
      }}
      onClose={onClose}
    >
      <div className="log-request-flow">
        <div className="log-request-flow__meta">
          <span>
            {nodes} node{nodes === 1 ? '' : 's'}
          </span>
          <div
            className="log-request-flow__modes"
            role="group"
            aria-label="View mode"
          >
            <MapControlButton
              variant="text"
              size="small"
              active={viewMode === 'tree'}
              onClick={() => setViewMode('tree')}
            >
              Tree
            </MapControlButton>
            <MapControlButton
              variant="text"
              size="small"
              active={viewMode === 'flat'}
              onClick={() => setViewMode('flat')}
            >
              Flat
            </MapControlButton>
          </div>
          <code>{requestId}</code>
        </div>
        <div className="log-request-flow__layout">
          <div className="log-request-flow__tree">
            {nodes === 0 ? (
              <div className="log-request-flow__empty">
                No logs for this requestId
              </div>
            ) : (
              <ol
                className={`log-request-flow__list${
                  isFlat ? ' log-request-flow__list--flat' : ''
                }`}
              >
                {displayNodes.map((node) => (
                  <FlowNode
                    key={node.id}
                    node={node}
                    depth={0}
                    flat={isFlat}
                    activeLogId={selected?.id}
                    onSelect={setLocalId}
                  />
                ))}
              </ol>
            )}
          </div>
          <LogDetailPanel log={selected} />
        </div>
      </div>
    </DraggableModal>
  );
}
