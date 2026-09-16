import { GEO_EXPORT_DEMO_LEGEND } from '@hungpvq/demo-map-datasets';
import type { MapSimple } from '@hungpvq/map-core';
import {
  BaseMapCard,
  BaseMapControl,
  Map,
  WorkerControl,
} from '@hungpvq/react-map-core';

import { DemoLanguageControl } from '../../components/DemoLanguageControl';
import {
  ComponentManagementControl,
  ExportGeoForm,
  HighlightPointer,
  type ExportGeoFormProps,
  LayerControl,
} from '@hungpvq/react-map-dataset';
import { useState } from 'react';
import { MapPageShell } from '../../components/MapPageShell';
import { loadGeoExportDemoDatasets } from '../../data/loaders';
import { useDatasetRegistry } from '../../hooks/useDatasetRegistry';
import { AsideControl } from '../../layout/AsideControl';
import { DemoHelpPanel } from '../../components/DemoHelpPanel';

/** Passed as dataset `formComponent` (like AT cellComponent). */
function DemoExportForm(props: ExportGeoFormProps) {
  return (
    <div className="geo-export-demo-form-override">
      <div className="geo-export-demo-form-override__banner">
        formComponent Â· React component on dataset part
      </div>
      <ExportGeoForm {...props} />
      <style>{`
        .geo-export-demo-form-override {
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 0;
          border: 2px dashed #e67e22;
          border-radius: 6px;
          overflow: hidden;
        }
        .geo-export-demo-form-override__banner {
          flex: 0 0 auto;
          padding: 6px 10px;
          font-size: 11px;
          font-weight: 600;
          color: #9a3412;
          background: #fff7ed;
          border-bottom: 1px dashed #e67e22;
        }
        .geo-export-demo-form-override .export-geo {
          flex: 1 1 auto;
          min-height: 0;
        }
      `}</style>
    </div>
  );
}

/** Passed as dataset `loadingComponent`. */
function DemoExportLoading() {
  return (
    <p
      className="geo-export-demo-loading-override"
      role="status"
      aria-live="polite"
    >
      loadingComponent Â· React component on dataset part
      <style>{`
        .geo-export-demo-loading-override {
          margin: 0;
          padding: 8px 10px;
          font-size: 12px;
          font-weight: 600;
          color: #b91c1c;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 4px;
        }
      `}</style>
    </p>
  );
}

export function DatasetGeoExportPage() {
  const [mapId] = useState(() => crypto.randomUUID());
  useDatasetRegistry();

  function onMapLoaded(map: MapSimple) {
    void loadGeoExportDemoDatasets(map.id, {
      formComponent: DemoExportForm,
      loadingComponent: DemoExportLoading,
    });
  }

  return (
    <MapPageShell>
      <Map mapId={mapId} onMapLoaded={onMapLoaded}>
        <DemoLanguageControl />
        <AsideControl position="top-left" />
        <BaseMapControl position="bottom-left" />
        <WorkerControl position="top-left" />
        <LayerControl
          position="top-left"
          show
          titleList={
            <pre
              style={{
                margin: 0,
                padding: '4px 0',
                fontSize: 11,
                lineHeight: 1.45,
                whiteSpace: 'pre-wrap',
                opacity: 0.85,
                maxWidth: 280,
                fontFamily: 'inherit',
              }}
            >
              {GEO_EXPORT_DEMO_LEGEND}
            </pre>
          }
          endList={({ mapId: mid }) => <BaseMapCard mapId={mid} />}
        />
        <HighlightPointer enableClick />
        <ComponentManagementControl />
        <DemoHelpPanel />
      </Map>
    </MapPageShell>
  );
}
