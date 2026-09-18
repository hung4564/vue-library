import type { MapSimple } from '@hungpvq/map-core';
import { createGeoJsonDataset } from '@hungpvq/map-dataset/geojson';
import { loggerFactory } from '@hungpvq/shared-log';
import { BaseMapControl, Map } from '@hungpvq/react-map-core';
import { LayerControl, useMapDataset } from '@hungpvq/react-map-dataset';
import type { FeatureCollection } from 'geojson';
import { MapPageShell } from '../components/MapPageShell';
import { DemoHelpPanel } from '../components/DemoHelpPanel';
import { DemoLanguageControl } from '../components/DemoLanguageControl';
import { AsideControl } from '../layout/AsideControl';
import { useDatasetRegistry } from '../hooks/useDatasetRegistry';

const logger = loggerFactory.createLogger().setNamespace('demo:multi-map', 2);

const SAMPLE_A: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Map A' },
      geometry: { type: 'Point', coordinates: [106.7009, 10.7769] },
    },
  ],
};

const SAMPLE_B: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Map B' },
      geometry: { type: 'Point', coordinates: [105.8542, 21.0285] },
    },
  ],
};

export function MultiMapPage() {
  useDatasetRegistry();
  const datasetA = useMapDataset('demo-map-a');
  const datasetB = useMapDataset('demo-map-b');

  function onLoadedA(map: MapSimple) {
    logger.info('map A ready', { mapId: map.id });
    datasetA.setMapId(map.id);
    void datasetA.addDataset(
      createGeoJsonDataset({
        name: 'Sample A',
        geojson: SAMPLE_A,
        type: 'point',
        color: '#e74c3c',
      }),
    );
  }

  function onLoadedB(map: MapSimple) {
    logger.info('map B ready', { mapId: map.id });
    datasetB.setMapId(map.id);
    void datasetB.addDataset(
      createGeoJsonDataset({
        name: 'Sample B',
        geojson: SAMPLE_B,
        type: 'point',
        color: '#2980b9',
      }),
    );
  }

  return (
    <MapPageShell>
      <div className="multi-map-page">
        <div className="multi-map-page__maps">
          <div className="multi-map-page__pane">
            <h2 className="multi-map-page__label">
              Map A (<code>demo-map-a</code>)
            </h2>
            <Map mapId="demo-map-a" onMapLoaded={onLoadedA}>
              <DemoLanguageControl />
              <AsideControl position="top-left" />
              <BaseMapControl position="bottom-left" />
              <LayerControl position="top-left" show />
              <DemoHelpPanel />
            </Map>
          </div>
          <div className="multi-map-page__pane">
            <h2 className="multi-map-page__label">
              Map B (<code>demo-map-b</code>)
            </h2>
            <Map mapId="demo-map-b" onMapLoaded={onLoadedB}>
              <BaseMapControl position="bottom-left" />
              <LayerControl position="top-left" show />
            </Map>
          </div>
        </div>
      </div>
      <style>{`
        .multi-map-page {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .multi-map-page__maps {
          flex: 1;
          min-height: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
        }
        .multi-map-page__pane {
          position: relative;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }
        .multi-map-page__label {
          flex: 0 0 auto;
          padding: 4px 8px;
          font-size: 12px;
          font-weight: 600;
          background: var(--map-surface-color, #fff);
          border-bottom: 1px solid var(--map-border-color, #eee);
        }
        .multi-map-page__pane .map-container,
        .multi-map-page__pane .maplibregl-map {
          flex: 1;
          min-height: 0;
          height: 100%;
        }
        @media (max-width: 800px) {
          .multi-map-page__maps {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 1fr;
          }
        }
      `}</style>
    </MapPageShell>
  );
}
