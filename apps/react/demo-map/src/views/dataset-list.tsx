import type { MapSimple } from '@hungpvq/map-core';
import {
  BaseMapCard,
  BaseMapControl,
  Map,
  UniversalRegistry,
} from '@hungpvq/react-map-core';
import {
  ComponentManagementControl,
  LayerControl,
  LayerHighlight,
} from '@hungpvq/react-map-dataset';
import { useState } from 'react';
import { MapPageShell } from '../components/MapPageShell';
import { loadListDemoDatasets } from '../data/loaders';
import { useDatasetRegistry } from '../hooks/useDatasetRegistry';
import { AsideControl } from '../layout/AsideControl';
import {
  SampleCustomMenu,
  SAMPLE_LAYER_MENU_KEY,
} from './sample-custom-menu';

UniversalRegistry.registerComponent(SAMPLE_LAYER_MENU_KEY, SampleCustomMenu);

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
        <AsideControl position="top-left" />
        <BaseMapControl position="bottom-left" />
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
        <LayerHighlight />
        <ComponentManagementControl />
      </Map>
    </MapPageShell>
  );
}
