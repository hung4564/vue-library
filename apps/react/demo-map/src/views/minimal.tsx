import type { MapSimple } from '@hungpvq/map-core';
import { BaseMapControl, Map } from '@hungpvq/react-map-core';

import { DemoLanguageControl } from '../components/DemoLanguageControl';
import {
  LayerControl,
  useMapDataset,
} from '@hungpvq/react-map-dataset';
import { createGeoJsonDataset } from '@hungpvq/map-dataset/geojson';
import type { FeatureCollection } from 'geojson';
import { MapPageShell } from '../components/MapPageShell';
import { useDatasetRegistry } from '../hooks/useDatasetRegistry';
import { AsideControl } from '../layout/AsideControl';
import { DemoHelpPanel } from '../components/DemoHelpPanel';
import { DevtoolsControl } from '@hungpvq/react-map-devtools';

const SAMPLE: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'District 1' },
      geometry: { type: 'Point', coordinates: [106.7009, 10.7769] },
    },
    {
      type: 'Feature',
      properties: { name: 'Ben Thanh' },
      geometry: { type: 'Point', coordinates: [106.6983, 10.7725] },
    },
  ],
};

export function MinimalPage() {
  useDatasetRegistry();
  const { addDataset, setMapId } = useMapDataset();

  function onMapLoaded(map: MapSimple) {
    setMapId(map.id);
    void addDataset(
      createGeoJsonDataset({
        name: 'Sample points',
        geojson: SAMPLE,
        type: 'point',
        color: '#e74c3c',
      }),
    );
  }

  return (
    <MapPageShell>
      <Map onMapLoaded={onMapLoaded}>
        <DevtoolsControl position="bottom-right" />
        <DemoLanguageControl />
        <AsideControl position="top-left" />
        <BaseMapControl position="bottom-left" />
        <LayerControl position="top-left" show />
        <DemoHelpPanel />
      </Map>
    </MapPageShell>
  );
}
