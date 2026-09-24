import {
  CircleLayerSpecification,
  FillLayerSpecification,
  LineLayerSpecification,
  Map,
  SymbolLayerSpecification,
} from 'maplibre-gl';

import { styleImageToDataURL } from '../image/utils';
import Circle from './part/Circle';
import Fill from './part/Fill';
import Line from './part/Line';
import Symbol from './part/Symbol';
import type { LegendElement, PropsLegendOption } from './types';
import { exprHandler } from './util';

type Layer =
  | FillLayerSpecification
  | LineLayerSpecification
  | SymbolLayerSpecification
  | CircleLayerSpecification;

type LayerType = Layer['type'];

export function MapLegend({
  map,
  zoom,
  layer,
}: {
  map: Map;
  zoom: number;
  layer: Layer;
}): LegendElement | null {
  const TYPE_MAP: Record<
    LayerType,
    (props: PropsLegendOption<any>) => LegendElement | null
  > = {
    circle: Circle,
    symbol: Symbol,
    line: Line,
    fill: Fill,
  } as const;

  const handler = TYPE_MAP[layer.type];
  const expr = exprHandler({ zoom });
  const image = (id: string) => {
    if (!id || !map) {
      return '';
    }
    try {
      // Map.getImage → this.style.getImage; style is null mid-swap / before load
      const imageData = map.getImage(id);
      if (!imageData) {
        return '';
      }
      return styleImageToDataURL(id, imageData);
    } catch {
      return '';
    }
  };

  if (handler) {
    return handler({ layer, expr, image });
  }
  return null;
}
