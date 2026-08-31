import { useEffect, useState } from 'react';
import type { MapControlButtonState, WithMapPropType } from '@hungpvq/map-core';
import { createToolbarStoreApi } from '@hungpvq/map-core';
import { defaultMapProps, useMap } from '../../../hooks';
import { MapCommonButton } from '../../../components/MapCommonButton';
import { MapControlGroupButton } from '../../../components/MapControlGroupButton';
import { ModuleContainer } from '../../../modules/ModuleContainer/ModuleContainer';
import { useMapToolbarStore } from '../store';

export type ToolbarControlProps = Omit<
  WithMapPropType,
  'controlLayout' | 'controlVisible'
>;

export function ToolbarControl(props: ToolbarControlProps) {
  const merged = { ...defaultMapProps, ...props };
  const { moduleContainerProps, mapId } = useMap(merged);
  const [buttons, setButtons] = useState<MapControlButtonState[]>([]);
  const toolbarStore = useMapToolbarStore(mapId);

  useEffect(() => {
    const store = createToolbarStoreApi(toolbarStore);
    const syncButtons = () => {
      // Clone so React re-renders when store mutates button objects in place
      setButtons(store.getAll().map((btn) => ({ ...btn })));
    };
    const unsub = store.subscribe(syncButtons);
    syncButtons();
    return () => {
      unsub();
    };
  }, [toolbarStore]);

  const grouped = new Map<string, MapControlButtonState[]>();
  for (const btn of buttons) {
    if (!btn.visible) continue;
    const key = btn.group ?? btn.id;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)?.push(btn);
  }

  return (
    <ModuleContainer
      {...moduleContainerProps}
      btn={
        <MapControlGroupButton row>
          {Array.from(grouped.entries()).map(([group, groupButtons]) => (
            <MapControlGroupButton key={group} row>
              {groupButtons.map((btn) => (
                <MapCommonButton
                  key={btn.id}
                  option={btn}
                  onClick={(e) => btn.action(e.nativeEvent)}
                />
              ))}
            </MapControlGroupButton>
          ))}
        </MapControlGroupButton>
      }
    />
  );
}
