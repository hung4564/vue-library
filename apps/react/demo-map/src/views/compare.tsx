import {
  BaseMapCard,
  CompareBaseMapControl,
  CompareSettingControl,
  CrsControl,
  FullScreenControl,
  GeoLocateControl,
  GotoControl,
  HomeControl,
  MapCompare,
  MeasurementControl,
  MouseCoordinatesControl,
  SettingControl,
  ZoomControl,
} from '@hungpvq/react-map-core';
import {
  ComponentManagementControl,
  IdentifyControl,
  LayerControl,
  LayerHighlight,
} from '@hungpvq/react-map-dataset';
import { useCallback } from 'react';
import { LoadDatasetsOnMap } from '../components/LoadDatasetsOnMap';
import { MapPageShell } from '../components/MapPageShell';
import { loadCompareDatasets } from '../data/compare-datasets';
import { useDatasetRegistry } from '../hooks/useDatasetRegistry';
import { AsideControl } from '../layout/AsideControl';

export function ComparePage() {
  useDatasetRegistry();
  const load = useCallback((mapId: string) => loadCompareDatasets(mapId), []);

  return (
    <MapPageShell>
      <MapCompare>
        <LoadDatasetsOnMap load={load} />
        <AsideControl position="top-left" />
        <ComponentManagementControl />
        <CompareSettingControl />
        <MeasurementControl position="top-right" />
        <LayerControl
          position="top-left"
          show
          endList={({ mapId }) => <BaseMapCard mapId={mapId} />}
        />
        <IdentifyControl position="top-right" immediately />
        <GotoControl position="top-right" />
        <CrsControl />
        <SettingControl />
        <GeoLocateControl />
        <FullScreenControl />
        <ZoomControl />
        <HomeControl />
        <MouseCoordinatesControl />
        <CompareBaseMapControl position="bottom-left" />
        <LayerHighlight enableClick />
      </MapCompare>
    </MapPageShell>
  );
}
