import {
  attributeTableDemoLogger,
  DATA_MANAGEMENT_HTTP_CUSTOM_LIST_NAME,
  DATA_MANAGEMENT_HTTP_LIST_NAME,
  DATA_MANAGEMENT_LOCAL_GEOJSON_LIST_NAME,
  DATA_MANAGEMENT_LOCAL_LIST_NAME,
  DATA_MANAGEMENT_MEMORY_LIST_NAME,
} from '@hungpvq/demo-map-datasets';
import { runMapControlAction, type MapSimple } from '@hungpvq/map-core';
import { type IDataset } from '@hungpvq/map-dataset';
import {
  ATTRIBUTE_TABLE_COMPONENT_KEY,
  ATTRIBUTE_TABLE_CONTROL,
  createAttributeTableStoreFromDataset,
  queueAttributeTableSelectRows,
} from '@hungpvq/map-dataset/attribute-table';
import {
  BaseMapCard,
  BaseMapControl,
  EventManagementControl,
  Map,
  MapControlButton,
  UniversalRegistry,
  WorkerControl,
} from '@hungpvq/react-map-core';
import {
  AttributeTableGrid,
  AttributeTablePager,
  AttributeTableToolbar,
  AttributeTableView,
  ComponentManagementControl,
  IdentifyControl,
  LayerControl,
  useMapDatasetComponent,
} from '@hungpvq/react-map-dataset';
import { useCallback, useEffect, useState } from 'react';
import { MapPageShell } from '../../components/MapPageShell';
import { loadDataManagementDemoDatasets } from '../../data/loaders';
import { useDatasetRegistry } from '../../hooks/useDatasetRegistry';
import { AsideControl } from '../../layout/AsideControl';
import { SampleAttributeTableCell } from './sample-attribute-table-cell';
import { SampleAttributeTableGrid } from './sample-attribute-table-grid';
import { SampleAttributeTableHeader } from './sample-attribute-table-header';
import { SampleAttributeTablePager } from './sample-attribute-table-pager';
import { SampleAttributeTableToolbar } from './sample-attribute-table-toolbar';
import { SampleAttributeTableView } from './sample-attribute-table-view';

type LayerKey = 'http' | 'httpCustom' | 'localGeojson' | 'localList' | 'memory';
type OverrideKey = 'default' | 'toolbar' | 'grid' | 'pager' | 'all' | 'view';

const KEY = ATTRIBUTE_TABLE_COMPONENT_KEY;
const SAMPLE_CELL_KEY = 'attribute-table-demo-name-cell';
const SAMPLE_HEADER_KEY = 'attribute-table-demo-name-header';

const LAYER_OPTIONS: { key: LayerKey; label: string }[] = [
  { key: 'http', label: DATA_MANAGEMENT_HTTP_LIST_NAME },
  { key: 'httpCustom', label: DATA_MANAGEMENT_HTTP_CUSTOM_LIST_NAME },
  { key: 'localGeojson', label: DATA_MANAGEMENT_LOCAL_GEOJSON_LIST_NAME },
  { key: 'localList', label: DATA_MANAGEMENT_LOCAL_LIST_NAME },
  { key: 'memory', label: DATA_MANAGEMENT_MEMORY_LIST_NAME },
];

const OVERRIDE_OPTIONS: { key: OverrideKey; label: string }[] = [
  { key: 'default', label: 'default (plugin)' },
  { key: 'toolbar', label: KEY.toolbar },
  { key: 'grid', label: KEY.grid },
  { key: 'pager', label: KEY.pager },
  { key: 'all', label: `${KEY.toolbar} + ${KEY.grid} + ${KEY.pager}` },
  { key: 'view', label: KEY.view },
];

const DEMO_COLUMNS = [
  {
    key: 'name',
    label: 'Name',
    format: (value: unknown) =>
      typeof value === 'string' ? value.toUpperCase() : String(value ?? ''),
  },
  { key: 'id', label: 'ID', sortable: false as const },
  { key: '__geometry', label: 'Geometry', sortable: false as const },
];

function registerOverrides(mapId: string, mode: OverrideKey) {
  UniversalRegistry.registerComponentForMap(
    mapId,
    KEY.view,
    AttributeTableView,
  );
  UniversalRegistry.registerComponentForMap(
    mapId,
    KEY.toolbar,
    AttributeTableToolbar,
  );
  UniversalRegistry.registerComponentForMap(
    mapId,
    KEY.grid,
    AttributeTableGrid,
  );
  UniversalRegistry.registerComponentForMap(
    mapId,
    KEY.pager,
    AttributeTablePager,
  );

  if (mode === 'default') return;

  if (mode === 'view') {
    UniversalRegistry.registerComponentForMap(
      mapId,
      KEY.view,
      SampleAttributeTableView,
    );
    return;
  }

  if (mode === 'toolbar' || mode === 'all') {
    UniversalRegistry.registerComponentForMap(
      mapId,
      KEY.toolbar,
      SampleAttributeTableToolbar,
    );
  }
  if (mode === 'grid' || mode === 'all') {
    UniversalRegistry.registerComponentForMap(
      mapId,
      KEY.grid,
      SampleAttributeTableGrid,
    );
  }
  if (mode === 'pager' || mode === 'all') {
    UniversalRegistry.registerComponentForMap(
      mapId,
      KEY.pager,
      SampleAttributeTablePager,
    );
  }
}

function AttributeTablePlayground({
  mapId,
  lists,
  overrideKey,
  onOverrideKeyChange,
}: {
  mapId: string;
  lists: Partial<Record<LayerKey, IDataset>>;
  overrideKey: OverrideKey;
  onOverrideKeyChange: (mode: OverrideKey) => void;
}) {
  const { addComponent } = useMapDatasetComponent(mapId);
  const [selectedKey, setSelectedKey] = useState<LayerKey>('http');
  const [lastPageHint, setLastPageHint] = useState('');
  const selectedLayer = lists[selectedKey];

  function openAttributeTable(withColumns = false, withUi = false) {
    if (!selectedLayer) return;
    addComponent({
      componentKey: KEY.root,
      attr: {
        layer: selectedLayer,
        mapId,
        ...(withColumns ? { columns: [...DEMO_COLUMNS] } : {}),
        ...(withUi
          ? {
              ui: {
                search: true,
                export: false,
                pager: true,
                checkbox: true,
                sort: false,
              },
            }
          : {}),
      },
      check: `${KEY.root}:${selectedLayer.id}`,
    });
  }

  function openAttributeTableWithCells() {
    if (!selectedLayer) return;
    UniversalRegistry.registerComponentForMap(
      mapId,
      SAMPLE_CELL_KEY,
      SampleAttributeTableCell,
    );
    UniversalRegistry.registerComponentForMap(
      mapId,
      SAMPLE_HEADER_KEY,
      SampleAttributeTableHeader,
    );
    addComponent({
      componentKey: KEY.root,
      attr: {
        layer: selectedLayer,
        mapId,
        columns: [
          {
            key: 'name',
            label: 'Name',
            cellComponent: SAMPLE_CELL_KEY,
            headerComponent: SAMPLE_HEADER_KEY,
          },
          {
            key: 'id',
            label: 'ID',
            cellComponent: SampleAttributeTableCell,
            headerComponent: SampleAttributeTableHeader,
            sortable: false,
          },
          { key: '__geometry', label: 'Geometry', sortable: false },
        ],
      },
      check: `${KEY.root}:${selectedLayer.id}`,
    });
  }

  function queueSelectRows() {
    if (!selectedLayer) return;
    openAttributeTable();
    const ids = selectedKey === 'httpCustom' ? ['L1', 'L2'] : ['1', '2'];
    queueAttributeTableSelectRows(mapId, ids);
  }

  function selectRowsAction() {
    const ids = selectedKey === 'httpCustom' ? ['L3'] : ['3'];
    runMapControlAction(
      mapId,
      ATTRIBUTE_TABLE_CONTROL.id,
      ATTRIBUTE_TABLE_CONTROL.actionSelectRows,
      { ids },
    );
  }

  function toggleShow() {
    runMapControlAction(mapId, ATTRIBUTE_TABLE_CONTROL.id);
  }

  async function loadPage() {
    if (!selectedLayer) return;
    const store = createAttributeTableStoreFromDataset(selectedLayer, {
      columns: [...DEMO_COLUMNS],
    });
    const page = await store.list({
      intent: 'page',
      page: 1,
      pageSize: 5,
    });
    setLastPageHint(`${page.rows.length}/${page.total} · intent:page`);
    attributeTableDemoLogger.info('store.list page', page);
  }

  return (
    <div className="at-card">
      <strong>Attribute table</strong>

      <label className="at-card__label">
        Layer
        <select
          value={selectedKey}
          onChange={(e) => setSelectedKey(e.target.value as LayerKey)}
        >
          {LAYER_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label className="at-card__label">
        registerComponentForMap key
        <select
          value={overrideKey}
          onChange={(e) => onOverrideKeyChange(e.target.value as OverrideKey)}
        >
          {OVERRIDE_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <div className="at-card__section">addComponent ({KEY.root})</div>
      <div className="at-card__actions">
        <MapControlButton
          variant="outlined"
          size="small"
          onClick={() => openAttributeTable()}
        >
          Open
        </MapControlButton>
        <MapControlButton
          variant="outlined"
          size="small"
          onClick={() => openAttributeTable(true)}
        >
          Open + columns
        </MapControlButton>
        <MapControlButton
          variant="outlined"
          size="small"
          onClick={() => openAttributeTable(false, true)}
        >
          Open + ui (sort off)
        </MapControlButton>
        <MapControlButton
          variant="outlined"
          size="small"
          onClick={() => openAttributeTableWithCells()}
        >
          Open + cell/header
        </MapControlButton>
        <MapControlButton
          variant="outlined"
          size="small"
          onClick={() => void loadPage()}
        >
          store.list (page)
        </MapControlButton>
      </div>
      <div className="at-card__meta">
        Open + cell/header: Name header calls <code>onSort</code> (Shift =
        multi-sort); ID header is not sortable. Layer{' '}
        <code>GeoJSON features</code> uses{' '}
        <code>createDatasetPartAttributeTable</code> (wins over menu columns).
      </div>
      {lastPageHint ? (
        <div className="at-card__meta">{lastPageHint}</div>
      ) : null}

      <div className="at-card__section">{ATTRIBUTE_TABLE_CONTROL.id}</div>
      <div className="at-card__actions">
        <MapControlButton
          variant="outlined"
          size="small"
          onClick={queueSelectRows}
        >
          queueAttributeTableSelectRows
        </MapControlButton>
        <MapControlButton
          variant="outlined"
          size="small"
          onClick={selectRowsAction}
        >
          {ATTRIBUTE_TABLE_CONTROL.actionSelectRows}
        </MapControlButton>
        <MapControlButton variant="outlined" size="small" onClick={toggleShow}>
          toggle show
        </MapControlButton>
      </div>
    </div>
  );
}

export function DatasetAttributeTablePage() {
  useDatasetRegistry();
  const [mapId, setMapId] = useState<string | null>(null);
  const [overrideKey, setOverrideKey] = useState<OverrideKey>('all');
  const [lists, setLists] = useState<Partial<Record<LayerKey, IDataset>>>({});

  useEffect(() => {
    if (!mapId) return;
    registerOverrides(mapId, overrideKey);
  }, [mapId, overrideKey]);

  const onMapLoaded = useCallback(async (map: MapSimple) => {
    setMapId(map.id);
    const result = await loadDataManagementDemoDatasets(map.id);
    setLists({
      http: result.lists.http,
      httpCustom: result.lists.httpCustom,
      localGeojson: result.lists.localGeojson,
      localList: result.lists.localList,
      memory: result.lists.memory,
    });
  }, []);

  return (
    <MapPageShell>
      <Map onMapLoaded={onMapLoaded}>
        <AsideControl position="top-left" />
        <BaseMapControl
          position="bottom-left"
          defaultBaseMap="Google Satellite"
        />
        <LayerControl
          position="top-left"
          show
          endList={({ mapId: mid }) => <BaseMapCard mapId={mid} />}
        />
        <ComponentManagementControl />
        <EventManagementControl position="top-left" />
        <IdentifyControl position="top-right" />
        <WorkerControl position="top-left" />
        <div className="at-panel">
          {mapId ? (
            <AttributeTablePlayground
              mapId={mapId}
              lists={lists}
              overrideKey={overrideKey}
              onOverrideKeyChange={setOverrideKey}
            />
          ) : null}
        </div>
        <style>{`
          .at-panel {
            position: absolute;
            right: 12px;
            bottom: 12px;
            z-index: 2;
            width: min(380px, calc(100vw - 24px));
            max-height: calc(100% - 24px);
            overflow: auto;
          }
          .at-card {
            background: rgba(255, 255, 255, 0.94);
            border-radius: 8px;
            padding: 10px 12px;
            font-size: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          }
          .at-card__label {
            display: flex;
            flex-direction: column;
            gap: 4px;
            margin-top: 8px;
            font-weight: 600;
          }
          .at-card__label select {
            font: inherit;
            font-weight: 400;
            padding: 4px 6px;
          }
          .at-card__meta {
            margin-top: 4px;
            font-size: 11px;
            opacity: 0.8;
          }
          .at-card__section {
            margin: 12px 0 6px;
            font-weight: 600;
            font-size: 11px;
            font-family: ui-monospace, monospace;
            opacity: 0.8;
          }
          .at-card__actions {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }
        `}</style>
      </Map>
    </MapPageShell>
  );
}
