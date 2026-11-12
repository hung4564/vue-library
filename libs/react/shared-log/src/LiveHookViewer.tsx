import {
  BaseButton,
  BaseCollapse,
  CopyButton,
  InputCheckbox,
  List,
  ListItem,
  Tabs,
  TreeItem,
} from '@hungpvq/react-ui-core';
import {
  clearLiveTraceEvents,
  debugHeaderRows,
  formatLogTime,
  stringifyDebugRecord,
  subscribeInstances,
  subscribeLiveTrace,
  type InstanceMetadata,
} from '@hungpvq/shared-log';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import {
  ensureReactLogUiStore,
  readLiveSnapshot,
  type ReactLiveSnapshot,
} from './store';
import { DevtoolPanelCard } from './ui/DevtoolPanelCard';
import { DevtoolPanelContainer } from './ui/DevtoolPanelContainer';
import { DevtoolPanelSplit } from './ui/DevtoolPanelSplit';
import { DevtoolPanelToolbar } from './ui/DevtoolPanelToolbar';

type TabId = 'instances' | 'traces';

function shortEventName(eventName: string): string {
  return eventName.replace('component:', '');
}

function subscribe(cb: () => void) {
  const a = subscribeInstances(cb);
  const b = subscribeLiveTrace(cb);
  return () => {
    a();
    b();
  };
}

function getSnapshot(): ReactLiveSnapshot {
  const ui = ensureReactLogUiStore();
  const next = readLiveSnapshot();
  const cached = ui.liveSnapshot;
  if (
    cached &&
    cached.instances === next.instances &&
    cached.events === next.events
  ) {
    return cached;
  }
  ui.liveSnapshot = next;
  return next;
}

type LiveTreeNode = InstanceMetadata & { children: LiveTreeNode[] };

function LiveNode({
  node,
  depth = 0,
  selectedId,
  instanceRenders,
  instanceEvents,
  onSelect,
}: {
  node: LiveTreeNode;
  depth?: number;
  selectedId?: string | null;
  instanceRenders?: Record<string, number>;
  instanceEvents?: Record<string, number>;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;

  const handleSelect = () => {
    onSelect(selectedId === node.id ? '' : node.id);
  };

  return (
    <div
      className={`live-viewer__node${
        expanded && hasChildren ? ' live-viewer__node--open' : ''
      }${hasChildren ? ' live-viewer__node--has-children' : ''}`}
      style={{ '--tree-depth': String(depth) } as React.CSSProperties}
    >
      <div
        className={`live-viewer__node-row${
          selectedId === node.id ? ' live-viewer__node-row--selected' : ''
        }`}
        role="button"
        tabIndex={0}
        onClick={handleSelect}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleSelect();
          }
        }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="live-viewer__twist"
            title={expanded ? 'Collapse' : 'Expand'}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? '▾' : '▸'}
          </button>
        ) : (
          <span
            className="live-viewer__twist live-viewer__twist--empty"
            aria-hidden="true"
          />
        )}
        <span className="live-viewer__rail">
          <span className="live-viewer__dot" />
        </span>
        <span className="live-viewer__card">
          <span className="live-viewer__node-name">{node.component}</span>
          <span className="live-viewer__node-id">({node.id})</span>
        </span>
        {instanceRenders?.[node.id] || instanceEvents?.[node.id] ? (
          <span className="live-viewer__node-badges">
            {instanceRenders?.[node.id] ? (
              <span
                className="live-viewer__node-count"
                title="Render Count"
              >
                #{instanceRenders[node.id]}
              </span>
            ) : null}
            {instanceEvents?.[node.id] ? (
              <span
                className="live-viewer__node-count"
                title="Total Events"
              >
                {instanceEvents[node.id]}ev
              </span>
            ) : null}
          </span>
        ) : null}
      </div>
      {expanded && hasChildren ? (
        <div className="live-viewer__node-children">
          {node.children.map((child) => (
            <LiveNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              instanceRenders={instanceRenders}
              instanceEvents={instanceEvents}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function LiveHookViewer() {
  const { instances, events } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
  const [activeTab, setActiveTab] = useState<TabId>('instances');
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(
    null,
  );
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const eventListRef = useRef<HTMLDivElement | null>(null);

  const tabItems = useMemo(
    () => [
      { id: 'instances', label: `Instances (${instances.length})` },
      { id: 'traces', label: `Traces (${events.length})` },
    ],
    [instances.length, events.length],
  );

  const roots = useMemo(() => {
    const map = new Map<string, LiveTreeNode>();
    for (const item of instances) {
      map.set(item.id, { ...item, children: [] });
    }
    const nextRoots: LiveTreeNode[] = [];
    for (const node of map.values()) {
      const parent = node.parentId ? map.get(node.parentId) : undefined;
      if (parent) parent.children.push(node);
      else nextRoots.push(node);
    }
    return nextRoots;
  }, [instances]);

  const selectedInstance = useMemo(() => {
    if (!selectedInstanceId) return instances[0] ?? null;
    return (
      instances.find((item) => item.id === selectedInstanceId) ??
      instances[0] ??
      null
    );
  }, [instances, selectedInstanceId]);

  const selectedInstanceTraces = useMemo(() => {
    if (!selectedInstance) return [];
    return events.filter((ev) => ev.data.instanceId === selectedInstance.id);
  }, [events, selectedInstance]);

  const instanceRenders = useMemo(() => {
    const map: Record<string, number> = {};
    for (const ev of events) {
      const id = ev.data.instanceId;
      if (id && ev.data.renderCount) {
        map[id] = Math.max(map[id] || 0, ev.data.renderCount);
      }
    }
    return map;
  }, [events]);

  const instanceEvents = useMemo(() => {
    const map: Record<string, number> = {};
    for (const ev of events) {
      const id = ev.data.instanceId;
      if (id) {
        map[id] = (map[id] || 0) + 1;
      }
    }
    return map;
  }, [events]);

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return events[events.length - 1] ?? null;
    return (
      events.find((event) => event.id === selectedEventId) ??
      events[events.length - 1] ??
      null
    );
  }, [selectedEventId, events]);

  const selectedEventJson = useMemo(
    () => (selectedEvent ? stringifyDebugRecord(selectedEvent) : ''),
    [selectedEvent],
  );

  const selectedEventRows = useMemo(
    () => (selectedEvent ? debugHeaderRows(selectedEvent) : []),
    [selectedEvent],
  );

  const onClearTraces = () => {
    clearLiveTraceEvents();
    setSelectedEventId(null);
  };

  const viewTrace = (eventId: string) => {
    setSelectedEventId(eventId);
    setActiveTab('traces');
  };

  const viewInstance = (instanceId: string) => {
    setSelectedInstanceId(instanceId);
    setActiveTab('instances');
  };

  useEffect(() => {
    if (autoScroll && eventListRef.current && activeTab === 'traces') {
      eventListRef.current.scrollTop = eventListRef.current.scrollHeight;
    }
  }, [events.length, autoScroll, activeTab]);

  return (
    <DevtoolPanelContainer
      className="live-viewer"
      title={
        <DevtoolPanelToolbar
          title={
            <>
              <Tabs
                items={tabItems}
                value={activeTab}
                onChange={(id) => setActiveTab(id as TabId)}
                withPanes={false}
              />
            </>
          }
          actions={
            activeTab === 'traces' ? (
              <>
                {' '}
                <BaseButton
                  title="Clear all recorded live traces"
                  onClick={onClearTraces}
                >
                  Clear traces
                </BaseButton>
                <InputCheckbox
                  checked={autoScroll}
                  onChange={setAutoScroll}
                  label="Auto-scroll"
                />
              </>
            ) : null
          }
        />
      }
    >
      <div className="live-viewer__container">
        <div className="live-viewer__body">
          {/* TAB 1: INSTANCES */}
          {activeTab === 'instances' ? (
            <DevtoolPanelSplit>
              {/* Left: Instances Tree */}
              <DevtoolPanelCard className="live-viewer__pane-list">
                {roots.length === 0 ? (
                  <div className="live-viewer__empty">
                    No live instances. Call useLiveHookDebug().
                  </div>
                ) : (
                  roots.map((node) => (
                    <LiveNode
                      key={node.id}
                      node={node}
                      depth={0}
                      selectedId={selectedInstanceId}
                      instanceRenders={instanceRenders}
                      instanceEvents={instanceEvents}
                      onSelect={(id) => setSelectedInstanceId(id || null)}
                    />
                  ))
                )}
              </DevtoolPanelCard>

              {/* Right: Selected Instance Detail */}
              <DevtoolPanelCard
                as="aside"
                className="live-viewer__pane-detail"
                aria-label="Instance details"
              >
                {selectedInstance ? (
                  <>
                    <div className="log-viewer__detail-h">
                      <div>
                        <span
                          className="live-viewer__dot"
                          style={{
                            display: 'inline-block',
                            verticalAlign: 'middle',
                            marginRight: '6px',
                          }}
                        />
                        <strong
                          style={{
                            wordBreak: 'break-all',
                          }}
                        >
                          {selectedInstance.component}
                        </strong>
                      </div>
                      <CopyButton
                        title="Copy instance JSON"
                        value={JSON.stringify(selectedInstance, null, 2)}
                      />
                    </div>

                    <div className="debug-list-item">
                      <span className="debug-list-item-label">Component</span>
                      <div className="debug-list-item-value">
                        <span>{selectedInstance.component}</span>
                      </div>
                    </div>
                    <div className="debug-list-item">
                      <span className="debug-list-item-label">Instance ID</span>
                      <div className="debug-list-item-value">
                        <code className="dataset-viewer__mono">
                          {selectedInstance.id}
                        </code>
                      </div>
                    </div>
                    <div className="debug-list-item">
                      <span className="debug-list-item-label">Parent ID</span>
                      <div className="debug-list-item-value">
                        {selectedInstance.parentId ? (
                          <BaseButton
                            variant="text"
                            size="small"
                            title={`Select parent instance ${selectedInstance.parentId}`}
                            onClick={() =>
                              setSelectedInstanceId(
                                selectedInstance.parentId ?? null,
                              )
                            }
                          >
                            {selectedInstance.parentId}
                          </BaseButton>
                        ) : (
                          <span>(none — root component)</span>
                        )}
                      </div>
                    </div>
                    <div className="debug-list-item">
                      <span className="debug-list-item-label">Framework</span>
                      <div className="debug-list-item-value">
                        <span>{selectedInstance.framework}</span>
                      </div>
                    </div>
                    <div className="debug-list-item">
                      <span className="debug-list-item-label">Renders</span>
                      <div className="debug-list-item-value">
                        <span>
                          #{instanceRenders[selectedInstance.id] || 0}
                        </span>
                      </div>
                    </div>
                    <div className="debug-list-item">
                      <span className="debug-list-item-label">
                        Total Events
                      </span>
                      <div className="debug-list-item-value">
                        <span>
                          {{ ...instanceEvents }[selectedInstance.id] || 0}
                        </span>
                      </div>
                    </div>

                    {/* Instance Traces History */}
                    <section
                      className="dataset-viewer__section"
                      style={{ marginTop: '14px' }}
                    >
                      <h4 className="dataset-viewer__section-h">
                        Event History ({selectedInstanceTraces.length})
                      </h4>
                      {selectedInstanceTraces.length === 0 ? (
                        <p className="live-viewer__empty">
                          No traces recorded for this instance yet.
                        </p>
                      ) : (
                        <List
                          dense
                          divided
                        >
                          {selectedInstanceTraces.map((ev) => (
                            <ListItem
                              key={ev.id}
                              interactive
                              dense
                              title={`Inspect trace ${ev.id}`}
                              onClick={() => viewTrace(ev.id)}
                              prefix={
                                <span
                                  className={`live-viewer__event-badge live-viewer__event-badge--${shortEventName(
                                    ev.data.event,
                                  )}`}
                                >
                                  {shortEventName(ev.data.event)}
                                </span>
                              }
                              suffix={
                                <span className="live-viewer__event-time">
                                  {formatLogTime(ev.header.ts)}
                                </span>
                              }
                            >
                              <div className="live-viewer__event-main">
                                {ev.data.renderCount ? (
                                  <span className="live-viewer__event-render">
                                    #{ev.data.renderCount}
                                  </span>
                                ) : null}
                                {ev.data.changes &&
                                ev.data.changes.length > 0 ? (
                                  <span className="live-viewer__changes-badge">
                                    {ev.data.changes.length} change(s)
                                  </span>
                                ) : null}
                              </div>
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </section>
                  </>
                ) : (
                  <p className="live-viewer__empty">
                    Select an instance from the tree to inspect details, render
                    count, and events.
                  </p>
                )}
              </DevtoolPanelCard>
            </DevtoolPanelSplit>
          ) : null}

          {/* TAB 2: TRACES */}
          {activeTab === 'traces' ? (
            <DevtoolPanelSplit>
              {/* Left: Traces Feed */}
              <DevtoolPanelCard
                className="live-viewer__pane-list"
                ref={eventListRef}
              >
                {events.length === 0 ? (
                  <div className="live-viewer__empty">No traces recorded.</div>
                ) : (
                  <List
                    dense
                    divided
                  >
                    {events.map((event) => (
                      <ListItem
                        key={event.id}
                        selected={selectedEvent?.id === event.id}
                        interactive
                        dense
                        onClick={() => setSelectedEventId(event.id)}
                        prefix={
                          <span
                            className={`live-viewer__event-badge live-viewer__event-badge--${shortEventName(
                              event.data.event,
                            )}`}
                          >
                            {shortEventName(event.data.event)}
                          </span>
                        }
                        suffix={
                          <span className="live-viewer__event-time">
                            {formatLogTime(event.header.ts)}
                          </span>
                        }
                      >
                        <div className="live-viewer__event-main">
                          <span className="live-viewer__event-component">
                            {event.data.component}
                          </span>
                          {event.data.renderCount ? (
                            <span
                              className="live-viewer__event-render"
                              title="Render Count"
                            >
                              #{event.data.renderCount}
                            </span>
                          ) : null}
                          {event.data.changes &&
                          event.data.changes.length > 0 ? (
                            <span
                              className="live-viewer__changes-badge"
                              title="Changed properties"
                            >
                              {event.data.changes.length} change(s)
                            </span>
                          ) : null}
                        </div>
                      </ListItem>
                    ))}
                  </List>
                )}
              </DevtoolPanelCard>

              {/* Right: Selected Trace Detail */}
              <DevtoolPanelCard
                as="aside"
                className="live-viewer__pane-detail"
                aria-label="Trace details"
              >
                {selectedEvent ? (
                  <>
                    <div className="log-viewer__detail-h">
                      <div>
                        <span
                          className={`live-viewer__event-badge live-viewer__event-badge--${shortEventName(
                            selectedEvent.data.event,
                          )}`}
                        >
                          {shortEventName(selectedEvent.data.event)}
                        </span>
                        <strong style={{ marginLeft: '6px' }}>
                          {selectedEvent.data.component}
                        </strong>
                        {selectedEvent.data.renderCount ? (
                          <span
                            className="live-viewer__event-render"
                            style={{ marginLeft: '4px' }}
                          >
                            Render #{selectedEvent.data.renderCount}
                          </span>
                        ) : null}
                      </div>
                      <div className="log-viewer__detail-h-actions">
                        <CopyButton
                          title="Copy JSON"
                          value={selectedEventJson}
                        />
                      </div>
                    </div>

                    {selectedEvent.data.changes &&
                    selectedEvent.data.changes.length > 0 ? (
                      <div
                        className="dataset-viewer__section"
                        style={{ marginBottom: '12px' }}
                      >
                        <BaseCollapse
                          selected={true}
                          className="live-viewer__changes-collapse"
                          header={
                            <strong style={{ fontSize: '12px' }}>
                              Changed Properties (
                              {selectedEvent.data.changes.length})
                            </strong>
                          }
                        >
                          <table className="live-viewer__diff-table">
                            <thead>
                              <tr>
                                <th>Property</th>
                                <th>Previous Value</th>
                                <th>Current Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedEvent.data.changes.map((change, idx) => (
                                <tr key={change.key ?? idx}>
                                  <td style={{ fontWeight: 600 }}>
                                    <code>{change.key}</code>
                                    {change.source ? (
                                      <span
                                        style={{
                                          fontSize: '10px',
                                          opacity: 0.7,
                                          marginLeft: '4px',
                                        }}
                                      >
                                        ({change.source})
                                      </span>
                                    ) : null}
                                  </td>
                                  <td className="live-viewer__diff-old">
                                    <code>
                                      {JSON.stringify(change.previousValue)}
                                    </code>
                                  </td>
                                  <td className="live-viewer__diff-new">
                                    <code>
                                      {JSON.stringify(change.nextValue)}
                                    </code>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </BaseCollapse>
                      </div>
                    ) : null}

                    {/* Metadata table */}
                    <div className="debug-list-item">
                      <span className="debug-list-item-label">Component</span>
                      <div className="debug-list-item-value">
                        <span>{selectedEvent.data.component}</span>
                      </div>
                    </div>
                    <div className="debug-list-item">
                      <span className="debug-list-item-label">Instance ID</span>
                      <div className="debug-list-item-value">
                        <BaseButton
                          variant="text"
                          size="small"
                          title={`View instance ${selectedEvent.data.instanceId} in Instances tab`}
                          onClick={() =>
                            viewInstance(selectedEvent.data.instanceId)
                          }
                        >
                          {selectedEvent.data.instanceId}
                        </BaseButton>
                      </div>
                    </div>
                    {selectedEvent.data.parentId ? (
                      <div className="debug-list-item">
                        <span className="debug-list-item-label">Parent ID</span>
                        <div className="debug-list-item-value">
                          <code className="dataset-viewer__mono">
                            {selectedEvent.data.parentId}
                          </code>
                        </div>
                      </div>
                    ) : null}
                    <div className="debug-list-item">
                      <span className="debug-list-item-label">Timestamp</span>
                      <div className="debug-list-item-value">
                        <span>{formatLogTime(selectedEvent.header.ts)}</span>
                      </div>
                    </div>

                    <div className="log-viewer__detail-meta">
                      <h4 className="dataset-viewer__section-h">Header</h4>
                      <table className="log-viewer__header-table">
                        <tbody>
                          {selectedEventRows.map((row) => (
                            <tr key={row.key}>
                              <td className="log-viewer__header-label">
                                {row.key}
                              </td>
                              <td className="log-viewer__header-val">
                                <code>{row.value}</code>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <BaseCollapse
                      selected={true}
                      className="live-viewer__raw-collapse"
                      header={
                        <strong style={{ fontSize: '12px' }}>
                          Data Payload
                        </strong>
                      }
                    >
                      <TreeItem data={selectedEvent.data} />
                    </BaseCollapse>
                  </>
                ) : (
                  <div className="live-viewer__empty">
                    Select a trace event from the timeline to inspect details,
                    changed properties, and props/state payload.
                  </div>
                )}
              </DevtoolPanelCard>
            </DevtoolPanelSplit>
          ) : null}
        </div>
      </div>
    </DevtoolPanelContainer>
  );
}
