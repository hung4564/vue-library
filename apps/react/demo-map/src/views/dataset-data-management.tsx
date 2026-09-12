import type { DataManagementPart } from '@hungpvq/demo-map-datasets';
import type { MapSimple } from '@hungpvq/map-core';
import {
  BaseMapCard,
  BaseMapControl,
  EventManagementControl,
  Map,
  WorkerControl,
} from '@hungpvq/react-map-core';
import {
  ComponentManagementControl,
  IdentifyControl,
  LayerControl,
} from '@hungpvq/react-map-dataset';
import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { MapPageShell } from '../components/MapPageShell';
import { loadDataManagementDemoDatasets } from '../data/loaders';
import { useDatasetRegistry } from '../hooks/useDatasetRegistry';
import { AsideControl } from '../layout/AsideControl';

type PagerState = {
  label: string;
  page: number;
  pageSize: number;
  total: number;
  names: string[];
  part?: DataManagementPart;
};

async function refreshPager(state: PagerState): Promise<PagerState> {
  if (!state.part) return state;
  const result = await state.part.list({
    page: state.page,
    pageSize: state.pageSize,
  });
  return {
    ...state,
    total: result.total,
    names: result.items.map((r) => String(r.name ?? r.id)),
  };
}

export function DatasetDataManagementPage() {
  useDatasetRegistry();
  const [pagers, setPagers] = useState<PagerState[]>([
    {
      label: 'HTTP standard `{ data, meta }`',
      page: 1,
      pageSize: 5,
      total: 0,
      names: [],
    },
    {
      label: 'HTTP custom `parseList` / `parseItem`',
      page: 1,
      pageSize: 5,
      total: 0,
      names: [],
    },
  ]);

  const onMapLoaded = useCallback(async (map: MapSimple) => {
    const result = await loadDataManagementDemoDatasets(map.id);
    const next: PagerState[] = [
      {
        label: 'HTTP standard `{ data, meta }`',
        page: 1,
        pageSize: 5,
        total: 0,
        names: [],
        part: result.standardHttp,
      },
      {
        label: 'HTTP custom `parseList` / `parseItem`',
        page: 1,
        pageSize: 5,
        total: 0,
        names: [],
        part: result.customHttp,
      },
    ];
    setPagers(await Promise.all(next.map((p) => refreshPager(p))));
  }, []);

  const panelStyle = useMemo(
    () =>
      ({
        position: 'absolute',
        right: 12,
        bottom: 12,
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: 'min(380px, calc(100vw - 24px))',
        maxHeight: 'calc(100% - 24px)',
        overflow: 'auto',
      }) as const,
    [],
  );

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
        <div style={panelStyle}>
          {pagers.map((state, index) => (
            <div key={state.label} className="dm-card dm-card--pager">
              <strong>{state.label}</strong>
              <div className="dm-card__names">
                {state.names.join(', ') || '(empty)'}
              </div>
              <div>
                page {state.page} / total {state.total}{' '}
                <button
                  type="button"
                  onClick={() => {
                    if (state.page <= 1) return;
                    void refreshPager({
                      ...state,
                      page: state.page - 1,
                    }).then((updated) => {
                      setPagers((prev) => {
                        const copy = [...prev];
                        copy[index] = updated;
                        return copy;
                      });
                    });
                  }}
                >
                  Prev
                </button>{' '}
                <button
                  type="button"
                  onClick={() => {
                    const max = Math.ceil(state.total / state.pageSize) || 1;
                    if (state.page >= max) return;
                    void refreshPager({
                      ...state,
                      page: state.page + 1,
                    }).then((updated) => {
                      setPagers((prev) => {
                        const copy = [...prev];
                        copy[index] = updated;
                        return copy;
                      });
                    });
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          ))}
        </div>
        <style>{`
          .dm-card {
            background: rgba(255, 255, 255, 0.94);
            border-radius: 8px;
            padding: 10px 12px;
            font-size: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          }
          .dm-card__meta {
            margin: 6px 0 0;
            opacity: 0.85;
            font-size: 11px;
            line-height: 1.4;
          }
          .dm-card--pager button {
            font: inherit;
            font-size: 11px;
            padding: 4px 8px;
            cursor: pointer;
          }
          .dm-card__names {
            margin: 4px 0;
            word-break: break-word;
          }
        `}</style>
      </Map>
    </MapPageShell>
  );
}
