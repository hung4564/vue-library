import {
  COOKBOOK_CHECKLIST,
  type CookbookScenarioId,
  runCookbookScenario,
} from '@hungpvq/demo-map-datasets';
import type { MapSimple } from '@hungpvq/map-core';
import { BaseMapCard, BaseMapControl, Map } from '@hungpvq/react-map-core';
import {
  ComponentManagementControl,
  IdentifyControl,
  IdentifyShowFirstControl,
  LayerControl,
} from '@hungpvq/react-map-dataset';
import { DevtoolsControl } from '@hungpvq/react-map-devtools';
import { getUUIDv4 } from '@hungpvq/shared';
import { loggerFactory } from '@hungpvq/shared-log';
import { useCallback, useMemo, useState } from 'react';

import { DemoHelpPanel } from '../components/DemoHelpPanel';
import { DemoLanguageControl } from '../components/DemoLanguageControl';
import { MapPageShell } from '../components/MapPageShell';
import { loadIdentifyDemoDatasets } from '../data/loaders';
import { useDatasetRegistry } from '../hooks/useDatasetRegistry';
import { AsideControl } from '../layout/AsideControl';

loggerFactory.enableEverything();

export function LoggingCookbookPage() {
  useDatasetRegistry();
  const mapId = useMemo(() => getUUIDv4(), []);
  const [lastNote, setLastNote] = useState('');
  const [done, setDone] = useState<Record<string, boolean>>({});

  const onMapLoaded = useCallback((map: MapSimple) => {
    loadIdentifyDemoDatasets(map.id);
  }, []);

  const run = useCallback(
    async (id: CookbookScenarioId) => {
      setLastNote('running…');
      const result = await runCookbookScenario(id, mapId);
      setDone((prev) => ({ ...prev, [id]: result.ok }));
      setLastNote(result.note ?? (result.ok ? 'ok — open Flow' : 'failed'));
    },
    [mapId],
  );

  return (
    <MapPageShell>
      <div className="logging-cookbook">
        <aside className="logging-cookbook__panel">
          <h2>Logging cookbook</h2>
          <p className="logging-cookbook__hint">
            Open Devtools → Logs → Flow after each run. Menu / Identify /
            LayerDetail cover scenarios 5–7 on the map.
          </p>
          <ul className="logging-cookbook__list">
            {COOKBOOK_CHECKLIST.map((item) => (
              <li key={item.id}>
                <button type="button" onClick={() => void run(item.id)}>
                  {done[item.id] ? '✓ ' : ''}
                  {item.label}
                </button>
                <span className="logging-cookbook__expect">{item.expect}</span>
              </li>
            ))}
          </ul>
          {lastNote ? (
            <p className="logging-cookbook__note">{lastNote}</p>
          ) : null}
        </aside>
        <div className="logging-cookbook__map">
          <Map mapId={mapId} onMapLoaded={onMapLoaded}>
            <DevtoolsControl position="bottom-right" />
            <DemoLanguageControl />
            <AsideControl position="top-left" />
            <ComponentManagementControl />
            <LayerControl
              position="top-left"
              show
              endList={({ mapId: mid }) => <BaseMapCard mapId={mid} />}
            />
            <IdentifyControl position="top-right" />
            <IdentifyShowFirstControl />
            <BaseMapControl position="bottom-left" />
            <DemoHelpPanel />
          </Map>
        </div>
      </div>
      <style>{`
.logging-cookbook {
  display: grid;
  grid-template-columns: minmax(260px, 340px) 1fr;
  height: 100%;
  min-height: 0;
}
.logging-cookbook__panel {
  padding: 12px 14px;
  overflow: auto;
  border-right: 1px solid #ddd;
  background: #fafafa;
  font-size: 13px;
}
.logging-cookbook__panel h2 {
  margin: 0 0 8px;
  font-size: 16px;
}
.logging-cookbook__hint {
  margin: 0 0 12px;
  color: #555;
  line-height: 1.4;
}
.logging-cookbook__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.logging-cookbook__list button {
  display: block;
  width: 100%;
  text-align: left;
  padding: 6px 8px;
  cursor: pointer;
}
.logging-cookbook__expect {
  display: block;
  margin-top: 2px;
  color: #666;
  font-size: 11px;
}
.logging-cookbook__note {
  margin-top: 12px;
  padding: 8px;
  background: #fff;
  border: 1px solid #e0e0e0;
}
.logging-cookbook__map {
  min-height: 0;
  height: 100%;
  position: relative;
}
`}</style>
    </MapPageShell>
  );
}
