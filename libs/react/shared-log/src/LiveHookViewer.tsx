import {
  clearLiveTraceEvents,
  getLiveTraceEvents,
  getRegisteredInstances,
  type InstanceMetadata,
  subscribeInstances,
  subscribeLiveTrace,
} from '@hungpvq/shared-log';
import { BaseButton } from '@hungpvq/react-ui-core';
import { useSyncExternalStore } from 'react';

function subscribe(cb: () => void) {
  const a = subscribeInstances(cb);
  const b = subscribeLiveTrace(cb);
  return () => {
    a();
    b();
  };
}

function getSnapshot() {
  return {
    instances: getRegisteredInstances(),
    events: getLiveTraceEvents(),
  };
}

type LiveTreeNode = InstanceMetadata & { children: LiveTreeNode[] };

function LiveNode({ node }: { node: LiveTreeNode }) {
  return (
    <div className="live-viewer__node">
      <div className="live-viewer__node-label">
        {node.component} ({node.id})
      </div>
      {node.children.map((child) => (
        <LiveNode
          key={child.id}
          node={child}
        />
      ))}
    </div>
  );
}

export function LiveHookViewer() {
  const { instances, events } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
  const map = new Map<string, LiveTreeNode>();
  for (const item of instances) {
    map.set(item.id, { ...item, children: [] });
  }
  const roots: LiveTreeNode[] = [];
  for (const node of map.values()) {
    const parent = node.parentId ? map.get(node.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  return (
    <div className="live-viewer">
      <div className="live-viewer__toolbar">
        <span>{instances.length} instance(s)</span>
        <BaseButton onClick={clearLiveTraceEvents}>Clear traces</BaseButton>
      </div>
      <div className="live-viewer__split">
        <div className="live-viewer__tree">
          {roots.length === 0 ? (
            <div>No live instances. Call useLiveHookDebug().</div>
          ) : (
            roots.map((node) => (
              <LiveNode
                key={node.id}
                node={node}
              />
            ))
          )}
        </div>
        <div className="live-viewer__events">
          {events.map((event, index) => (
            <div
              key={`${event.ts}-${index}`}
              className="live-viewer__event"
            >
              {event.event} · {event.component} · #{event.renderCount}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
