import { useUniversalRegistry } from '@hungpvq/react-map-core';

type LegendEntry = {
  type: 'linear' | 'color' | 'text';
  value: Record<string, unknown>;
};

export function MultiLegend({
  legends = [],
  mapId,
}: {
  legends?: LegendEntry[];
  mapId?: string;
}) {
  const { getComponent } = useUniversalRegistry(mapId);
  return (
    <>
      {legends.map((legend, index) => {
        const Comp = getComponent(`legend-${legend.type}`);
        if (!Comp) return null;
        return <Comp key={index} value={legend.value} mapId={mapId} />;
      })}
    </>
  );
}
