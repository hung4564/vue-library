import { LIST_VIEW_MENU_COMPONENT_KEY } from '@hungpvq/map-dataset/menu';
import { useUniversalRegistry } from '@hungpvq/react-map-core';

type LegendType = 'linear' | 'color' | 'text';

const legendComponentKey = {
  linear: LIST_VIEW_MENU_COMPONENT_KEY.legendLinear,
  color: LIST_VIEW_MENU_COMPONENT_KEY.legendColor,
  text: LIST_VIEW_MENU_COMPONENT_KEY.legendText,
} as const;

type LegendEntry = {
  type: LegendType;
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
        const Comp = getComponent(legendComponentKey[legend.type]);
        if (!Comp) return null;
        return <Comp key={index} value={legend.value} mapId={mapId} />;
      })}
    </>
  );
}
