import {
  createActionFeedback,
  type ActionFeedbackPhase,
} from '@hungpvq/map-core';
import { MapControlButton, MapCopyButton } from '@hungpvq/react-map-core';
import { InputActionRow, InputSelect } from '@hungpvq/react-map-core/fields';
import {
  type DatasetDebugApi,
  type DatasetInspectSnapshot,
  type DatasetNodeSummary,
  type DatasetTreeNode,
  type MenuInspectDetail,
  type MenuSummary,
  type PartitionedMenuSummary,
} from '@hungpvq/map-debug/dataset';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useDevtoolState } from '../useDevtoolState';
import { DatasetTreeNav } from './DatasetTreeNav';
import { TreeItem } from './TreeItem';

const BUCKETS = ['title', 'extra', 'menu', 'bottom', 'prebottom'] as const;
type PaneId = 'roots' | 'inspect' | 'menus';
type SelectItem = { value: string; text: string };

/** Special find targets (not IDataset.type). Hidden when current node is root. */
const FIND_PARENT = '__find:parent';
const FIND_ROOT = '__find:root';
const FIND_COMPOSITE = '__find:composite';

const SPECIAL_FIND_ITEMS: SelectItem[] = [
  { value: FIND_PARENT, text: 'parent' },
  { value: FIND_ROOT, text: 'root' },
  {
    value: FIND_COMPOSITE,
    text: 'composite · nearest group',
  },
];

/** Keep blink + primary text for ~4 pulses (0.7s × 4). */
const FIND_HIGHLIGHT_MS = 2800;

const ALL_PANES: { id: PaneId; label: string }[] = [
  { id: 'roots', label: 'Roots' },
  { id: 'inspect', label: 'Inspect' },
  { id: 'menus', label: 'Menus' },
];

const TARGET_ITEMS: SelectItem[] = [
  { value: 'layer', text: 'layer' },
  { value: 'item', text: 'item' },
];

function flag(v: boolean) {
  return v ? 'yes' : 'no';
}

function actionLabel(
  phase: ActionFeedbackPhase,
  activeKey: string | null,
  key: string,
  idle: string,
  done = 'Done',
) {
  if (activeKey !== key) return idle;
  if (phase === 'loading') return '…';
  if (phase === 'success') {
    if (key === 'dataset') return 'Pinned';
    if (key === 'find') return 'Found';
    return done;
  }
  if (phase === 'error') return 'Failed';
  return idle;
}

function DetailRow({
  label,
  children,
  copyValue,
}: {
  label: string;
  children: ReactNode;
  copyValue?: string;
}) {
  return (
    <div className="dataset-viewer__row">
      <span className="dataset-viewer__row-label">{label}</span>
      <div className="dataset-viewer__row-value">{children}</div>
      {copyValue ? (
        <div className="dataset-viewer__row-copy">
          <MapCopyButton title={`Copy ${label}`} value={copyValue} />
        </div>
      ) : null}
    </div>
  );
}

export function DatasetMenuViewer() {
  const { filterMapId } = useDevtoolState();
  const [ready, setReady] = useState(false);
  const [api, setApi] = useState<DatasetDebugApi | null>(null);
  const [pane, setPane] = useState<PaneId>('roots');
  const [mapId, setMapId] = useState('');
  const [datasetId, setDatasetId] = useState('');
  const [target, setTarget] = useState<'layer' | 'item'>('layer');
  const [control, setControl] = useState('layer-control');
  const [controlIds, setControlIds] = useState<Record<string, string>>({});
  const [mapIds, setMapIds] = useState<string[]>([]);
  const [forest, setForest] = useState<DatasetTreeNode[]>([]);
  const [rootOptions, setRootOptions] = useState<DatasetNodeSummary[]>([]);
  const [snapshot, setSnapshot] = useState<DatasetInspectSnapshot | null>(null);
  const [rootTypes, setRootTypes] = useState<string[]>([]);
  const [findType, setFindType] = useState('');
  const [findMiss, setFindMiss] = useState(false);
  const [highlightIds, setHighlightIds] = useState<string[]>([]);
  const [findExpandIds, setFindExpandIds] = useState<string[]>([]);
  const highlightClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [menuBuckets, setMenuBuckets] = useState<PartitionedMenuSummary>({
    extra: [],
    menu: [],
    bottom: [],
    prebottom: [],
    title: [],
  });
  const [selectedMenuId, setSelectedMenuId] = useState('');
  const [menuDetail, setMenuDetail] = useState<MenuInspectDetail | null>(null);
  const menusPaneRef = useRef<HTMLDivElement | null>(null);
  const menuDetailRef = useRef<HTMLElement | null>(null);
  const [actionPhase, setActionPhase] = useState<ActionFeedbackPhase>('idle');
  const [actionKey, setActionKey] = useState<string | null>(null);
  const actionFeedbackRef = useRef(
    createActionFeedback({
      onChange: (phase, key) => {
        setActionPhase(phase);
        setActionKey(key);
      },
    }),
  );

  useEffect(() => () => actionFeedbackRef.current.dispose(), []);

  useEffect(
    () => () => {
      if (highlightClearTimerRef.current) {
        clearTimeout(highlightClearTimerRef.current);
        highlightClearTimerRef.current = null;
      }
    },
    [],
  );

  const getApi = useCallback((): DatasetDebugApi | null => {
    if (typeof window !== 'undefined' && window.__hungpvqDatasetDebug) {
      return window.__hungpvqDatasetDebug;
    }
    return api;
  }, [api]);

  const scrollMenusToLatest = useCallback(() => {
    requestAnimationFrame(() => {
      if (menusPaneRef.current) menusPaneRef.current.scrollTop = 0;
      menuDetailRef.current?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    });
  }, []);

  const previewMenus = useCallback(
    (opts?: { control?: string; target?: 'layer' | 'item'; menuId?: string }) => {
      const d = getApi();
      if (!d) return;
      const ctl = opts?.control ?? control;
      const tgt = opts?.target ?? target;
      const preview = d.previewMenus({
        control: ctl,
        target: tgt,
      });
      if (preview) setMenuBuckets(preview);
      const mid = opts?.menuId ?? selectedMenuId;
      if (mid) {
        const detail =
          d.inspectMenu({
            menuId: mid,
            control: ctl,
            target: tgt,
          }) ?? null;
        setMenuDetail(detail);
        if (!detail) setSelectedMenuId('');
      }
    },
    [control, getApi, selectedMenuId, target],
  );

  const selectMenu = useCallback(
    (m: MenuSummary) => {
      const id = m.id || m.key;
      setSelectedMenuId(id || m.name || m.type || '');
      const d = getApi();
      let detail: MenuInspectDetail | null = null;
      if (id) {
        detail =
          d?.inspectMenu({
            menuId: id,
            control,
            target,
          }) ?? null;
      }
      if (!detail) {
        const fallbackId = id || m.name || m.type || 'menu';
        detail = {
          key: m.key || fallbackId,
          id: fallbackId,
          idGenerated: m.idGenerated ?? !m.id,
          name: m.name,
          type: m.type,
          summary: {
            ...m,
            key: m.key || fallbackId,
            id: fallbackId,
          },
          location: m.location,
          effectiveLocation: m.effectiveLocation ?? 'extra',
          order: m.order,
          icon: m.icon,
          componentKey: m.componentKey,
          byControlKeys: m.byControlKeys ?? [],
          hasClick: m.hasClick,
          source: m.source,
          sourceLabel: m.sourceLabel,
          hostType: m.hostType,
          hostId: m.hostId,
          control: m.control ?? control,
          target: m.target ?? target,
          rawKeys: [],
        };
      }
      setMenuDetail(detail);
      requestAnimationFrame(() => {
        menuDetailRef.current?.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      });
    },
    [control, getApi, target],
  );

  const refreshSnapshot = useCallback(() => {
    const d = getApi();
    if (!d) {
      setSnapshot(null);
      setRootTypes([]);
      return;
    }
    setSnapshot(d.inspect() ?? null);
    const root = d.root();
    const types = root ? d.listTypes(root) : d.listTypes();
    setRootTypes(types);
  }, [getApi]);

  const refreshLists = useCallback(
    (mid: string) => {
      const d = getApi();
      if (!d) return;
      setMapIds(d.listMapIds());
      setControlIds({ ...d.MENU_CONTROL_ID });
      if (!mid) {
        setForest([]);
        setRootOptions([]);
        setRootTypes([]);
        return;
      }
      setForest(d.listForest(mid));
      setRootOptions(d.listDatasets(mid));
    },
    [getApi],
  );

  const syncSession = useCallback(
    (opts?: {
      mapId?: string;
      datasetId?: string;
      control?: string;
      target?: 'layer' | 'item';
      pane?: PaneId;
    }) => {
      const d = getApi();
      if (!d) return;
      const mid = opts?.mapId ?? mapId;
      const did = opts?.datasetId ?? datasetId;
      const ctl = opts?.control ?? control;
      const tgt = opts?.target ?? target;
      const pn = opts?.pane ?? pane;
      d.setSession({
        mapId: mid || undefined,
        datasetId: did || undefined,
        control: ctl,
        target: tgt,
        pane: pn,
      });
      refreshSnapshot();
      previewMenus({ control: ctl, target: tgt });
    },
    [
      control,
      datasetId,
      getApi,
      mapId,
      pane,
      previewMenus,
      refreshSnapshot,
      target,
    ],
  );

  const scrollToDataset = useCallback((id: string) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.querySelector(
          `[data-dataset-id="${CSS.escape(id)}"]`,
        ) as HTMLElement | null;
        el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });
    });
  }, []);

  const highlightNode = useCallback(
    (id: string, expandIds: string[]) => {
      if (highlightClearTimerRef.current) {
        clearTimeout(highlightClearTimerRef.current);
        highlightClearTimerRef.current = null;
      }
      setHighlightIds([id]);
      setFindExpandIds(expandIds);
      scrollToDataset(id);
      highlightClearTimerRef.current = setTimeout(() => {
        setHighlightIds([]);
        highlightClearTimerRef.current = null;
      }, FIND_HIGHLIGHT_MS);
    },
    [scrollToDataset],
  );

  const selectDataset = useCallback(
    (id: string) => {
      setDatasetId(id);
      setFindMiss(false);
      syncSession({ datasetId: id });
    },
    [syncSession],
  );

  const setPaneSafe = useCallback(
    (next: PaneId) => {
      if (!datasetId && next !== 'roots') return;
      setPane(next);
      syncSession({ pane: next });
    },
    [datasetId, syncSession],
  );

  const pinRoot = useCallback(
    (id: string) => {
      void actionFeedbackRef.current.run('dataset', () => {
        const d = getApi();
        if (!d) throw new Error('missing');
        const node = d.getDataset(mapId || undefined, id);
        if (!node) throw new Error('not found');
        d.pin('dataset', node);
      });
    },
    [getApi, mapId],
  );

  const debugRoot = useCallback(
    (id: string) => {
      setDatasetId(id);
      setFindMiss(false);
      setPane('inspect');
      syncSession({ datasetId: id, pane: 'inspect' });
    },
    [syncSession],
  );

  const clearSelection = useCallback(() => {
    if (highlightClearTimerRef.current) {
      clearTimeout(highlightClearTimerRef.current);
      highlightClearTimerRef.current = null;
    }
    setDatasetId('');
    setFindMiss(false);
    setHighlightIds([]);
    setFindExpandIds([]);
    setPane('roots');
    syncSession({ datasetId: '', pane: 'roots' });
  }, [syncSession]);

  const runFindPart = useCallback(() => {
    setFindMiss(false);
    if (highlightClearTimerRef.current) {
      clearTimeout(highlightClearTimerRef.current);
      highlightClearTimerRef.current = null;
    }
    setHighlightIds([]);
    setFindExpandIds([]);
    void actionFeedbackRef.current.run('find', () => {
      const d = getApi();
      if (!d || !findType || !snapshot) {
        setFindMiss(true);
        throw new Error('missing');
      }

      if (findType === FIND_PARENT) {
        const id = snapshot.hierarchy.parentId;
        if (!id) {
          setFindMiss(true);
          throw new Error('not found');
        }
        const node = d.getDataset(undefined, id);
        highlightNode(id, node ? d.pathIds(node) : [id]);
        return;
      }

      if (findType === FIND_ROOT) {
        const id = snapshot.hierarchy.rootId;
        if (!id || id === snapshot.identity.id) {
          setFindMiss(true);
          throw new Error('not found');
        }
        highlightNode(id, [id]);
        return;
      }

      if (findType === FIND_COMPOSITE) {
        let node = d.dataset?.getParent();
        while (node) {
          if (node.type === 'composite') {
            highlightNode(node.id, d.pathIds(node));
            return;
          }
          node = node.getParent();
        }
        setFindMiss(true);
        throw new Error('not found');
      }

      const from = d.root() ?? d.dataset;
      const part = from ? d.findPartByType(findType, from) : undefined;
      if (!part) {
        setFindMiss(true);
        throw new Error('not found');
      }
      highlightNode(part.id, d.pathIds(part));
    });
  }, [findType, getApi, highlightNode, snapshot]);

  const onMapChange = useCallback(
    (mid: string) => {
      setMapId(mid);
      setDatasetId('');
      setFindType('');
      setFindMiss(false);
      if (highlightClearTimerRef.current) {
        clearTimeout(highlightClearTimerRef.current);
        highlightClearTimerRef.current = null;
      }
      setHighlightIds([]);
      setFindExpandIds([]);
      setPane('roots');
      refreshLists(mid);
      syncSession({ mapId: mid, datasetId: '', pane: 'roots' });
    },
    [refreshLists, syncSession],
  );

  const hydrateFromSession = useCallback(() => {
    const d = getApi();
    if (!d) return;
    const ids = d.listMapIds();
    setMapIds(ids);
    setControlIds({ ...d.MENU_CONTROL_ID });
    const s = d.session;
    const mid =
      filterMapId !== 'all' && ids.includes(filterMapId)
        ? filterMapId
        : s.mapId && ids.includes(s.mapId)
          ? s.mapId
          : ids[0] || '';
    setMapId(mid);
    refreshLists(mid);
    const search = mid ? d.listSearchable(mid) : [];
    const stillThere = search.some((x) => x.id === s.datasetId);
    const did = stillThere && s.datasetId ? s.datasetId : '';
    setDatasetId(did);
    if (s.control) setControl(String(s.control));
    if (s.target === 'layer' || s.target === 'item') setTarget(s.target);
    let nextPane: PaneId = 'roots';
    if (!did) {
      nextPane = 'roots';
    } else if (s.pane === 'roots' || s.pane === 'inspect' || s.pane === 'menus') {
      nextPane = s.pane;
    } else if (s.pane === 'tree' || s.pane === 'find') {
      nextPane = 'inspect';
    } else {
      nextPane = 'inspect';
    }
    setPane(nextPane);
    syncSession({
      mapId: mid,
      datasetId: did,
      control: s.control ? String(s.control) : control,
      target: s.target === 'item' ? 'item' : 'layer',
      pane: nextPane,
    });
  }, [control, filterMapId, getApi, refreshLists, syncSession]);

  useEffect(() => {
    if (!ready) return;
    const ids = mapIds;
    const next =
      filterMapId !== 'all' && ids.includes(filterMapId)
        ? filterMapId
        : mapId && ids.includes(mapId)
          ? mapId
          : ids[0] || '';
    if (next !== mapId) onMapChange(next);
  }, [filterMapId, mapIds, mapId, onMapChange, ready]);

  useEffect(() => {
    const d =
      typeof window !== 'undefined' ? window.__hungpvqDatasetDebug : undefined;
    setApi(d ?? null);
    setReady(Boolean(d));
  }, []);

  useEffect(() => {
    if (!ready) return;
    hydrateFromSession();
  }, [ready, hydrateFromSession]);

  useEffect(() => {
    if (!ready) return;
    const d = getApi();
    if (!d) return;
    let lastRev = d.sessionRev ?? 0;
    const timer = window.setInterval(() => {
      const live = getApi();
      if (!live) return;
      const rev = live.sessionRev ?? 0;
      if (rev === lastRev) return;
      lastRev = rev;
      hydrateFromSession();
    }, 300);
    return () => window.clearInterval(timer);
  }, [ready, getApi, hydrateFromSession]);

  const pathIds = snapshot?.hierarchy.pathIds ?? [];

  const treeExpandIds = useMemo(() => {
    const seen = new Set<string>(pathIds);
    for (const id of findExpandIds) seen.add(id);
    return [...seen];
  }, [findExpandIds, pathIds]);

  const currentRootNodes = useMemo(() => {
    const rootId = snapshot?.hierarchy.rootId;
    if (!rootId) return forest.slice(0, 1);
    const match = forest.find((n) => n.id === rootId);
    return match ? [match] : forest.slice(0, 1);
  }, [forest, snapshot]);

  const isCurrentRoot = snapshot?.identity.kind === 'root';

  const specialFindItems = useMemo<SelectItem[]>(
    () => (isCurrentRoot ? [] : SPECIAL_FIND_ITEMS),
    [isCurrentRoot],
  );

  const partTypeItems = useMemo<SelectItem[]>(
    () =>
      rootTypes
        .filter((t) => t !== 'composite')
        .map((t) => ({ value: t, text: t })),
    [rootTypes],
  );

  const rootTypeItems = useMemo<SelectItem[]>(
    () => [...specialFindItems, ...partTypeItems],
    [partTypeItems, specialFindItems],
  );

  const isSpecialFindType =
    findType === FIND_PARENT ||
    findType === FIND_ROOT ||
    findType === FIND_COMPOSITE;

  useEffect(() => {
    const allowed = new Set(rootTypeItems.map((i) => i.value));
    if (!findType || !allowed.has(findType)) {
      setFindType(rootTypeItems[0]?.value || '');
    }
  }, [findType, rootTypeItems]);

  const hasDatasetSelection = Boolean(datasetId);
  const activeRootId =
    snapshot?.hierarchy.rootId ||
    (rootOptions.some((r) => r.id === datasetId) ? datasetId : '');
  const visiblePanes = hasDatasetSelection
    ? ALL_PANES
    : ALL_PANES.filter((p) => p.id === 'roots');

  const controlItems = useMemo<SelectItem[]>(
    () =>
      Object.entries(controlIds).map(([key, val]) => ({
        value: val,
        text: key,
      })),
    [controlIds],
  );

  const visibleBuckets = useMemo(
    () => BUCKETS.filter((bucket) => (menuBuckets[bucket] || []).length > 0),
    [menuBuckets],
  );

  if (!ready) {
    return (
      <div className="dataset-viewer">
        <p className="dataset-viewer__empty">
          Cần <code>@hungpvq/map-dataset</code> + <code>installDevtools()</code>
          . F12: <code>__hungpvqDatasetDebug.help()</code>
        </p>
      </div>
    );
  }

  return (
    <div className="dataset-viewer">
      <div className="dataset-viewer__toolbar">
        {snapshot ? (
          <div
            className="dataset-viewer__current"
            title={snapshot.identity.id}
          >
            <span
              className="dataset-viewer__kind"
              data-kind={snapshot.identity.kind}
            >
              {snapshot.identity.kind}
            </span>
            <span className="dataset-viewer__muted">
              {snapshot.identity.type}
            </span>
            <strong>{snapshot.identity.name}</strong>
          </div>
        ) : (
          <p className="dataset-viewer__current dataset-viewer__muted">
            No dataset selected
          </p>
        )}
        <div className="dataset-viewer__actions">
          {hasDatasetSelection ? (
            <MapControlButton
              variant="text"
              size="small"
              title="Clear dataset selection"
              onClick={clearSelection}
            >
              Clear
            </MapControlButton>
          ) : null}
          {hasDatasetSelection ? (
            <MapControlButton
              variant="text"
              size="small"
              title={actionLabel(
                actionPhase,
                actionKey,
                'dataset',
                'Pin dataset to vars.dataset',
              )}
              disabled={actionPhase === 'loading' && actionKey === 'dataset'}
              onClick={() => {
                void actionFeedbackRef.current.run('dataset', () => {
                  getApi()?.pin('dataset');
                });
              }}
            >
              {actionLabel(actionPhase, actionKey, 'dataset', 'Pin')}
            </MapControlButton>
          ) : null}
        </div>
      </div>

      <div className="dataset-viewer__panes" role="tablist">
        <div className="dataset-viewer__panes-tabs">
          {visiblePanes.map((p) => (
            <MapControlButton
              key={p.id}
              variant="text"
              size="small"
              active={pane === p.id}
              role="tab"
              aria-selected={pane === p.id}
              onClick={() => {
                setPaneSafe(p.id);
              }}
            >
              {p.label}
            </MapControlButton>
          ))}
        </div>
        {pane === 'roots' ? (
          <MapControlButton
            className="dataset-viewer__panes-refresh"
            variant="text"
            size="small"
            title="Refresh root dataset list"
            onClick={() => {
              refreshLists(mapId);
              refreshSnapshot();
            }}
          >
            Refresh
          </MapControlButton>
        ) : null}
      </div>

      <div className="dataset-viewer__body">
        {pane === 'roots' ? (
          <div className="dataset-viewer__roots" aria-label="Root datasets">
            {rootOptions.length === 0 ? (
              <p className="dataset-viewer__empty">
                No root datasets on this map.
              </p>
            ) : (
              <ul className="dataset-viewer__root-list">
                {rootOptions.map((r) => (
                  <li
                    key={r.id}
                    className={[
                      'dataset-viewer__root-item',
                      r.id === activeRootId ? 'is-selected' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-selected={r.id === activeRootId}
                    role="button"
                    tabIndex={0}
                    title={`Inspect ${r.name}`}
                    onClick={() => debugRoot(r.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        debugRoot(r.id);
                      }
                    }}
                  >
                    <div className="dataset-viewer__root-meta" title={r.id}>
                      <strong>{r.name}</strong>
                      <span className="dataset-viewer__muted">{r.type}</span>
                    </div>
                    <div
                      className="dataset-viewer__root-actions"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <MapControlButton
                        variant="text"
                        size="small"
                        title={actionLabel(
                          actionPhase,
                          actionKey,
                          'dataset',
                          'Pin dataset to vars.dataset',
                        )}
                        disabled={
                          actionPhase === 'loading' && actionKey === 'dataset'
                        }
                        onClick={() => pinRoot(r.id)}
                      >
                        {actionLabel(actionPhase, actionKey, 'dataset', 'Pin')}
                      </MapControlButton>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        {pane === 'inspect' ? (
          <div className="dataset-viewer__inspect">
            <div className="dataset-viewer__inspect-layout">
              <div
                className="dataset-viewer__find"
                aria-label="Find part by type"
              >
                <InputActionRow
                  flush
                  className="dataset-viewer__find-type"
                  data-special={isSpecialFindType ? 'true' : undefined}
                  action={
                    <MapControlButton
                      variant="tonal"
                      title={actionLabel(
                        actionPhase,
                        actionKey,
                        'find',
                        'Find part by type',
                      )}
                      disabled={
                        (actionPhase === 'loading' && actionKey === 'find') ||
                        !findType
                      }
                      onClick={runFindPart}
                    >
                      {actionLabel(actionPhase, actionKey, 'find', 'Find')}
                    </MapControlButton>
                  }
                >
                  <div className="form-group">
                    <label>type</label>
                    <div className="input-container">
                      <select
                        className={[
                          'input-select',
                          isSpecialFindType
                            ? 'dataset-viewer__find-select--special'
                            : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        value={findType}
                        onChange={(e) => setFindType(e.target.value)}
                      >
                        {specialFindItems.length > 0 ? (
                          <optgroup label="Hierarchy · special">
                            {specialFindItems.map((item) => (
                              <option
                                key={item.value}
                                value={item.value}
                                className="dataset-viewer__find-option--special"
                              >
                                {item.text}
                              </option>
                            ))}
                          </optgroup>
                        ) : null}
                        {partTypeItems.length > 0 ? (
                          <optgroup label="Part type">
                            {partTypeItems.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.text}
                              </option>
                            ))}
                          </optgroup>
                        ) : null}
                      </select>
                    </div>
                  </div>
                </InputActionRow>
                {findMiss ? (
                  <p className="dataset-viewer__find-miss">Not found.</p>
                ) : null}
              </div>

              <aside
                className="dataset-viewer__aside"
                aria-label="Root dataset tree"
              >
                <DatasetTreeNav
                  nodes={currentRootNodes}
                  selectedId={datasetId}
                  highlightedIds={highlightIds}
                  forceExpandIds={treeExpandIds}
                  ariaLabel="Current root dataset tree"
                  onSelect={selectDataset}
                />
              </aside>

              <section
                className="dataset-viewer__detail"
                aria-label="Dataset details"
              >
              {snapshot ? (
                <>
                  <section className="dataset-viewer__section">
                    <h3 className="dataset-viewer__section-h">Identity</h3>
                    <DetailRow label="Name" copyValue={snapshot.identity.name}>
                      <span>{snapshot.identity.name}</span>
                    </DetailRow>
                    <DetailRow label="ID" copyValue={snapshot.identity.id}>
                      <code className="dataset-viewer__mono">
                        {snapshot.identity.id}
                      </code>
                    </DetailRow>
                    <DetailRow label="Type" copyValue={snapshot.identity.type}>
                      <span>{snapshot.identity.type}</span>
                    </DetailRow>
                    <DetailRow label="Kind">
                      <span
                        className="dataset-viewer__kind"
                        data-kind={snapshot.identity.kind}
                      >
                        {snapshot.identity.kind}
                      </span>
                    </DetailRow>
                  </section>

                  <section className="dataset-viewer__section">
                    <h3 className="dataset-viewer__section-h">Hierarchy</h3>
                    <DetailRow label="Root">
                      <MapControlButton
                        variant="text"
                        size="small"
                        title={snapshot.hierarchy.rootId}
                        onClick={() =>
                          selectDataset(snapshot.hierarchy.rootId)
                        }
                      >
                        {snapshot.hierarchy.rootName}
                      </MapControlButton>
                    </DetailRow>
                    <DetailRow label="Parent">
                      {snapshot.hierarchy.parentId ? (
                        <MapControlButton
                          variant="text"
                          size="small"
                          title={snapshot.hierarchy.parentId}
                          onClick={() =>
                            selectDataset(
                              snapshot.hierarchy.parentId as string,
                            )
                          }
                        >
                          {snapshot.hierarchy.parentName || '—'}
                        </MapControlButton>
                      ) : (
                        <span>(none — this is a root)</span>
                      )}
                    </DetailRow>
                    <DetailRow label="Children">
                      <span>{snapshot.hierarchy.childCount}</span>
                    </DetailRow>
                    {snapshot.hierarchy.children.length > 0 ? (
                      <ul className="dataset-viewer__child-list">
                        {snapshot.hierarchy.children.map((c) => (
                          <li key={c.id}>
                            <MapControlButton
                              variant="text"
                              size="small"
                              onClick={() => selectDataset(c.id)}
                            >
                              {c.name}
                              <span className="dataset-viewer__muted">
                                {c.type}
                              </span>
                            </MapControlButton>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <DetailRow label="Depth">
                      <span>{snapshot.hierarchy.depth}</span>
                    </DetailRow>
                    <DetailRow
                      label="Path"
                      copyValue={snapshot.hierarchy.pathLabel}
                    >
                      <code className="dataset-viewer__mono">
                        {snapshot.hierarchy.pathLabel}
                      </code>
                    </DetailRow>
                  </section>

                  <section className="dataset-viewer__section">
                    <h3 className="dataset-viewer__section-h">Runtime</h3>
                    <DetailRow label="isComposite">
                      <span>{String(snapshot.runtime.isComposite)}</span>
                    </DetailRow>
                    <DetailRow label="addToMap">
                      <span>{flag(snapshot.runtime.hasAddToMap)}</span>
                    </DetailRow>
                    <DetailRow label="removeFromMap">
                      <span>{flag(snapshot.runtime.hasRemoveFromMap)}</span>
                    </DetailRow>
                    <DetailRow label="getData">
                      <span>{flag(snapshot.runtime.hasGetData)}</span>
                    </DetailRow>
                    <DetailRow label="getMenus">
                      <span>{flag(snapshot.runtime.hasGetMenus)}</span>
                    </DetailRow>
                    {snapshot.runtime.show !== undefined ? (
                      <DetailRow label="show">
                        <span>{String(snapshot.runtime.show)}</span>
                      </DetailRow>
                    ) : null}
                    {snapshot.runtime.opacity !== undefined ? (
                      <DetailRow label="opacity">
                        <span>{String(snapshot.runtime.opacity)}</span>
                      </DetailRow>
                    ) : null}
                    {snapshot.runtime.selected !== undefined ? (
                      <DetailRow label="selected">
                        <span>{String(snapshot.runtime.selected)}</span>
                      </DetailRow>
                    ) : null}
                  </section>

                  {snapshot.dependsOn?.length ? (
                    <section className="dataset-viewer__section">
                      <h3 className="dataset-viewer__section-h">dependsOn</h3>
                      <code className="dataset-viewer__mono">
                        {snapshot.dependsOn.join(', ')}
                      </code>
                    </section>
                  ) : null}

                  {snapshot.dataPreview !== undefined ? (
                    <section className="dataset-viewer__section">
                      <h3 className="dataset-viewer__section-h">
                        Data preview
                      </h3>
                      <TreeItem data={snapshot.dataPreview} />
                    </section>
                  ) : null}

                  <section className="dataset-viewer__section">
                    <h3 className="dataset-viewer__section-h">
                      Methods (generic)
                    </h3>
                    <code className="dataset-viewer__mono dataset-viewer__methods">
                      {snapshot.identity.methodNames.join(', ') || '—'}
                    </code>
                  </section>
                </>
              ) : (
                <p className="dataset-viewer__empty">
                  Chọn dataset từ tree hoặc search.
                </p>
              )}
            </section>
            </div>
          </div>
        ) : null}

        {pane === 'menus' ? (
          <div className="dataset-viewer__menus" ref={menusPaneRef}>
            <div className="dataset-viewer__menus-toolbar">
              <div className="dataset-viewer__field dataset-viewer__menus-target">
                <InputSelect
                  label="target"
                  value={target}
                  items={TARGET_ITEMS}
                  onChange={(value) => {
                    const next = String(value) as 'layer' | 'item';
                    setTarget(next);
                    syncSession({ target: next });
                    scrollMenusToLatest();
                  }}
                />
              </div>
              <div className="dataset-viewer__field dataset-viewer__field--grow">
                <InputSelect
                  label="control"
                  value={control}
                  items={controlItems}
                  onChange={(value) => {
                    const next = String(value);
                    setControl(next);
                    syncSession({ control: next });
                    scrollMenusToLatest();
                  }}
                />
              </div>
            </div>

            <div className="dataset-viewer__menus-layout">
              <div className="dataset-viewer__buckets" aria-label="Menu buckets">
                {visibleBuckets.length === 0 ? (
                  <p className="dataset-viewer__empty">
                    No menus for this target / control.
                  </p>
                ) : (
                  visibleBuckets.map((bucket) => {
                    const items = menuBuckets[bucket] || [];
                    return (
                      <div key={bucket} className="dataset-viewer__bucket">
                        <div className="dataset-viewer__bucket-h">
                          <span>{bucket}</span>
                          <span className="dataset-viewer__count">
                            {items.length}
                          </span>
                        </div>
                        <ul>
                          {items.map((m) => (
                            <li
                              key={
                                m.id ||
                                m.key ||
                                `${bucket}-${m.type}-${m.name || ''}`
                              }
                              className={[
                                'dataset-viewer__menu-item',
                                m.hidden || m.disabled ? 'is-muted' : '',
                                (m.id || m.key || m.name || m.type) ===
                                selectedMenuId
                                  ? 'is-selected'
                                  : '',
                              ]
                                .filter(Boolean)
                                .join(' ')}
                              role="button"
                              tabIndex={0}
                              title={m.name || m.id || bucket}
                              onClick={() => selectMenu(m)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  selectMenu(m);
                                }
                              }}
                            >
                              <span className="dataset-viewer__menu-name">
                                {m.name || m.id || `(${m.type || 'unnamed'})`}
                              </span>
                              {m.id && (m.name || m.idGenerated) ? (
                                <span className="dataset-viewer__menu-id">
                                  {m.id}
                                </span>
                              ) : null}
                              <span className="dataset-viewer__flags">
                                <span
                                  className="dataset-viewer__chip"
                                  data-source={m.source}
                                >
                                  {m.source}
                                </span>
                                {m.idGenerated ? (
                                  <span
                                    className="dataset-viewer__chip"
                                    data-source="generated"
                                  >
                                    anon
                                  </span>
                                ) : null}
                                {m.hidden ? (
                                  <span className="dataset-viewer__chip">
                                    hidden
                                  </span>
                                ) : null}
                                {m.disabled ? (
                                  <span className="dataset-viewer__chip">
                                    disabled
                                  </span>
                                ) : null}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })
                )}
              </div>

              <aside
                ref={menuDetailRef}
                className="dataset-viewer__menu-detail"
                aria-label="Menu details"
              >
                {menuDetail ? (
                  <>
                    <div className="dataset-viewer__menu-detail-h">
                      <strong>
                        {menuDetail.name || menuDetail.id || 'Menu'}
                      </strong>
                      <MapCopyButton
                        title="Copy menu JSON"
                        value={JSON.stringify(menuDetail, null, 2)}
                      />
                    </div>
                    <DetailRow label="Name" copyValue={menuDetail.name || ''}>
                      {menuDetail.name || '—'}
                    </DetailRow>
                    <DetailRow label="ID" copyValue={menuDetail.id || ''}>
                      <code className="dataset-viewer__mono">
                        {menuDetail.id || '—'}
                      </code>
                      {menuDetail.idGenerated ? (
                        <span
                          className="dataset-viewer__chip"
                          data-source="generated"
                        >
                          anon
                        </span>
                      ) : null}
                    </DetailRow>
                    <DetailRow label="Type">{menuDetail.type}</DetailRow>
                    <DetailRow label="Source">
                      <span
                        className="dataset-viewer__chip"
                        data-source={menuDetail.source}
                      >
                        {menuDetail.source}
                      </span>
                      <span className="dataset-viewer__muted">
                        {menuDetail.sourceLabel}
                      </span>
                    </DetailRow>
                    <DetailRow label="Host">
                      {menuDetail.hostType || '—'}
                      {menuDetail.hostId ? (
                        <code className="dataset-viewer__mono">
                          {menuDetail.hostId}
                        </code>
                      ) : null}
                    </DetailRow>
                    <DetailRow label="Dataset">
                      {menuDetail.datasetName || '—'}
                      <span className="dataset-viewer__muted">
                        {menuDetail.datasetType}
                      </span>
                    </DetailRow>
                    <DetailRow label="Target">
                      {menuDetail.target || target}
                    </DetailRow>
                    <DetailRow label="Control">
                      <code className="dataset-viewer__mono">
                        {menuDetail.control || control}
                      </code>
                    </DetailRow>
                    <DetailRow label="Location">
                      {menuDetail.location || '—'}
                      <span className="dataset-viewer__muted">
                        → {menuDetail.effectiveLocation}
                      </span>
                    </DetailRow>
                    <DetailRow label="byControl">
                      {menuDetail.byControlKeys.length
                        ? menuDetail.byControlKeys.join(', ')
                        : '—'}
                    </DetailRow>
                    <DetailRow label="Flags">
                      {menuDetail.summary.hidden ? (
                        <span className="dataset-viewer__chip">hidden</span>
                      ) : null}
                      {menuDetail.summary.disabled ? (
                        <span className="dataset-viewer__chip">disabled</span>
                      ) : null}
                      {menuDetail.hasClick ? (
                        <span className="dataset-viewer__chip">click</span>
                      ) : null}
                      {menuDetail.componentKey ? (
                        <span className="dataset-viewer__chip">
                          {menuDetail.componentKey}
                        </span>
                      ) : null}
                      {menuDetail.icon ? (
                        <span className="dataset-viewer__muted">
                          {menuDetail.icon}
                        </span>
                      ) : null}
                      {!menuDetail.summary.hidden &&
                      !menuDetail.summary.disabled &&
                      !menuDetail.hasClick &&
                      !menuDetail.componentKey
                        ? '—'
                        : null}
                    </DetailRow>
                    {menuDetail.byControl ? (
                      <div className="dataset-viewer__menu-raw">
                        <h4 className="dataset-viewer__section-h">
                          byControl map
                        </h4>
                        <TreeItem data={menuDetail.byControl} />
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p className="dataset-viewer__empty">
                    Click a menu in a bucket to inspect name, id, registration
                    source, host, control placement, …
                  </p>
                )}
              </aside>
            </div>
          </div>
        ) : null}
      </div>

      <p className="dataset-viewer__foot">
        F12 · <code>__hungpvqDatasetDebug.help()</code>
      </p>
    </div>
  );
}
