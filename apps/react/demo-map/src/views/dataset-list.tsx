import type { MapSimple } from '@hungpvq/map-core';
import {
  BaseMapCard,
  BaseMapControl,
  Map,
  UniversalRegistry,
  WorkerControl,
} from '@hungpvq/react-map-core';

import { DemoLanguageControl } from '../components/DemoLanguageControl';
import {
  ComponentManagementControl,
  HighlightPointer,
  LayerControl,
} from '@hungpvq/react-map-dataset';
import { useState } from 'react';
import { MapPageShell } from '../components/MapPageShell';
import { loadListDemoDatasets } from '../data/loaders';
import { useDatasetRegistry } from '../hooks/useDatasetRegistry';
import { AsideControl } from '../layout/AsideControl';
import { DemoHelpPanel } from '../components/DemoHelpPanel';
import { DEMO_SAMPLE_LAYER_MENU_KEY } from '@hungpvq/demo-map-datasets';
import { SampleCustomMenu } from './sample-custom-menu';

UniversalRegistry.registerComponent(DEMO_SAMPLE_LAYER_MENU_KEY, SampleCustomMenu);

export function DatasetListPage() {
  useDatasetRegistry();
  const [menuUi, setMenuUi] = useState({
    role: 'admin' as 'admin' | 'viewer',
    canUsePen: true,
  });

  function onMapLoaded(map: MapSimple) {
    loadListDemoDatasets(map.id);
  }

  return (
    <MapPageShell>
      <Map onMapLoaded={onMapLoaded}>
        <DemoLanguageControl />
        <AsideControl position="top-left" />
        <BaseMapControl position="bottom-left" />
        <WorkerControl position="top-left" />
        <LayerControl
          position="top-left"
          show
          menuContext={menuUi}
          titleList={
            <>
              <label className="menu-condition-toggle">
                <input
                  type="checkbox"
                  checked={menuUi.role === 'admin'}
                  onChange={(event) =>
                    setMenuUi((prev) => ({
                      ...prev,
                      role: event.target.checked ? 'admin' : 'viewer',
                    }))
                  }
                />
                admin
              </label>
              <label className="menu-condition-toggle">
                <input
                  type="checkbox"
                  checked={menuUi.canUsePen}
                  onChange={(event) =>
                    setMenuUi((prev) => ({
                      ...prev,
                      canUsePen: event.target.checked,
                    }))
                  }
                />
                pen
              </label>
            </>
          }
          endList={({ mapId }) => <BaseMapCard mapId={mapId} />}
        />
        <HighlightPointer enableClick />
        <ComponentManagementControl />
        <DemoHelpPanel />
      </Map>
    </MapPageShell>
  );
}
