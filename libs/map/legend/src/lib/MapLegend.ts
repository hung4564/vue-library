import {
  CircleLayerSpecification,
  FillLayerSpecification,
  LineLayerSpecification,
  Map,
  StyleImage,
  SymbolLayerSpecification,
} from 'maplibre-gl';
import Circle from './part/Circle';
import Fill from './part/Fill';
import Line from './part/Line';
import Symbol from './part/Symbol';
import { PropsLegendOption } from './types';
import { exprHandler } from './util';
const cache: Record<string, string> = {};

type Layer =
  | FillLayerSpecification
  | LineLayerSpecification
  | SymbolLayerSpecification
  | CircleLayerSpecification;

type LayerType = Layer['type']; // "fill" | "line" | "symbol" | "circle"

export const MapLegend = ({
  map,
  zoom,
  layer,
}: {
  map: Map;
  zoom: number;
  layer: Layer;
}) => {
  const TYPE_MAP: Record<LayerType, (props: PropsLegendOption<any>) => any> = {
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
    if (cache[id]) {
      return cache[id];
    }
    const imageData = map.getImage(id);

    if (!imageData) {
      return '';
    }
    // Chuyển đổi dữ liệu của StyleImage thành ImageData
    const rgbaImage = imageData.data;
    const image = toImageDataFromRGBAImage(rgbaImage);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = rgbaImage.width;
    canvas.height = rgbaImage.height;

    // Vẽ ImageData vào canvas
    ctx.putImageData(image, 0, 0);

    const imageUrl = canvas.toDataURL('image/png');
    cache[id] = imageUrl;

    return imageUrl;
  };

  if (handler) {
    return handler({ layer, expr, image });
  } else {
    return null;
  }
};

function toImageDataFromRGBAImage(rgbaImage: StyleImage['data']): ImageData {
  const { width, height, data } = rgbaImage;

  const clampedData = new Uint8ClampedArray(data);

  return new ImageData(clampedData, width, height);
}
