import {
  formatFlowDelta,
  formatLogTime,
  type RequestFlowTreeNode,
} from '@hungpvq/shared-log';
import { useMemo, useState } from 'react';

function phaseClass(node: RequestFlowTreeNode, activeLogId?: string | null) {
  return [
    activeLogId === node.id ? 'log-request-flow__step--active' : '',
    node.phase === 'EMIT' ? 'log-request-flow__step--emit' : '',
    node.flowKind === 'handler' ? 'log-request-flow__step--handler' : '',
    node.phase === 'START' ? 'log-request-flow__step--start' : '',
    node.phase === 'END' ? 'log-request-flow__step--end' : '',
    node.phase === 'ERROR' ? 'log-request-flow__step--error-phase' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function LogRequestFlowNode({
  node,
  activeLogId,
  depth = 0,
  flat,
  onSelect,
}: {
  node: RequestFlowTreeNode;
  activeLogId?: string | null;
  depth?: number;
  flat?: boolean;
  onSelect: (logId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const isFrame = !flat && node.phase === 'START';
  const frameParts = useMemo(() => {
    if (!isFrame) {
      return {
        body: node.children,
        closers: [] as RequestFlowTreeNode[],
        after: [] as RequestFlowTreeNode[],
      };
    }
    const body: RequestFlowTreeNode[] = [];
    const closers: RequestFlowTreeNode[] = [];
    const after: RequestFlowTreeNode[] = [];
    let closed = false;
    for (const child of node.children) {
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
  }, [isFrame, node.children]);

  const canToggle =
    frameParts.body.length > 0 || (!isFrame && node.children.length > 0);

  return (
    <li
      className={[
        'log-request-flow__item',
        isFrame ? 'log-request-flow__frame' : '',
        isFrame && expanded && frameParts.body.length > 0
          ? 'log-request-flow__frame--open'
          : '',
        isFrame && frameParts.closers.length > 0
          ? 'log-request-flow__frame--has-end'
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ['--flow-depth' as string]: String(depth) }}
    >
      <div
        className={`log-request-flow__step log-request-flow__step--${node.level} ${phaseClass(node, activeLogId)}`}
        role="button"
        tabIndex={0}
        onClick={() => onSelect(node.id)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect(node.id);
          }
        }}
      >
        {canToggle ? (
          <button
            type="button"
            className="log-request-flow__twist"
            onClick={(event) => {
              event.stopPropagation();
              setExpanded((open) => !open);
            }}
          >
            {expanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="log-request-flow__twist log-request-flow__twist--empty" />
        )}
        <span className="log-request-flow__delta">
          {formatFlowDelta(node.deltaMs)}
        </span>
        <span className="log-request-flow__rail">
          <span className="log-request-flow__dot" />
        </span>
        <span className="log-request-flow__card">
          <span className="log-request-flow__title">
            {node.phase && node.phase !== 'mid' ? (
              <span className="log-request-flow__kind">{node.phase}</span>
            ) : null}
            <span className="log-request-flow__label">{node.label}</span>
          </span>
          <span className="log-request-flow__sub">
            {formatLogTime(node.ts)}
            {node.fn ? ` · ${node.fn}` : ''}
          </span>
        </span>
      </div>
      {isFrame && expanded && frameParts.body.length > 0 ? (
        <div className="log-request-flow__frame-body">
          <ol className="log-request-flow__children">
            {frameParts.body.map((child) => (
              <LogRequestFlowNode
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
      {!isFrame && canToggle && expanded ? (
        <ol className="log-request-flow__children">
          {node.children.map((child) => (
            <LogRequestFlowNode
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
      {isFrame && frameParts.closers.length > 0 ? (
        <ol className="log-request-flow__children">
          {frameParts.closers.map((child) => (
            <LogRequestFlowNode
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
      {isFrame && frameParts.after.length > 0 ? (
        <ol className="log-request-flow__children">
          {frameParts.after.map((child) => (
            <LogRequestFlowNode
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
    </li>
  );
}
