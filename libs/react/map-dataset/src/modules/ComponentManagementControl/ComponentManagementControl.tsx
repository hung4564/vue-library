import type { WithMapPropType } from '@hungpvq/map-core';
import { defaultMapProps, RegistryItem, useMap } from '@hungpvq/react-map-core';
import { useMapDatasetComponent } from '../../store';

export function ComponentManagementControl(props: WithMapPropType) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId } = useMap(merged);
  const { getStore, removeComponent, version } = useMapDatasetComponent(mapId);
  const components = getStore().components;

  // `version` bumps when add/remove so this re-renders
  void version;

  return (
    <>
      {components.map((item) => (
        <RegistryItem
          key={item.id}
          mapId={mapId}
          componentKey={item.componentKey}
          {...item.attr}
          onClose={() => {
            removeComponent(item.id);
          }}
        />
      ))}
    </>
  );
}
