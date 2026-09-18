import type { MapSimple } from '@hungpvq/map-core';
import type { MeasureActionItem } from '@hungpvq/map-core/measurement';
import {
  BaseMapCard,
  BaseMapControl,
  CrsControl,
  EventManagementControl,
  FullScreenControl,
  GeoLocateControl,
  GlobeControl,
  GotoControl,
  HomeControl,
  InfoControl,
  LegendControl,
  Map,
  MapContextMenuControl,
  MeasurementControl,
  MouseCoordinatesControl,
  PrintAdvancedControl,
  PrintControl,
  RegistryControl,
  SettingControl,
  ThemeControl,
  ToolbarControl,
  WorkerControl,
  ZoomControl,
} from '@hungpvq/react-map-core';
import {
  ComponentManagementControl,
  DatasetControl,
  IdentifyControl,
  LayerControl,
  useMapDataset,
} from '@hungpvq/react-map-dataset';
import { DrawControl, InspectControl } from '@hungpvq/react-map-draw';
import { mdiPlus } from '@mdi/js';
import { useMemo } from 'react';
import { DemoLanguageControl } from '../components/DemoLanguageControl';
import { MapPageShell } from '../components/MapPageShell';
import { useDatasetRegistry } from '../hooks/useDatasetRegistry';
import { AsideControl } from '../layout/AsideControl';
import { createDatasetMeasure } from './all-map-view-measure';

export function AllMapView() {
  useDatasetRegistry();
  const { addDataset, setMapId } = useMapDataset();

  function onMapLoaded(map: MapSimple) {
    setMapId(map.id);
  }

  const actionMeasures: MeasureActionItem[] = useMemo(
    () => [
      {
        title: 'add to layer',
        icon: mdiPlus,
        type: 'add-to-layer',
        show: (ctx) => !!ctx.measurementType,
        handle: (ctx) => {
          const coordinates = ctx.coordinates;
          if (!coordinates || coordinates.length < 1) {
            return;
          }
          const dataset = createDatasetMeasure(
            ctx.handler,
            ctx.measurementType || '',
          );
          void addDataset(dataset);
          ctx.clear();
        },
        disabled: (ctx) => !ctx.coordinates || ctx.coordinates.length < 1,
        index: 0,
      },
    ],
    [addDataset],
  );

  return (
    <MapPageShell>
      <Map buttonInMobile="toolbar" onMapLoaded={onMapLoaded}>
        <AsideControl position="top-left" />
        <ToolbarControl position="top-left" />
        <ComponentManagementControl />
        <MeasurementControl position="top-right" actions={actionMeasures} />
        <IdentifyControl position="top-right" />
        <DrawControl position="top-right" />
        <LayerControl
          position="top-left"
          show
          endList={({ mapId }) => <BaseMapCard mapId={mapId} />}
        />
        <InspectControl position="top-right" />
        <PrintAdvancedControl />
        <PrintControl />
        <GotoControl position="top-right" />
        <InfoControl position="top-right" />
        <RegistryControl position="top-right" />
        <WorkerControl position="top-left" />
        <GlobeControl />
        <LegendControl />
        <CrsControl />
        <SettingControl />
        <ThemeControl />
        <DemoLanguageControl />
        <GeoLocateControl />
        <FullScreenControl />
        <ZoomControl />
        <HomeControl />
        <MouseCoordinatesControl />
        <MapContextMenuControl />
        <BaseMapControl position="bottom-left" />
        <DatasetControl position="top-left" />
        <EventManagementControl position="top-left" />
      </Map>
    </MapPageShell>
  );
}
