import {
  filterWorkerSnapshots,
  formatWorkerDuration,
  formatWorkerLogTime,
  isWorkerBusy,
  resolveSelectedWorkerId,
  WORKER_CONTROL_LOCALE,
  workerProgressRatio,
  type WithMapPropType,
  type WorkerRuntimeStatus,
  type WorkerSnapshot,
  type WorkerTaskSnapshot,
} from '@hungpvq/map-core';
import { DraggableItemSideBar } from '@hungpvq/react-draggable';
import { mdiCogs, mdiEraser, mdiNotificationClearAll } from '@mdi/js';
import Icon from '@mdi/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MapCommonButton } from '../../components/MapCommonButton';
import { useLang, useRegisterMapControl } from '../../extra';
import { useToolbarControl } from '../../extra/toolbar';
import { useWorkerMonitor } from '../../extra/worker';
import { BaseButton } from '../../field';
import { defaultMapProps, useMap, useShow } from '../../hooks';
import { ModuleContainer } from '../ModuleContainer/ModuleContainer';

export interface WorkerControlProps extends WithMapPropType {
  show?: boolean;
}

function progressPercent(task: WorkerTaskSnapshot) {
  const ratio = workerProgressRatio(task.progress);
  if (ratio == null) return null;
  return Math.round(ratio * 100);
}

function progressText(task: WorkerTaskSnapshot) {
  const percent = progressPercent(task);
  const message = task.progress?.message;
  if (percent == null) return message || '';
  return message ? `${percent}% · ${message}` : `${percent}%`;
}

export function WorkerControl(props: WorkerControlProps) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, moduleContainerProps, order } = useMap({
    ...merged,
    controlId: 'mapWorkerControl',
  });
  const { trans, setLocaleDefault } = useLang(mapId);
  const [show, toggleShow] = useShow(props.show);
  const { workers, now, busy, clearHistory } = useWorkerMonitor();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    setLocaleDefault(WORKER_CONTROL_LOCALE);
  }, [setLocaleDefault]);

  const { panelPosition } = useRegisterMapControl(mapId, {
    id: 'mapWorkerControl',
    panelKind: 'sidebar',
    title: trans('map.worker-control.title'),
    buttonPosition: merged.position,
    show,
    setShow: toggleShow,
    initialPanelPosition: { location: 'left' },
    getProps: () => ({
      position: merged.position,
      controlLayout: merged.controlLayout,
    }),
    actions: [{ type: 'mapWorkerControl', run: () => toggleShow() }],
  });

  const { state, control } = useToolbarControl(mapId, merged, {
    kind: 'single',
    id: 'mapWorkerControl',
    getState: () => ({
      title: trans('map.worker-control.title'),
      order,
      active: show || busy,
      icon: { type: 'mdi' as const, path: mdiCogs },
    }),
    onClick: () => toggleShow(),
  });
  const controlRef = useRef(control);
  controlRef.current = control;

  useEffect(() => {
    controlRef.current.sync();
  }, [show, busy]);

  const filtered = useMemo(
    () => filterWorkerSnapshots(workers, query),
    [workers, query],
  );
  const selected = useMemo(() => {
    const id = resolveSelectedWorkerId(filtered, selectedId);
    return filtered.find((worker) => worker.id === id) ?? null;
  }, [filtered, selectedId]);
  const busyCount = workers.filter(isWorkerBusy).length;
  const manyWorkers = workers.length > 1;
  const hasSelectedHistory = Boolean(
    selected && (selected.history.length > 0 || selected.logs.length > 0),
  );
  const hasAnyHistory = workers.some(
    (worker) => worker.history.length > 0 || worker.logs.length > 0,
  );

  const statusLabel = (status: WorkerRuntimeStatus) =>
    trans(`map.worker-control.status.${status}`);
  const engineLabel = (engine: WorkerTaskSnapshot['engine']) =>
    trans(`map.worker-control.engine.${engine}`);
  const elapsed = (task: WorkerTaskSnapshot) => {
    const ms = task.durationMs ?? Math.max(0, now - task.startedAt);
    return formatWorkerDuration(ms);
  };
  const summary = workers.length
    ? busyCount
      ? `${trans('map.worker-control.count', { n: String(workers.length) })} · ${trans(
          'map.worker-control.busyCount',
          { n: String(busyCount) },
        )}`
      : trans('map.worker-control.count', { n: String(workers.length) })
    : '';

  return (
    <ModuleContainer
      {...moduleContainerProps}
      btn={
        state ? (
          <MapCommonButton
            option={state}
            onClick={(e) => {
              e.stopPropagation();
              control.onAction(e.nativeEvent);
            }}
          />
        ) : null
      }
      draggable={(bind) => (
        <DraggableItemSideBar
          show={show}
          onUpdateShow={(value) => toggleShow(!!value)}
          title={trans('map.worker-control.title')}
          containerId={bind.containerId}
          location={panelPosition.location || 'right'}
        >
          <div className="map-worker-control">
            <div className="map-worker-control__toolbar">
              {workers.length ? (
                <span className="map-worker-control__summary">{summary}</span>
              ) : (
                <span />
              )}
              <div className="map-worker-control__toolbar-actions">
                <BaseButton
                  title={trans('map.worker-control.action.clear')}
                  disabled={!hasSelectedHistory}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selected) clearHistory(selected.id);
                  }}
                >
                  <Icon path={mdiEraser} size="16px" />
                </BaseButton>
                {manyWorkers ? (
                  <BaseButton
                    title={trans('map.worker-control.action.clearAll')}
                    disabled={!hasAnyHistory}
                    onClick={(e) => {
                      e.stopPropagation();
                      clearHistory();
                    }}
                  >
                    <Icon path={mdiNotificationClearAll} size="16px" />
                  </BaseButton>
                ) : null}
              </div>
            </div>
            {!workers.length ? (
              <>
                <p className="map-worker-control__empty">
                  {trans('map.worker-control.empty')}
                </p>
                <p className="map-worker-control__hint">
                  {trans('map.worker-control.hint')}
                </p>
              </>
            ) : null}
            {manyWorkers ? (
              <>
                <input
                  type="search"
                  className="map-worker-control__search"
                  value={query}
                  aria-label={trans('map.worker-control.search')}
                  placeholder={trans('map.worker-control.searchPlaceholder')}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {filtered.length === 0 ? (
                  <p className="map-worker-control__empty">
                    {trans('map.worker-control.emptyMatch')}
                  </p>
                ) : (
                  <ul className="map-worker-control__list">
                    {filtered.map((worker) => {
                      const pending = worker.pending.length
                        ? trans('map.worker-control.pending', {
                            n: String(worker.pending.length),
                          })
                        : '';
                      const meta = [
                        worker.name !== worker.id ? worker.id : '',
                        pending,
                      ]
                        .filter(Boolean)
                        .join(' · ');
                      return (
                        <li
                          key={worker.id}
                          className={`map-worker-control__item${
                            selected?.id === worker.id ? ' is-selected' : ''
                          }`}
                        >
                          <button
                            type="button"
                            className="map-worker-control__pick"
                            onClick={() => setSelectedId(worker.id)}
                          >
                            <span className="map-worker-control__pick-name">
                              {worker.name}
                            </span>
                            <span
                              className="map-worker-control__status"
                              data-status={worker.status}
                            >
                              {statusLabel(worker.status)}
                            </span>
                            {meta ? (
                              <span className="map-worker-control__pick-meta">
                                {meta}
                              </span>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            ) : null}
            {selected ? (
              <div className="map-worker-control__detail">
                <WorkerCard
                  worker={selected}
                  statusLabel={statusLabel(selected.status)}
                  engineLabel={engineLabel}
                  elapsed={elapsed}
                  trans={trans}
                />
              </div>
            ) : null}
          </div>
        </DraggableItemSideBar>
      )}
    />
  );
}

function WorkerCard(props: {
  worker: WorkerSnapshot;
  statusLabel: string;
  engineLabel: (engine: WorkerTaskSnapshot['engine']) => string;
  elapsed: (task: WorkerTaskSnapshot) => string;
  trans: (key: string) => string;
}) {
  const { worker, statusLabel, engineLabel, elapsed, trans } = props;
  const history = worker.history.slice(0, 8);
  const logs = worker.logs.slice(0, 40);

  return (
    <article className="map-worker-control__worker">
      <header className="map-worker-control__head">
        <div className="map-worker-control__name">{worker.name}</div>
        <span
          className="map-worker-control__status"
          data-status={worker.status}
        >
          {statusLabel}
        </span>
      </header>
      <div className="map-worker-control__stats">
        <span>
          {trans('map.worker-control.stats.ok')} {worker.stats.ok}
        </span>
        <span>
          {trans('map.worker-control.stats.error')} {worker.stats.error}
        </span>
        <span>
          {trans('map.worker-control.stats.fallback')} {worker.stats.fallback}
        </span>
      </div>
      {worker.pending.length ? (
        <div className="map-worker-control__tasks">
          {worker.pending.map((task) => {
            const percent = progressPercent(task);
            const text = progressText(task);
            return (
              <div key={task.id} className="map-worker-control__task">
                <div className="map-worker-control__task-row">
                  <span>{task.type}</span>
                  <span>
                    {engineLabel(task.engine)} · {elapsed(task)}
                  </span>
                </div>
                <div
                  className={`map-worker-control__bar${percent == null ? ' is-indeterminate' : ''}`}
                  role="progressbar"
                  aria-valuenow={percent ?? undefined}
                >
                  <div
                    className="map-worker-control__bar-fill"
                    style={
                      percent != null ? { width: `${percent}%` } : undefined
                    }
                  />
                </div>
                {text ? (
                  <div className="map-worker-control__progress">{text}</div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
      {worker.lastError ? (
        <p className="map-worker-control__error">
          {trans('map.worker-control.field.error')}: {worker.lastError}
        </p>
      ) : null}
      {logs.length ? (
        <div className="map-worker-control__logs">
          <div className="map-worker-control__history-title">
            {trans('map.worker-control.field.logs')}
          </div>
          <div className="map-worker-control__log-list">
            {logs.map((entry) => (
              <div
                key={entry.id}
                className="map-worker-control__log"
                data-level={entry.level}
              >
                <span className="map-worker-control__log-time">
                  {formatWorkerLogTime(entry.at)}
                </span>
                <span className="map-worker-control__log-level">
                  {entry.level}
                </span>
                <span className="map-worker-control__log-message">
                  {entry.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {history.length ? (
        <div className="map-worker-control__history">
          <div className="map-worker-control__history-title">
            {trans('map.worker-control.field.history')}
          </div>
          {history.map((task) => (
            <div
              key={task.id}
              className="map-worker-control__history-row"
              data-status={task.status}
            >
              <span>
                {task.status === 'ok' ? '✓' : '✕'} {task.type}
              </span>
              <span>
                {engineLabel(task.engine)} · {elapsed(task)}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}
