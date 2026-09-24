import { Map } from '@hungpvq/react-map-core';
import { DevtoolsControl } from '@hungpvq/react-map-devtools';
import { loggerFactory } from '@hungpvq/shared-log';

import { DemoHelpPanel } from '../components/DemoHelpPanel';
import { DemoLanguageControl } from '../components/DemoLanguageControl';
import { MapPageShell } from '../components/MapPageShell';
import { useDatasetRegistry } from '../hooks/useDatasetRegistry';
import { AsideControl } from '../layout/AsideControl';

const logger = loggerFactory
  .createLogger()
  .setNamespace('demo:basemap-error', 2);

const initOptions = {
  attributionControl: false,
  style: 'https://invalid.example.invalid/styles/missing.json',
  center: [106.7, 10.78] as [number, number],
  zoom: 10,
};

export function BasemapErrorPage() {
  useDatasetRegistry();

  return (
    <MapPageShell>
      <Map
        mapId="basemap-error-demo"
        initOptions={initOptions}
        onError={(error) => {
          logger
            .with({ fn: 'onMapError', span: 'init' })
            .info('map error (also toasted via errorHandler)', {
              message: error.message,
            });
        }}
      >
        <DevtoolsControl position="bottom-right" />
        <DemoLanguageControl />
        <AsideControl position="top-left" />
        <DemoHelpPanel />
        <div className="basemap-error-note" role="status">
          This map loads an invalid style URL so MapLibre / init failures flow
          through <code>errorHandler</code> → <code>MapErrorToast</code> (bottom
          center).
        </div>
      </Map>
      <style>{`
        .basemap-error-note {
          position: fixed;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 5;
          max-width: min(480px, calc(100vw - 24px));
          padding: 8px 12px;
          background: var(--map-surface-color, #fff);
          border: 1px solid var(--map-border-color, #ddd);
          border-radius: 4px;
          font-size: 13px;
          line-height: 1.4;
        }
      `}</style>
    </MapPageShell>
  );
}
