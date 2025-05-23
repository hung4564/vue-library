import { SymbolLayerSpecification } from 'maplibre-gl';
import { PropsLegendOption } from '../types';

function renderIconSymbol({
  expr,
  layer,
  image,
}: PropsLegendOption<SymbolLayerSpecification>) {
  const imgKey = expr(layer, 'layout', 'icon-image') as string;

  if (!imgKey) {
    return null;
  }
  const dataUrl = image(imgKey);
  if (dataUrl) {
    return {
      element: 'div',
      attributes: {
        style: {
          backgroundImage: `url(${dataUrl})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: '100%',
          height: '100%',
        },
      },
    };
  } else {
    return null;
  }
}

function renderTextSymbol({
  expr,
  layer,
}: PropsLegendOption<SymbolLayerSpecification>) {
  const textColor = expr(layer, 'paint', 'text-color');
  const textOpacity = expr(layer, 'paint', 'text-opacity');
  const textHaloColor = expr(layer, 'paint', 'text-halo-color');
  const textHaloWidth = expr(layer, 'paint', 'text-halo-width') as number;

  // A "T" shape to signify text
  const d = 'M 4,4 L 16,4 L 16,7 L 11.5 7 L 11.5 16 L 8.5 16 L 8.5 7 L 4 7 Z';

  return {
    element: 'svg',
    attributes: {
      viewBox: '0 0 20 20',
      xmlns: 'http://www.w3.org/2000/svg',
    },
    children: [
      {
        element: 'path',
        attributes: {
          key: 'l1',
          d: d,
          stroke: textHaloColor,
          'stroke-width': textHaloWidth * 2,
          fill: 'transparent',
          'stroke-linejoin': 'round',
        },
      },
      {
        element: 'path',
        attributes: {
          key: 'l2',
          d: d,
          fill: 'white',
        },
      },
      {
        element: 'path',
        attributes: {
          key: 'l3',
          d: d,
          fill: textColor,
          opacity: textOpacity,
        },
      },
    ],
  };
}

export default function Symbol(
  props: PropsLegendOption<SymbolLayerSpecification>
) {
  return renderIconSymbol(props) || renderTextSymbol(props);
}
