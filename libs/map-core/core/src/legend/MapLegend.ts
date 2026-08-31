import {
  CircleLayerSpecification,
  FillLayerSpecification,
  LineLayerSpecification,
  Map,
  SymbolLayerSpecification,
} from 'maplibre-gl';
import { styleImageToDataURL } from '../utils/image';
import type { LegendElement, PropsLegendOption } from '../types/legend';
import Circle from './part/Circle';
import Fill from './part/Fill';
import Line from './part/Line';
import Symbol from './part/Symbol';
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
    if (!id) {
      return '';
    }
    const imageData = map.getImage(id);
    if (!imageData) {
      return '';
    }
    return styleImageToDataURL(id, imageData);
  };

  if (handler) {
    return handler({ layer, expr, image });
  }
  return null;
}
